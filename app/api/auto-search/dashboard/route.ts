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
    // 전체 설정 수 조회
    const { count: totalConfigs } = await supabase
      .from('auto_search_configs')
      .select('*', { count: 'exact', head: true });

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
    const totalResults = 0; // 검색 결과 수는 별도로 계산 필요

    // 최근 활동 조회 (auto_search_configs에서)
    const { data: recentActivity } = await supabase
      .from('auto_search_configs')
      .select(`
        id,
        name,
        last_run_at,
        success_count,
        error_count,
        run_count
      `)
      .order('last_run_at', { ascending: false })
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
      config_name: activity.name || 'Unknown',
      status: activity.error_count > 0 ? 'error' : 'success',
      started_at: activity.last_run_at,
      completed_at: activity.last_run_at,
      results_count: 0, // 검색 결과 수는 별도 계산 필요
      duration_ms: 0 // 실행 시간은 별도 계산 필요
    })) || [];

    const dashboardStats = {
      totalConfigs: totalConfigs || 0,
      activeConfigs: activeConfigs || 0,
      totalRuns,
      successRuns,
      errorRuns,
      totalResults,
      recentActivity: formattedRecentActivity,
      topConfigs: topConfigsWithRate
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
