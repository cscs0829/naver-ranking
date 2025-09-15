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

// 모든 알림 읽음 처리
export async function POST() {
  try {
    const { error } = await supabase
      .from('auto_search_notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      message: '모든 알림이 읽음 처리되었습니다.'
    });

  } catch (error) {
    console.error('모든 알림 읽음 처리 오류:', error);
    return NextResponse.json(
      { error: '알림을 읽음 처리할 수 없습니다.' },
      { status: 500 }
    );
  }
}
