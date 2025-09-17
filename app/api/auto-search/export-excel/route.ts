import { NextRequest, NextResponse } from 'next/server';

// Node.js 런타임에서 실행 (XLSX 등 Node 전용 기능 사용을 위해 명시)
export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

// Node 런타임에서 서비스 롤 키로 서버용 Supabase 클라이언트 생성
const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

// XLSX 라이브러리를 동적으로 import
let XLSX: any;

export async function GET(request: NextRequest) {
  try {
    // XLSX 라이브러리 동적 import
    if (!XLSX) {
      XLSX = await import('xlsx');
    }

    if (!serverSupabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.' 
      }, { status: 500 });
    }

    // 특정 스케줄만 내보내기 위한 쿼리 파라미터
    const { searchParams } = new URL(request.url);
    const configIdParam = searchParams.get('configId');
    const targetConfigId = configIdParam ? Number(configIdParam) : null;

    // 스케줄 설정 조회 (특정 ID가 있으면 해당 스케줄만, 없으면 활성 스케줄 전부)
    const baseQuery = serverSupabase
      .from('auto_search_configs')
      .select('*')
      .order('search_query');

    const configsQuery = targetConfigId
      ? baseQuery.eq('id', targetConfigId)
      : baseQuery.eq('is_active', true);

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
    const workbook = XLSX.utils.book_new();

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

      if (!results || results.length === 0) {
        // 결과가 없는 경우 빈 시트 생성
        const emptySheetData = [{
          '검색어': config.search_query,
          '대상 상품명': config.target_product_name || '',
          '대상 쇼핑몰': config.target_mall_name || '',
          '대상 브랜드': config.target_brand || '',
          '메시지': '아직 검색 결과가 없습니다.'
        }];
        const worksheet = XLSX.utils.json_to_sheet(emptySheetData);
        
        // 시트명 설정 (검색어 기준)
        const sheetName = config.search_query.replace(/[\\\/\?\*\[\]]/g, '').substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        continue;
      }

      // 시트 데이터 준비 (히스토리 형식)
      const sheetData = results.map((result, index) => ({
        '순번': index + 1,
        '검색어': config.search_query,
        '대상 상품명': config.target_product_name || '',
        '대상 쇼핑몰': config.target_mall_name || '',
        '대상 브랜드': config.target_brand || '',
        '실행 일시': result.created_at ? new Date(result.created_at).toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) : '',
        '페이지': result.page || '',
        '페이지 내 순위': result.rank_in_page || '',
        '전체 순위': result.total_rank || '',
        '발견된 상품명': result.product_title || '',
        '발견된 쇼핑몰': result.mall_name || '',
        '발견된 브랜드': result.brand || '',
        '가격': result.price || '',
        '정확 매치': result.is_exact_match ? '예' : '아니오',
        '매치 신뢰도': result.match_confidence || '',
        '상품 링크': result.product_link || ''
      }));

      // 시트 생성
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      
      // 컬럼 너비 설정
      const colWidths = [
        { wch: 8 },   // 순번
        { wch: 30 },  // 검색어
        { wch: 30 },  // 대상 상품명
        { wch: 20 },  // 대상 쇼핑몰
        { wch: 20 },  // 대상 브랜드
        { wch: 25 },  // 실행 일시
        { wch: 8 },   // 페이지
        { wch: 12 },  // 페이지 내 순위
        { wch: 10 },  // 전체 순위
        { wch: 50 },  // 발견된 상품명
        { wch: 20 },  // 발견된 쇼핑몰
        { wch: 20 },  // 발견된 브랜드
        { wch: 15 },  // 가격
        { wch: 10 },  // 정확 매치
        { wch: 12 },  // 매치 신뢰도
        { wch: 50 }   // 상품 링크
      ];
      worksheet['!cols'] = colWidths;

      // 시트명 설정 (검색어 기준, 특수문자 제거)
      const sheetName = config.search_query.replace(/[\\\/\?\*\[\]]/g, '').substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // 엑셀 파일 생성 (Buffer 형태로 생성하여 Node 응답과 호환)
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      compression: true
    });

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
