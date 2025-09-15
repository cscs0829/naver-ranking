import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // 스케줄별 최신 순위 결과 조회 (auto_search_results 테이블에서)
    const { data: latestRankings } = await supabase
      .from('auto_search_results')
      .select(`
        config_id,
        search_query,
        target_product_name,
        target_mall_name,
        target_brand,
        product_title,
        mall_name,
        brand,
        total_rank,
        page,
        rank_in_page,
        price,
        product_link,
        created_at,
        check_date,
        is_exact_match,
        match_confidence,
        auto_search_configs (
          id,
          name,
          is_active
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    // 스케줄별로 그룹화하여 최신 순위 결과 정리
    const scheduleRankings = latestRankings?.reduce((acc: any, result: any) => {
      const configId = result.config_id || (result.auto_search_configs as any)?.id;
      if (!configId) return acc;

      if (!acc[configId]) {
        acc[configId] = {
          config_id: configId,
          config_name: (result.auto_search_configs as any)?.name || 'Unknown',
          search_query: result.search_query,
          target_product_name: result.target_product_name,
          target_mall_name: result.target_mall_name,
          target_brand: result.target_brand,
          is_active: (result.auto_search_configs as any)?.is_active || false,
          latest_check: result.created_at,
          check_date: result.check_date,
          rankings: []
        };
      }

      acc[configId].rankings.push({
        product_title: result.product_title,
        mall_name: result.mall_name,
        brand: result.brand,
        total_rank: result.total_rank,
        page: result.page,
        rank_in_page: result.rank_in_page,
        price: result.price,
        product_link: result.product_link,
        checked_at: result.created_at,
        check_date: result.check_date,
        is_exact_match: result.is_exact_match,
        match_confidence: result.match_confidence
      });

      return acc;
    }, {}) || {};

    const dashboardStats = {
      totalConfigs: totalConfigs || 0,
      activeConfigs: activeConfigs || 0,
      totalRuns,
      successRuns,
      errorRuns,
      totalResults: totalResults || 0,
      recentActivity: formattedRecentActivity,
      topConfigs: topConfigsWithRate,
      scheduleRankings: Object.values(scheduleRankings)
    };

    return NextResponse.json(dashboardStats);

  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
