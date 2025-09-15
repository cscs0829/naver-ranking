import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 알림 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;
    const body = await request.json();
    const { read } = body;

    const updateData: any = {};
    if (read !== undefined) updateData.read = read;

    const { data: notification, error } = await supabase
      .from('auto_search_notifications')
      .update(updateData)
      .eq('id', notificationId)
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
    console.error('알림 수정 오류:', error);
    return NextResponse.json(
      { error: '알림을 수정할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 알림 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;

    const { error } = await supabase
      .from('auto_search_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      message: '알림이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('알림 삭제 오류:', error);
    return NextResponse.json(
      { error: '알림을 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}
