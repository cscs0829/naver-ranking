import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // 실행 통계 조회
    const { data: runStats } = await supabase
      .from('auto_search_logs')
      .select('status, results_count');

    const totalRuns = runStats?.length || 0;
    const successRuns = runStats?.filter(log => log.status === 'success').length || 0;
    const errorRuns = runStats?.filter(log => log.status === 'error').length || 0;
    const totalResults = runStats?.reduce((sum, log) => sum + (log.results_count || 0), 0) || 0;

    // 최근 활동 조회 (최근 10개)
    const { data: recentActivity } = await supabase
      .from('auto_search_logs')
      .select(`
        id,
        status,
        started_at,
        completed_at,
        results_count,
        duration_ms,
        auto_search_configs (
          name
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
      config_name: (activity.auto_search_configs as any)?.name || 'Unknown',
      status: activity.status,
      started_at: activity.started_at,
      completed_at: activity.completed_at,
      results_count: activity.results_count || 0,
      duration_ms: activity.duration_ms
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
