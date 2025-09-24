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

// 모든 알림 삭제
export async function DELETE() {
  try {
    const { error } = await supabase
      .from('auto_search_notifications')
      .delete()
      .neq('id', 0); // 모든 알림 삭제

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      message: '모든 알림이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('모든 알림 삭제 오류:', error);
    return NextResponse.json(
      { error: '알림을 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}
