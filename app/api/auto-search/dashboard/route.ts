import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 캐시 비활성화: 항상 최신 데이터를 반환
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

// 환경변수 체크
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

export async function GET() {
  try {
    console.log('대시보드 API 호출됨');
    
    // 🚀 최적화: 모든 기본 쿼리를 병렬로 실행 (Promise.all 사용)
    const [
      configsResult,
      resultsCountResult,
      recentActivityResult
    ] = await Promise.all([
      // 모든 설정 정보를 한 번에 조회 (통계 계산을 위해)
      supabase
        .from('auto_search_configs')
        .select('id, is_active, run_count, success_count, error_count, created_at, name, search_query, target_product_name, target_mall_name, target_brand'),
      
      // 검색 결과 수 조회
      supabase
        .from('auto_search_results')
        .select('*', { count: 'exact', head: true }),
      
      // 최근 활동 조회 (JOIN 포함)
      supabase
        .from('auto_search_logs')
        .select(`
          id,
          config_id,
          status,
          started_at,
          completed_at,
          duration_ms,
          results_count,
          error_message,
          auto_search_configs (
            id,
            name,
            search_query,
            target_product_name,
            target_mall_name,
            target_brand
          )
        `)
        .order('started_at', { ascending: false })
        .limit(10)
    ]);

    // 클라이언트에서 통계 계산 (데이터베이스 부하 감소)
    const configs = configsResult.data || [];
    const totalConfigs = configs.length;
    const activeConfigs = configs.filter(config => config.is_active).length;
    
    const totalRuns = configs.reduce((sum, config) => sum + (config.run_count || 0), 0);
    const successRuns = configs.reduce((sum, config) => sum + (config.success_count || 0), 0);
    const errorRuns = configs.reduce((sum, config) => sum + (config.error_count || 0), 0);

    // 상위 설정 계산 (클라이언트에서 정렬)
    const topConfigs = configs
      .sort((a, b) => (b.run_count || 0) - (a.run_count || 0))
      .slice(0, 5)
      .map(config => ({
        id: config.id,
        name: config.name,
        search_query: config.search_query,
        run_count: config.run_count,
        success_count: config.success_count,
        success_rate: config.run_count > 0 ? Math.round((config.success_count / config.run_count) * 100) : 0
      }));

    // 최근 활동 데이터 포맷 (실제 상품 개수 포함) - 최적화: 추가 쿼리 제거
    const formattedRecentActivity = (recentActivityResult.data || []).slice(0, 5).map((activity) => {
      return {
        id: activity.id,
        config_id: activity.config_id,
        config_name: (activity.auto_search_configs as any)?.name || 'Unknown',
        search_query: (activity.auto_search_configs as any)?.search_query || '',
        target_product_name: (activity.auto_search_configs as any)?.target_product_name || '',
        target_mall_name: (activity.auto_search_configs as any)?.target_mall_name || '',
        target_brand: (activity.auto_search_configs as any)?.target_brand || '',
        status: activity.status,
        started_at: activity.started_at,
        completed_at: activity.completed_at,
        results_count: activity.results_count || 0,
        actual_results_count: activity.results_count || 0, // 로그의 results_count를 그대로 사용
        duration_ms: activity.duration_ms || 0,
        error_message: activity.error_message
      };
    });

    // 활성 설정만 필터링 (최대 30개로 제한하여 성능 개선)
    const activeConfigsOnly = configs.filter(config => config.is_active).slice(0, 30);

    // 🚀 최적화: 활성 설정별 최신 결과 조회를 병렬로
    const scheduleRankingsPromises = activeConfigsOnly.map(async (config) => {
      // 최신 검색 실행의 모든 결과를 가져와서 페이지별로 정렬 (히스토리 모달과 동일한 로직)
      // 성능 최적화: 최근 100개 결과만 조회 (limit 추가)
      const { data: allResults, error: allResultsError } = await supabase
        .from('auto_search_results')
        .select(`
          total_rank,
          page,
          rank_in_page,
          product_title,
          mall_name,
          brand,
          price,
          product_link,
          created_at
        `)
        .eq('config_id', config.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (allResultsError || !allResults || allResults.length === 0) {
        return {
          config_id: config.id,
          config_name: config.name,
          search_query: config.search_query,
          target_product_name: config.target_product_name,
          target_mall_name: config.target_mall_name,
          target_brand: config.target_brand,
          is_active: config.is_active,
          latest_check: config.created_at,
          rankings: []
        };
      }

      // 최신 검색 시간 찾기 (초 단위로 그룹화 - 히스토리 API와 동일한 방식)
      const latestCheckTime = allResults[0].created_at;
      const latestCheckTimeKey = new Date(latestCheckTime).toISOString().slice(0, 19); // 초 단위로 동일 실행 묶음
      
      // 해당 시간의 모든 결과 필터링 (초 단위로 그룹화)
      const latestResults = allResults.filter(result => {
        const resultTimeKey = new Date(result.created_at).toISOString().slice(0, 19);
        return resultTimeKey === latestCheckTimeKey;
      });
      
      // 전체 순위로 정렬 (히스토리 모달과 동일한 로직)
      const sortedResults = latestResults.sort((a, b) => {
        return a.total_rank - b.total_rank;
      });

      // 디버깅: 모든 결과 로그 출력
      console.log(`설정 ${config.id} (${config.name}) - 모든 결과:`, sortedResults.map(r => ({
        total_rank: r.total_rank,
        page: r.page,
        rank_in_page: r.rank_in_page,
        product_title: r.product_title?.substring(0, 30) + '...'
      })));

      // 가장 높은 순위(가장 낮은 total_rank)의 상품 선택
      const bestResult = sortedResults.reduce((best, current) => {
        // total_rank가 낮은 것이 우선 (1위가 가장 좋음)
        return current.total_rank < best.total_rank ? current : best;
      }, sortedResults[0]);

      const configResults = bestResult ? [bestResult] : [];

      if (configResults && configResults.length > 0) {
        // 결과가 있는 설정 - total_rank가 가장 높은(낮은 숫자) 상품 표시
        console.log(`설정 ${config.id} (${config.name}): 선택된 상품 - total_rank: ${configResults[0].total_rank}, page: ${configResults[0].page}, rank_in_page: ${configResults[0].rank_in_page}, created_at: ${configResults[0].created_at}`);
        
        return {
          config_id: config.id,
          config_name: config.name,
          search_query: config.search_query,
          target_product_name: config.target_product_name,
          target_mall_name: config.target_mall_name,
          target_brand: config.target_brand,
          is_active: config.is_active,
          latest_check: configResults[0].created_at,
          total_products_count: latestResults.length, // 실제 상품 개수 추가
          rankings: configResults.map(result => ({
            total_rank: result.total_rank,
            page: result.page,
            rank_in_page: result.rank_in_page,
            product_title: result.product_title,
            mall_name: result.mall_name,
            brand: result.brand,
            price: result.price,
            product_link: result.product_link
          }))
        };
      } else {
        // 결과가 없는 설정 (빈 상태)
        return {
          config_id: config.id,
          config_name: config.name,
          search_query: config.search_query,
          target_product_name: config.target_product_name,
          target_mall_name: config.target_mall_name,
          target_brand: config.target_brand,
          is_active: config.is_active,
          latest_check: config.created_at,
          total_products_count: 0, // 실제 상품 개수 추가
          rankings: []
        };
      }
    });

    // 모든 활성 설정의 결과를 병렬로 조회
    const scheduleRankings = await Promise.all(scheduleRankingsPromises);

    console.log('활성 설정 수:', activeConfigsOnly.length);
    console.log('스케줄별 순위 결과 수:', scheduleRankings.length);
    
    // 각 스케줄별 상품 수 로깅
    if (scheduleRankings && scheduleRankings.length > 0) {
      console.log('각 스케줄별 상품 수:', scheduleRankings.map((schedule: any) => 
        `설정 ${schedule.config_id}: ${schedule.rankings.length}개 상품`
      ));
    }

    // 스케줄별 순위 결과를 최고 순위(가장 낮은 total_rank) 기준으로 정렬
    const sortedScheduleRankings = scheduleRankings.sort((a, b) => {
      // 각 스케줄의 최고 순위 상품 찾기
      const aBestRank = a.rankings && a.rankings.length > 0 
        ? Math.min(...a.rankings.map((r: any) => r.total_rank || 999999))
        : 999999;
      const bBestRank = b.rankings && b.rankings.length > 0 
        ? Math.min(...b.rankings.map((r: any) => r.total_rank || 999999))
        : 999999;
      
      return aBestRank - bBestRank; // 낮은 순위(더 좋은 순위)가 먼저 오도록
    });

    const dashboardStats = {
      totalConfigs: totalConfigs || 0,
      activeConfigs: activeConfigs || 0,
      totalRuns,
      successRuns,
      errorRuns,
      totalResults: resultsCountResult.count || 0,
      recentActivity: formattedRecentActivity,
      topConfigs: topConfigs,
      scheduleRankings: sortedScheduleRankings
    };

    return NextResponse.json(dashboardStats, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
