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

    // 모든 자동검색 관련 데이터 삭제
    const deletePromises = [
      // 자동검색 결과 삭제
      supabase.from('auto_search_results').delete().neq('id', 0),
      // 자동검색 로그 삭제
      supabase.from('auto_search_logs').delete().neq('id', 0),
      // 자동검색 알림 삭제
      supabase.from('auto_search_notifications').delete().neq('id', 0),
      // 자동검색 설정 삭제 (마지막에 삭제)
      supabase.from('auto_search_configs').delete().neq('id', 0)
    ];

    const results = await Promise.all(deletePromises);
    
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

    return NextResponse.json({ 
      success: true, 
      message: '모든 자동검색 데이터가 삭제되었습니다.' 
    });

  } catch (error) {
    console.error('전체 데이터 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
