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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lastCheck = searchParams.get('lastCheck');
    
    if (!lastCheck) {
      return NextResponse.json(
        { error: 'lastCheck 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const lastCheckDate = new Date(lastCheck);
    
    // auto_search_results 테이블에서 마지막 체크 이후 변경된 데이터가 있는지 확인
    const { data: recentResults, error: resultsError } = await supabase
      .from('auto_search_results')
      .select('created_at')
      .gt('created_at', lastCheckDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (resultsError) {
      console.error('최근 결과 조회 오류:', resultsError);
      return NextResponse.json(
        { error: '최근 결과를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // auto_search_logs 테이블에서 마지막 체크 이후 새로운 로그가 있는지 확인
    const { data: recentLogs, error: logsError } = await supabase
      .from('auto_search_logs')
      .select('created_at, status')
      .gt('created_at', lastCheckDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (logsError) {
      console.error('최근 로그 조회 오류:', logsError);
      return NextResponse.json(
        { error: '최근 로그를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // auto_search_configs 테이블에서 마지막 체크 이후 변경된 설정이 있는지 확인
    const { data: recentConfigs, error: configsError } = await supabase
      .from('auto_search_configs')
      .select('updated_at')
      .gt('updated_at', lastCheckDate.toISOString())
      .order('updated_at', { ascending: false })
      .limit(1);

    if (configsError) {
      console.error('최근 설정 조회 오류:', configsError);
      return NextResponse.json(
        { error: '최근 설정을 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    const hasUpdates = 
      (recentResults && recentResults.length > 0) ||
      (recentLogs && recentLogs.length > 0) ||
      (recentConfigs && recentConfigs.length > 0);

    const latestUpdate = [
      ...(recentResults || []),
      ...(recentLogs || []),
      ...(recentConfigs || [])
    ].sort((a, b) => 
      new Date(b.created_at || b.updated_at).getTime() - 
      new Date(a.created_at || a.updated_at).getTime()
    )[0];

    return NextResponse.json({
      hasUpdates,
      latestUpdate: latestUpdate ? (latestUpdate.created_at || latestUpdate.updated_at) : null,
      updateCount: {
        results: recentResults?.length || 0,
        logs: recentLogs?.length || 0,
        configs: recentConfigs?.length || 0
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

  } catch (error) {
    console.error('업데이트 확인 오류:', error);
    return NextResponse.json(
      { error: '업데이트를 확인할 수 없습니다.' },
      { status: 500 }
    );
  }
}
