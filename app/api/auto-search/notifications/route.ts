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

// 알림 목록 조회
export async function GET() {
  try {
    const { data: notifications, error } = await supabase
      .from('auto_search_notifications')
      .select(`
        *,
        auto_search_configs (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('알림 조회 오류:', error);
    return NextResponse.json(
      { error: '알림을 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 새 알림 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      message,
      config_id,
      priority = 'normal'
    } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: '알림 타입, 제목, 메시지는 필수입니다.' },
        { status: 400 }
      );
    }

    const { data: notification, error } = await supabase
      .from('auto_search_notifications')
      .insert({
        type,
        title,
        message,
        config_id: config_id || null,
        priority,
        read: false
      })
      .select(`
        *,
        auto_search_configs (
          name
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      notification 
    });

  } catch (error) {
    console.error('알림 생성 오류:', error);
    return NextResponse.json(
      { error: '알림을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}
