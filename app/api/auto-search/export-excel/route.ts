import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase 클라이언트가 초기화되지 않았습니다.' 
      }, { status: 500 });
    }

    // 모든 스케줄 설정 조회
    const { data: configs, error: configsError } = await supabase
      .from('auto_search_configs')
      .select('*')
      .order('name');

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

    // 각 스케줄별로 시트 생성
    for (const config of configs) {
      // 해당 스케줄의 검색 결과 조회
      const { data: results, error: resultsError } = await supabase
        .from('search_results')
        .select('*')
        .eq('search_query', config.search_query)
        .order('created_at', { ascending: false });

      if (resultsError) {
        console.error(`스케줄 ${config.id} 결과 조회 오류:`, resultsError);
        continue;
      }

      // 시트 데이터 준비
      const sheetData = results?.map((result, index) => ({
        '순번': index + 1,
        '상품명': result.product_title || '',
        '쇼핑몰': result.mall_name || '',
        '브랜드': result.brand || '',
        '가격': result.price || '',
        '전체순위': result.total_rank || '',
        '페이지': result.page || '',
        '페이지내순위': result.rank_in_page || '',
        '상품링크': result.product_link || '',
        '검색일시': result.created_at ? new Date(result.created_at).toLocaleString('ko-KR') : '',
        '검색어': result.search_query || '',
        '대상상품명': result.target_product_name || '',
        '대상쇼핑몰': result.target_mall_name || '',
        '대상브랜드': result.target_brand || ''
      })) || [];

      // 시트 생성
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      
      // 컬럼 너비 설정
      const colWidths = [
        { wch: 8 },   // 순번
        { wch: 50 },  // 상품명
        { wch: 20 },  // 쇼핑몰
        { wch: 20 },  // 브랜드
        { wch: 15 },  // 가격
        { wch: 10 },  // 전체순위
        { wch: 8 },   // 페이지
        { wch: 12 },  // 페이지내순위
        { wch: 50 },  // 상품링크
        { wch: 20 },  // 검색일시
        { wch: 30 },  // 검색어
        { wch: 30 },  // 대상상품명
        { wch: 20 },  // 대상쇼핑몰
        { wch: 20 }   // 대상브랜드
      ];
      worksheet['!cols'] = colWidths;

      // 시트명 설정 (특수문자 제거)
      const sheetName = config.name.replace(/[\\\/\?\*\[\]]/g, '').substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="자동검색_결과_${new Date().toISOString().split('T')[0]}.xlsx"`);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('엑셀 내보내기 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '엑셀 파일 생성 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
