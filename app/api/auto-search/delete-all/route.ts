import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.' 
      }, { status: 500 });
    }

    // 자동검색 데이터만 삭제 (설정은 유지)
    const deletePromises = [
      // 자동검색 결과 삭제
      supabase.from('auto_search_results').delete().neq('id', 0),
      // 자동검색 로그 삭제
      supabase.from('auto_search_logs').delete().neq('id', 0),
      // 자동검색 알림 삭제
      supabase.from('auto_search_notifications').delete().neq('id', 0)
    ];

    // 설정의 실행 통계 초기화 (설정은 유지하되 통계만 리셋)
    const resetConfigStats = supabase
      .from('auto_search_configs')
      .update({
        run_count: 0,
        success_count: 0,
        error_count: 0,
        last_run_at: null,
        last_error: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', 0);

    // 데이터 삭제 실행
    const results = await Promise.all(deletePromises);
    
    // 설정 통계 초기화 실행
    const resetResult = await resetConfigStats;
    
    // 에러 확인
    for (const result of results) {
      if (result.error) {
        console.error('데이터 삭제 오류:', result.error);
        return NextResponse.json({ 
          success: false, 
          error: '데이터 삭제 중 오류가 발생했습니다.' 
        }, { status: 500 });
      }
    }

    if (resetResult.error) {
      console.error('설정 통계 초기화 오류:', resetResult.error);
      return NextResponse.json({ 
        success: false, 
        error: '설정 통계 초기화 중 오류가 발생했습니다.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '모든 자동검색 데이터가 삭제되었습니다. (설정은 유지됨)' 
    });

  } catch (error) {
    console.error('전체 데이터 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
