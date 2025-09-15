import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 스케줄 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;
    const body = await request.json();
    const {
      name,
      search_query,
      target_mall_name,
      target_brand,
      target_product_name,
      cron_expression,
      is_active,
      description
    } = body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (search_query !== undefined) updateData.search_query = search_query;
    if (target_mall_name !== undefined) updateData.target_mall_name = target_mall_name;
    if (target_brand !== undefined) updateData.target_brand = target_brand;
    if (target_product_name !== undefined) updateData.target_product_name = target_product_name;
    if (cron_expression !== undefined) updateData.cron_expression = cron_expression;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (description !== undefined) updateData.description = description;

    const { data: schedule, error } = await supabase
      .from('auto_search_schedules')
      .update(updateData)
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      schedule 
    });

  } catch (error) {
    console.error('스케줄 수정 오류:', error);
    return NextResponse.json(
      { error: '스케줄을 수정할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 스케줄 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;

    const { error } = await supabase
      .from('auto_search_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      message: '스케줄이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('스케줄 삭제 오류:', error);
    return NextResponse.json(
      { error: '스케줄을 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 스케줄 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;

    const { data: schedule, error } = await supabase
      .from('auto_search_schedules')
      .select(`
        *,
        auto_search_logs (
          id,
          status,
          started_at,
          completed_at,
          duration_ms,
          results_count,
          error_message
        )
      `)
      .eq('id', scheduleId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ schedule });

  } catch (error) {
    console.error('스케줄 조회 오류:', error);
    return NextResponse.json(
      { error: '스케줄을 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
