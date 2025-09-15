import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 스케줄 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      search_query,
      target_mall_name,
      target_brand,
      target_product_name,
      cron_expression,
      description
    } = body;

    if (!name || !search_query) {
      return NextResponse.json(
        { error: '이름과 검색어는 필수입니다.' },
        { status: 400 }
      );
    }

    // next_run_at 계산 (간단한 구현)
    const now = new Date();
    let nextRun = new Date(now);
    
    // cron 표현식에 따른 다음 실행 시간 계산 (기본: 2시간 후)
    if (cron_expression === '0 */1 * * *') {
      nextRun.setHours(nextRun.getHours() + 1);
    } else if (cron_expression === '0 */2 * * *') {
      nextRun.setHours(nextRun.getHours() + 2);
    } else if (cron_expression === '0 */6 * * *') {
      nextRun.setHours(nextRun.getHours() + 6);
    } else if (cron_expression === '0 */12 * * *') {
      nextRun.setHours(nextRun.getHours() + 12);
    } else if (cron_expression === '0 0 * * *') {
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(0, 0, 0, 0);
    } else if (cron_expression === '0 0 * * 0') {
      // 다음 일요일 계산
      const daysUntilSunday = (7 - nextRun.getDay()) % 7;
      nextRun.setDate(nextRun.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
      nextRun.setHours(0, 0, 0, 0);
    } else if (cron_expression === '0 0 1 * *') {
      // 다음 달 1일 계산
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(1);
      nextRun.setHours(0, 0, 0, 0);
    } else {
      // 기본값: 2시간 후
      nextRun.setHours(nextRun.getHours() + 2);
    }

    const { data: schedule, error } = await supabase
      .from('auto_search_schedules')
      .insert({
        name,
        search_query,
        target_mall_name,
        target_brand,
        target_product_name,
        cron_expression: cron_expression || '0 */2 * * *',
        next_run_at: nextRun.toISOString(),
        description
      })
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
    console.error('스케줄 생성 오류:', error);
    return NextResponse.json(
      { error: '스케줄을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 스케줄 목록 조회
export async function GET() {
  try {
    const { data: schedules, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('스케줄 조회 오류:', error);
    return NextResponse.json(
      { error: '스케줄을 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
