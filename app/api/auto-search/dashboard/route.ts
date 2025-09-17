import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 캐시 비활성화: 항상 최신 데이터를 반환
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    
    // 전체 설정 수 조회
    const { count: totalConfigs, error: totalConfigsError } = await supabase
      .from('auto_search_configs')
      .select('*', { count: 'exact', head: true });
    
    console.log('전체 설정 수:', totalConfigs, '오류:', totalConfigsError);

    // 활성 설정 수 조회
    const { count: activeConfigs } = await supabase
      .from('auto_search_configs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 실행 통계 조회 (auto_search_configs에서)
    const { data: configStats } = await supabase
      .from('auto_search_configs')
      .select('run_count, success_count, error_count');

    const totalRuns = configStats?.reduce((sum, config) => sum + (config.run_count || 0), 0) || 0;
    const successRuns = configStats?.reduce((sum, config) => sum + (config.success_count || 0), 0) || 0;
    const errorRuns = configStats?.reduce((sum, config) => sum + (config.error_count || 0), 0) || 0;

    // 검색 결과 수 조회 (auto_search_results 테이블에서)
    const { count: totalResults } = await supabase
      .from('auto_search_results')
      .select('*', { count: 'exact', head: true });

    // 최근 활동 조회 (auto_search_logs에서)
    const { data: recentActivity } = await supabase
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
      .limit(10);

    // 상위 설정 조회 (실행 횟수 기준 상위 5개)
    const { data: topConfigs } = await supabase
      .from('auto_search_configs')
      .select('id, name, search_query, run_count, success_count')
      .order('run_count', { ascending: false })
      .limit(5);

    // 성공률 계산
    const topConfigsWithRate = topConfigs?.map(config => ({
      ...config,
      success_rate: config.run_count > 0 ? Math.round((config.success_count / config.run_count) * 100) : 0
    })) || [];

    // 최근 활동 데이터 포맷
    const formattedRecentActivity = recentActivity?.map(activity => ({
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
      duration_ms: activity.duration_ms || 0,
      error_message: activity.error_message
    })) || [];

    // 모든 활성화된 설정 조회
    const { data: allActiveConfigs, error: configsError } = await supabase
      .from('auto_search_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // 각 설정별로 최신 순위 결과 조회 (최신 1개, 최소 컬럼만)
    let scheduleRankingsData: any = {};
    
    if (allActiveConfigs && allActiveConfigs.length > 0) {
      for (const config of allActiveConfigs) {
        const { data: configResults, error: resultsError } = await supabase
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
          .limit(1);

        if (!resultsError && configResults) {
          // 결과가 있는 설정
          if (configResults.length > 0) {
            scheduleRankingsData[config.id] = {
              config_id: config.id,
              config_name: config.name,
              search_query: config.search_query,
              target_product_name: config.target_product_name,
              target_mall_name: config.target_mall_name,
              target_brand: config.target_brand,
              is_active: config.is_active,
              latest_check: configResults[0].created_at,
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
          }
          // 결과가 없는 설정은 scheduleRankingsData에 포함하지 않음 (히스토리가 없는 스케줄 숨김)
        }
      }
    }

    const latestRankings = Object.values(scheduleRankingsData);

    console.log('활성 설정 수:', allActiveConfigs?.length || 0);
    console.log('스케줄별 순위 결과 수:', latestRankings?.length || 0);
    
    // 각 스케줄별 상품 수 로깅
    if (latestRankings && latestRankings.length > 0) {
      console.log('각 스케줄별 상품 수:', latestRankings.map((schedule: any) => 
        `설정 ${schedule.config_id}: ${schedule.rankings.length}개 상품`
      ));
    }

    const scheduleRankings = latestRankings || [];

    const dashboardStats = {
      totalConfigs: totalConfigs || 0,
      activeConfigs: activeConfigs || 0,
      totalRuns,
      successRuns,
      errorRuns,
      totalResults: totalResults || 0,
      recentActivity: formattedRecentActivity,
      topConfigs: topConfigsWithRate,
      scheduleRankings: scheduleRankings
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
