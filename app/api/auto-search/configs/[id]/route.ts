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

// 자동 검색 설정 삭제 (관련된 모든 데이터 포함)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = parseInt(params.id);
    
    if (isNaN(configId)) {
      return NextResponse.json(
        { error: '유효하지 않은 설정 ID입니다.' },
        { status: 400 }
      );
    }

    console.log(`설정 ${configId} 삭제 시작...`);

    // 1. 해당 설정의 자동검색 결과 삭제
    const { error: resultsError, count: resultsCount } = await supabase
      .from('auto_search_results')
      .delete()
      .eq('config_id', configId)
      .select('*', { count: 'exact' });

    if (resultsError) {
      console.error('자동검색 결과 삭제 오류:', resultsError);
    } else {
      console.log(`자동검색 결과 ${resultsCount || 0}개 삭제 완료`);
    }

    // 2. 해당 설정의 로그 삭제
    const { error: logsError, count: logsCount } = await supabase
      .from('auto_search_logs')
      .delete()
      .eq('config_id', configId)
      .select('*', { count: 'exact' });

    if (logsError) {
      console.error('로그 삭제 오류:', logsError);
    } else {
      console.log(`로그 ${logsCount || 0}개 삭제 완료`);
    }

    // 3. 해당 설정의 알림 삭제
    const { error: notificationsError, count: notificationsCount } = await supabase
      .from('auto_search_notifications')
      .delete()
      .eq('config_id', configId)
      .select('*', { count: 'exact' });

    if (notificationsError) {
      console.error('알림 삭제 오류:', notificationsError);
    } else {
      console.log(`알림 ${notificationsCount || 0}개 삭제 완료`);
    }

    // 4. 마지막으로 설정 자체 삭제
    const { error: configError } = await supabase
      .from('auto_search_configs')
      .delete()
      .eq('id', configId);

    if (configError) {
      throw configError;
    }

    console.log(`설정 ${configId} 삭제 완료`);

    return NextResponse.json({ 
      success: true,
      message: `자동 검색 설정과 관련된 모든 데이터가 삭제되었습니다.`,
      deleted: {
        results: resultsCount || 0,
        logs: logsCount || 0,
        notifications: notificationsCount || 0,
        config: 1
      }
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
