import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 항상 최신 데이터 반환
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 환경변수 체크
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const limitParam = parseInt(searchParams.get('limit') || '300');
    const sinceDaysParam = parseInt(searchParams.get('sinceDays') || '0');
    const queryParam = searchParams.get('q') || '';
    const mallParam = searchParams.get('mall') || '';
    const brandParam = searchParams.get('brand') || '';
    const exactOnlyParam = searchParams.get('exactOnly') === 'true';
    const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSizeParam = Math.max(1, Math.min(500, parseInt(searchParams.get('pageSize') || '200')));

    const configId = parseInt(params.id);
    
    if (isNaN(configId)) {
      return NextResponse.json(
        { error: '유효하지 않은 설정 ID입니다.' },
        { status: 400 }
      );
    }

    // 설정 정보 조회
    const { data: config, error: configError } = await supabase
      .from('auto_search_configs')
      .select('id, name, search_query, target_product_name, target_mall_name, target_brand')
      .eq('id', configId)
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { error: '설정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 해당 설정의 검색 결과 조회 (최신 우선, 서버측 필터/페이징 적용)
    let resultsQuery = supabase
      .from('auto_search_results')
      .select(`
        id,
        created_at,
        check_date,
        page,
        rank_in_page,
        total_rank,
        product_title,
        mall_name,
        brand,
        price,
        product_link,
        is_exact_match,
        match_confidence
      `)
      .eq('config_id', configId)
      .order('created_at', { ascending: false });

    if (sinceDaysParam > 0) {
      const since = new Date();
      since.setDate(since.getDate() - sinceDaysParam);
      resultsQuery = resultsQuery.gte('created_at', since.toISOString());
    }

    if (queryParam) {
      resultsQuery = resultsQuery.ilike('product_title', `%${queryParam}%`);
    }
    if (mallParam) {
      resultsQuery = resultsQuery.ilike('mall_name', `%${mallParam}%`);
    }
    if (brandParam) {
      resultsQuery = resultsQuery.ilike('brand', `%${brandParam}%`);
    }
    if (exactOnlyParam) {
      resultsQuery = resultsQuery.eq('is_exact_match', true);
    }

    // 우선 페이지네이션 적용 (limit/offset 우선), 없으면 상한 limit 적용
    let paginatedQuery = resultsQuery;
    if (searchParams.has('page') || searchParams.has('pageSize')) {
      const from = (pageParam - 1) * pageSizeParam;
      const to = from + pageSizeParam - 1;
      paginatedQuery = paginatedQuery.range(from, to);
    } else {
      paginatedQuery = paginatedQuery.limit(Math.min(Math.max(1, limitParam), 1000));
    }

    const { data: results, error: resultsError, count } = await paginatedQuery;

    if (resultsError) {
      console.error('검색 결과 조회 오류:', resultsError);
      return NextResponse.json(
        { error: '검색 결과를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 실행 로그 조회 (실행 시간 정보)
    const { data: logs, error: logsError } = await supabase
      .from('auto_search_logs')
      .select(`
        id,
        status,
        started_at,
        completed_at,
        duration_ms,
        results_count,
        error_message
      `)
      .eq('config_id', configId)
      .order('started_at', { ascending: false });

    if (logsError) {
      console.error('실행 로그 조회 오류:', logsError);
    }

    // 날짜별로 그룹화하여 히스토리 데이터 구성 (실행 단위는 created_at(초 단위)로 구분)
    const historyByDate = results?.reduce((acc: any, result: any) => {
      const dateKey = result.check_date;
      const created = new Date(result.created_at);
      const execKey = created.toISOString().slice(0, 19); // 초 단위로 동일 실행 묶음
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          executions: []
        };
      }

      // 같은 실행 묶음 찾기 (초 단위 created_at 키)
      const existingExecution = acc[dateKey].executions.find((exec: any) => 
        exec.key === execKey
      );

      if (existingExecution) {
        existingExecution.results.push({
          id: result.id,
          time: result.created_at,
          page: result.page,
          rank_in_page: result.rank_in_page,
          total_rank: result.total_rank,
          product_title: result.product_title,
          mall_name: result.mall_name,
          brand: result.brand,
          price: result.price,
          product_link: result.product_link,
          is_exact_match: result.is_exact_match,
          match_confidence: result.match_confidence
        });
      } else {
        acc[dateKey].executions.push({
          key: execKey,
          timestamp: result.created_at,
          hour: created.getHours(),
          minute: created.getMinutes(),
          second: created.getSeconds(),
          results: [{
            id: result.id,
            time: result.created_at,
            page: result.page,
            rank_in_page: result.rank_in_page,
            total_rank: result.total_rank,
            product_title: result.product_title,
            mall_name: result.mall_name,
            brand: result.brand,
            price: result.price,
            product_link: result.product_link,
            is_exact_match: result.is_exact_match,
            match_confidence: result.match_confidence
          }]
        });
      }

      return acc;
    }, {}) || {};

    // 날짜별 정렬 (최신 날짜부터)
    const sortedHistory = Object.values(historyByDate).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // 각 날짜 내에서 시간순 정렬
    sortedHistory.forEach((dayData: any) => {
      dayData.executions.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        name: config.name,
        search_query: config.search_query,
        target_product_name: config.target_product_name,
        target_mall_name: config.target_mall_name,
        target_brand: config.target_brand
      },
      history: sortedHistory,
      logs: logs || [],
      totalResults: results?.length || 0
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

  } catch (error) {
    console.error('히스토리 조회 오류:', error);
    return NextResponse.json(
      { error: '히스토리를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
