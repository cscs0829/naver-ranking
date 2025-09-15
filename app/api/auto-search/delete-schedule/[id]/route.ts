import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.' 
      }, { status: 500 });
    }

    const configId = parseInt(params.id);
    
    if (isNaN(configId)) {
      return NextResponse.json({ 
        success: false, 
        error: '유효하지 않은 설정 ID입니다.' 
      }, { status: 400 });
    }

    // 해당 설정의 검색 결과 삭제
    const { error: resultsError } = await supabase
      .from('search_results')
      .delete()
      .eq('search_query', (await supabase
        .from('auto_search_configs')
        .select('search_query')
        .eq('id', configId)
        .single()
      ).data?.search_query);

    if (resultsError) {
      console.error('검색 결과 삭제 오류:', resultsError);
    }

    // 해당 설정의 로그 삭제
    const { error: logsError } = await supabase
      .from('auto_search_logs')
      .delete()
      .eq('config_id', configId);

    if (logsError) {
      console.error('로그 삭제 오류:', logsError);
    }

    // 설정 자체는 삭제하지 않음 (사용자가 원할 경우 별도로 삭제)

    return NextResponse.json({ 
      success: true, 
      message: '스케줄 데이터가 삭제되었습니다.' 
    });

  } catch (error) {
    console.error('스케줄 데이터 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
