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

// 자동 검색 설정 생성
export async function POST(request: NextRequest) {
  try {
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
      description
    } = body;

    if (!name || !search_query) {
      return NextResponse.json(
        { error: '이름과 검색어는 필수입니다.' },
        { status: 400 }
      );
    }

    const { data: config, error } = await supabase
      .from('auto_search_configs')
      .insert({
        name,
        search_query,
        target_mall_name,
        target_brand,
        target_product_name,
        max_pages: max_pages || 10,
        profile_id: profile_id || null,
        interval_hours: parseFloat(interval_hours) || 2.00,
        description
      })
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
    console.error('자동 검색 설정 생성 오류:', error);
    return NextResponse.json(
      { error: '자동 검색 설정을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 자동 검색 설정 목록 조회
export async function GET() {
  try {
    const { data: configs, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ configs });
  } catch (error) {
    console.error('자동 검색 설정 조회 오류:', error);
    return NextResponse.json(
      { error: '자동 검색 설정을 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
