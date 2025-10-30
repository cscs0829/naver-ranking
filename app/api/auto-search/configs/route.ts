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

    // interval_hours 유효성 검사
    if (interval_hours && (interval_hours < 0.5 || interval_hours > 8760)) {
      return NextResponse.json(
        { error: '실행 주기는 0.5시간부터 8760시간(1년) 사이여야 합니다.' },
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
        interval_hours: interval_hours ? parseFloat(interval_hours.toString()) : 6,
        description
      })
      .select('*')
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
    console.log('자동 검색 설정 조회 시작');
    
    // 먼저 테이블 존재 여부 확인
    const { data: tableCheck, error: tableError } = await supabase
      .from('auto_search_configs')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('테이블 확인 오류:', tableError);
      return NextResponse.json(
        { error: `테이블 오류: ${tableError.message}` },
        { status: 500 }
      );
    }

    console.log('테이블 확인 완료, 설정 조회 시작');

    const { data: configs, error } = await supabase
      .from('auto_search_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('설정 조회 오류:', error);
      throw error;
    }

    console.log('설정 조회 성공:', configs?.length || 0, '개');
    return NextResponse.json({ configs });
  } catch (error) {
    console.error('자동 검색 설정 조회 오류:', error);
    return NextResponse.json(
      { error: `자동 검색 설정을 조회할 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    );
  }
}
