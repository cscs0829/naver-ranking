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
    console.log('디버그 정보 조회 시작');
    
    // 1. 설정 테이블 확인
    const { data: configs, error: configsError } = await supabase
      .from('auto_search_configs')
      .select('id, name, search_query, is_active, run_count, success_count')
      .order('created_at', { ascending: false });

    console.log('설정 데이터:', configs);
    console.log('설정 에러:', configsError);

    // 2. 결과 테이블 확인
    const { data: results, error: resultsError } = await supabase
      .from('auto_search_results')
      .select('config_id, search_query, product_title, total_rank, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('결과 데이터:', results);
    console.log('결과 에러:', resultsError);
    
    // 결과 데이터 상세 분석
    if (results && results.length > 0) {
      const configIds = results.map(r => r.config_id);
      const uniqueConfigIds = new Set(configIds);
      console.log('결과 데이터의 config_id들:', configIds);
      console.log('고유한 config_id 개수:', uniqueConfigIds.size);
      console.log('각 config_id별 결과 수:', Array.from(uniqueConfigIds).map(id => 
        `${id}: ${configIds.filter(cid => cid === id).length}개`
      ));
    }

    // 3. 로그 테이블 확인
    const { data: logs, error: logsError } = await supabase
      .from('auto_search_logs')
      .select('config_id, status, started_at, completed_at, results_count, error_message')
      .order('started_at', { ascending: false })
      .limit(10);

    console.log('로그 데이터:', logs);
    console.log('로그 에러:', logsError);

    // 4. 테이블 존재 여부 확인
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['auto_search_configs', 'auto_search_results', 'auto_search_logs']);

    console.log('테이블 존재 여부:', tables);
    console.log('테이블 조회 에러:', tablesError);

    return NextResponse.json({
      success: true,
      debug: {
        configs: {
          count: configs?.length || 0,
          data: configs,
          error: configsError?.message
        },
        results: {
          count: results?.length || 0,
          data: results,
          error: resultsError?.message
        },
        logs: {
          count: logs?.length || 0,
          data: logs,
          error: logsError?.message
        },
        tables: {
          data: tables,
          error: tablesError?.message
        }
      }
    });

  } catch (error) {
    console.error('디버그 정보 조회 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        debug: null
      },
      { status: 500 }
    );
  }
}
