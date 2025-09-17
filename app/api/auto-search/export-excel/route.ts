import { NextRequest, NextResponse } from 'next/server';

// Node.js 런타임에서 실행 (ExcelJS 등 Node 전용 기능 사용을 위해 명시)
export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

// Node 런타임에서 서비스 롤 키로 서버용 Supabase 클라이언트 생성
const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

// ExcelJS 라이브러리를 동적으로 import
let ExcelJS: any;

export async function GET(request: NextRequest) {
  try {
    // ExcelJS 라이브러리 동적 import
    if (!ExcelJS) {
      ExcelJS = await import('exceljs');
    }

    if (!serverSupabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.' 
      }, { status: 500 });
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const configIdParam = searchParams.get('configId');
    const searchQuery = searchParams.get('searchQuery');
    const targetProduct = searchParams.get('targetProduct');
    const targetMall = searchParams.get('targetMall');
    const targetBrand = searchParams.get('targetBrand');
    
    const targetConfigId = configIdParam ? Number(configIdParam) : null;

    // 스케줄 설정 조회 (필터 적용)
    let configsQuery = serverSupabase
      .from('auto_search_configs')
      .select('*')
      .order('search_query');

    // 특정 스케줄 ID가 있으면 해당 스케줄만
    if (targetConfigId) {
      configsQuery = configsQuery.eq('id', targetConfigId);
    } else {
      // 활성 스케줄만 조회
      configsQuery = configsQuery.eq('is_active', true);
    }

    // 필터 적용
    if (searchQuery) {
      configsQuery = configsQuery.ilike('search_query', `%${searchQuery}%`);
    }
    if (targetProduct) {
      configsQuery = configsQuery.ilike('target_product_name', `%${targetProduct}%`);
    }
    if (targetMall) {
      configsQuery = configsQuery.ilike('target_mall_name', `%${targetMall}%`);
    }
    if (targetBrand) {
      configsQuery = configsQuery.ilike('target_brand', `%${targetBrand}%`);
    }

    const { data: configs, error: configsError } = await configsQuery as any;

    if (configsError) {
      console.error('설정 조회 오류:', configsError);
      return NextResponse.json({ 
        success: false, 
        error: '설정을 조회할 수 없습니다.' 
      }, { status: 500 });
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '내보낼 데이터가 없습니다.' 
      }, { status: 404 });
    }

    // 워크북 생성
    const workbook = new ExcelJS.Workbook();

    // 각 스케줄별로 시트 생성 (검색어 기준으로 그룹화)
    for (const config of configs) {
      // 해당 스케줄의 검색 결과 조회 (히스토리 순서로)
      const { data: results, error: resultsError } = await serverSupabase
        .from('auto_search_results')
        .select(`
          product_title,
          mall_name,
          brand,
          total_rank,
          page,
          rank_in_page,
          price,
          product_link,
          created_at,
          check_date,
          is_exact_match,
          match_confidence
        `)
        .eq('config_id', config.id)
        .order('created_at', { ascending: true }); // 시간순으로 정렬

      if (resultsError) {
        console.error(`스케줄 ${config.id} 결과 조회 오류:`, resultsError);
        continue;
      }

      // 시트명 설정 (검색어 기준, 특수문자 제거)
      const sheetName = config.search_query.replace(/[\\\/\?\*\[\]:]/g, '').substring(0, 31);
      const worksheet = workbook.addWorksheet(sheetName);

      if (!results || results.length === 0) {
        // 결과가 없는 경우 빈 시트 생성
        worksheet.columns = [
          { header: '검색어', key: 'searchQuery', width: 30 },
          { header: '대상 상품명', key: 'targetProduct', width: 30 },
          { header: '대상 쇼핑몰', key: 'targetMall', width: 20 },
          { header: '대상 브랜드', key: 'targetBrand', width: 20 },
          { header: '메시지', key: 'message', width: 50 }
        ];

        worksheet.addRow({
          searchQuery: config.search_query,
          targetProduct: config.target_product_name || '',
          targetMall: config.target_mall_name || '',
          targetBrand: config.target_brand || '',
          message: '아직 검색 결과가 없습니다.'
        });
        continue;
      }

      // 컬럼 정의
      worksheet.columns = [
        { header: '순번', key: 'sequence', width: 8 },
        { header: '검색어', key: 'searchQuery', width: 30 },
        { header: '대상 상품명', key: 'targetProduct', width: 30 },
        { header: '대상 쇼핑몰', key: 'targetMall', width: 20 },
        { header: '대상 브랜드', key: 'targetBrand', width: 20 },
        { header: '실행 일시', key: 'executedAt', width: 25 },
        { header: '페이지', key: 'page', width: 8 },
        { header: '페이지 내 순위', key: 'rankInPage', width: 12 },
        { header: '전체 순위', key: 'totalRank', width: 10 },
        { header: '발견된 상품명', key: 'productTitle', width: 50 },
        { header: '발견된 쇼핑몰', key: 'mallName', width: 20 },
        { header: '발견된 브랜드', key: 'brand', width: 20 },
        { header: '가격', key: 'price', width: 15 },
        { header: '정확 매치', key: 'isExactMatch', width: 10 },
        { header: '매치 신뢰도', key: 'matchConfidence', width: 12 },
        { header: '상품 링크', key: 'productLink', width: 50 }
      ];

      // 데이터 행 추가
      results.forEach((result, index) => {
        worksheet.addRow({
          sequence: index + 1,
          searchQuery: config.search_query,
          targetProduct: config.target_product_name || '',
          targetMall: config.target_mall_name || '',
          targetBrand: config.target_brand || '',
          executedAt: result.created_at ? new Date(result.created_at).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }) : '',
          page: result.page || '',
          rankInPage: result.rank_in_page || '',
          totalRank: result.total_rank || '',
          productTitle: result.product_title || '',
          mallName: result.mall_name || '',
          brand: result.brand || '',
          price: result.price || '',
          isExactMatch: result.is_exact_match ? '예' : '아니오',
          matchConfidence: result.match_confidence || '',
          productLink: result.product_link || ''
        });
      });
    }

    // 엑셀 파일 생성 (Buffer 형태로 생성하여 Node 응답과 호환)
    const excelBuffer = await workbook.xlsx.writeBuffer();

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="auto_search_results_${new Date().toISOString().split('T')[0]}.xlsx"`);

    // Buffer 본문으로 반환 (NextResponse 사용)
    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('엑셀 내보내기 오류:', error);
    console.error('오류 상세:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      success: false, 
      error: '엑셀 파일 생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
