import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // 모든 키워드 분석 결과 조회
    const { data: results, error: resultsError } = await supabase
      .from('keyword_analysis_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (resultsError) {
      console.error('키워드 분석 결과 조회 오류:', resultsError);
      return NextResponse.json({ 
        success: false, 
        error: '키워드 분석 결과를 조회할 수 없습니다.' 
      }, { status: 500 });
    }

    if (!results || results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '내보낼 데이터가 없습니다.' 
      }, { status: 404 });
    }

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 각 분석 결과별로 시트 생성
    for (const result of results) {
      // 시트 데이터 준비
      const sheetData = result.results?.map((trendResult: any, trendIndex: number) => {
        return trendResult.data?.map((dataPoint: any, dataIndex: number) => ({
          '분석명': result.analysis_name || '',
          '시작일': result.start_date || '',
          '종료일': result.end_date || '',
          '시간단위': result.time_unit || '',
          '디바이스': result.device || '',
          '성별': result.gender || '',
          '연령대': Array.isArray(result.ages) ? result.ages.join(', ') : (result.ages || ''),
          '키워드제목': trendResult.title || '',
          '키워드': Array.isArray(trendResult.keyword) ? trendResult.keyword.join(', ') : (trendResult.keyword || ''),
          '기간': dataPoint.period || '',
          '비율': dataPoint.ratio || 0,
          '그룹': dataPoint.group || '',
          '생성일시': result.created_at ? new Date(result.created_at).toLocaleString('ko-KR') : ''
        })) || [];
      }).flat() || [];

      // 시트 생성
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      
      // 컬럼 너비 설정
      const colWidths = [
        { wch: 30 },  // 분석명
        { wch: 12 },  // 시작일
        { wch: 12 },  // 종료일
        { wch: 10 },  // 시간단위
        { wch: 10 },  // 디바이스
        { wch: 8 },   // 성별
        { wch: 15 },  // 연령대
        { wch: 30 },  // 키워드제목
        { wch: 40 },  // 키워드
        { wch: 15 },  // 기간
        { wch: 10 },  // 비율
        { wch: 15 },  // 그룹
        { wch: 20 }   // 생성일시
      ];
      worksheet['!cols'] = colWidths;

      // 시트명 설정 (특수문자 제거)
      const sheetName = result.analysis_name?.replace(/[\\\/\?\*\[\]]/g, '').substring(0, 31) || `분석_${result.id}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // 차트 데이터 시트 추가
    const chartDataSheet = XLSX.utils.json_to_sheet(
      results.map(result => ({
        '분석ID': result.id,
        '분석명': result.analysis_name || '',
        '키워드수': result.results?.length || 0,
        '데이터포인트수': result.results?.reduce((sum: number, trend: any) => sum + (trend.data?.length || 0), 0) || 0,
        '생성일시': result.created_at ? new Date(result.created_at).toLocaleString('ko-KR') : '',
        '업데이트일시': result.updated_at ? new Date(result.updated_at).toLocaleString('ko-KR') : ''
      }))
    );
    
    // 차트 데이터 시트 컬럼 너비 설정
    chartDataSheet['!cols'] = [
      { wch: 10 },  // 분석ID
      { wch: 30 },  // 분석명
      { wch: 10 },  // 키워드수
      { wch: 15 },  // 데이터포인트수
      { wch: 20 },  // 생성일시
      { wch: 20 }   // 업데이트일시
    ];
    
    XLSX.utils.book_append_sheet(workbook, chartDataSheet, '분석_요약');

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="키워드_분석_결과_${new Date().toISOString().split('T')[0]}.xlsx"`);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('키워드 분석 엑셀 내보내기 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '엑셀 파일 생성 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
