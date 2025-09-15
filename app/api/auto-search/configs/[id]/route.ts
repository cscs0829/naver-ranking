import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 자동 검색 설정 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;
    const body = await request.json();
    const {
      name,
      search_query,
      target_mall_name,
      target_brand,
      target_product_name,
      max_pages,
      profile_id,
      interval_hours,
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
    if (max_pages !== undefined) updateData.max_pages = max_pages;
    if (profile_id !== undefined) updateData.profile_id = profile_id;
    if (interval_hours !== undefined) updateData.interval_hours = interval_hours;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (description !== undefined) updateData.description = description;

    const { data: config, error } = await supabase
      .from('auto_search_configs')
      .update(updateData)
      .eq('id', configId)
      .select(`
        *,
        api_key_profiles (
          id,
          name,
          client_id,
          is_active
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      config 
    });

  } catch (error) {
    console.error('자동 검색 설정 수정 오류:', error);
    return NextResponse.json(
      { error: '자동 검색 설정을 수정할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 자동 검색 설정 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;

    const { error } = await supabase
      .from('auto_search_configs')
      .delete()
      .eq('id', configId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      message: '자동 검색 설정이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('자동 검색 설정 삭제 오류:', error);
    return NextResponse.json(
      { error: '자동 검색 설정을 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 자동 검색 설정 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;

    const { data: config, error } = await supabase
      .from('auto_search_configs')
      .select(`
        *,
        api_key_profiles (
          id,
          name,
          client_id,
          is_active
        ),
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
      .eq('id', configId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ config });

  } catch (error) {
    console.error('자동 검색 설정 조회 오류:', error);
    return NextResponse.json(
      { error: '자동 검색 설정을 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
