import { NextRequest, NextResponse } from 'next/server'
import { NaverSearchTrends } from '@/utils/naver-insights'
import { supabase, checkSupabaseConfig } from '@/utils/supabase'
import { getActiveProfile } from '@/utils/api-keys'

export async function POST(request: NextRequest) {
  try {
    checkSupabaseConfig()
    const body = await request.json()
    console.log('키워드 분석 요청 데이터:', JSON.stringify(body, null, 2))
    
    const {
      startDate,
      endDate,
      timeUnit,
      category,
      keywords,
      device,
      gender,
      ages,
      profileId
    } = body

    if (!startDate || !endDate || !timeUnit || !keywords) {
      console.error('필수 파라미터 누락:', { startDate, endDate, timeUnit, category, keywords })
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 키워드 유효성 검사 (쉼표 파싱 후 빈값 제거)
    const normalizedKeywords = Array.isArray(keywords)
      ? keywords.map((k: any) => ({
          name: k.name || '검색어',
          param: (k.param || []).flatMap((p: string) => String(p).split(',')).map((s: string) => s.trim()).filter((s: string) => s).slice(0, 5)
        }))
      : []

    const validKeywords = normalizedKeywords.filter((k: any) => k.param && k.param.length > 0)
    if (validKeywords.length === 0) {
      console.error('유효한 키워드가 없습니다:', keywords)
      return NextResponse.json(
        { error: '최소 하나 이상의 유효한 키워드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // API 키 프로필 조회
    console.log('API 키 조회:', { profileId, apiType: 'insights' })
    const naverKeys = profileId ? await getActiveProfile(Number(profileId), 'insights') : await getActiveProfile(undefined, 'insights')
    console.log('조회된 API 키:', naverKeys ? '있음' : '없음')
    
    if (!naverKeys) {
      console.error('API 키 조회 실패')
      return NextResponse.json(
        { error: '네이버 쇼핑인사이트 API 키를 데이터베이스에서 가져올 수 없습니다.' },
        { status: 500 }
      )
    }

    const searchTrends = new NaverSearchTrends(
      naverKeys.clientId,
      naverKeys.clientSecret
    )

    // 네이버 쇼핑인사이트 호출
    // 날짜 가드: DataLab은 2017-08-01부터 조회 가능 (응답에서도 사용하므로 스코프 상단에서 계산)
    const minDate = '2017-08-01'
    const safeStart = startDate < minDate ? minDate : startDate
    const safeEnd = endDate < safeStart ? safeStart : endDate
    let result
    try {
      // 검색어 트렌드로 전환: category는 사용하지 않음
      result = await searchTrends.getSearchTrends(
        safeStart,
        safeEnd,
        timeUnit,
        validKeywords,
        device,
        gender,
        ages
      )
    } catch (err: any) {
      console.error('네이버 인사이트 호출 예외:', err?.response?.data || err?.message || err)
      return NextResponse.json(
        { error: '네이버 쇼핑인사이트 API 호출 실패', detail: err?.response?.data || err?.message || String(err) },
        { status: 502 }
      )
    }

    if (!result) {
      return NextResponse.json(
        { error: '키워드 트렌드 분석에 실패했습니다.' },
        { status: 500 }
      )
    }

    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }

    const analysisName = `키워드 분석 ${new Date().toLocaleString('ko-KR')}`
    const analysisData = {
      analysis_name: analysisName,
      start_date: startDate,
      end_date: endDate,
      time_unit: timeUnit,
      category: category ? JSON.stringify(category) : JSON.stringify([]),
      keywords: JSON.stringify(validKeywords),
      device: device || null,
      gender: gender || null,
      ages: ages ? JSON.stringify(ages) : null,
      results: JSON.stringify(result.results),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: insertError } = await supabase
      .from('keyword_analysis_results')
      .insert([analysisData])

    if (insertError) {
      console.error('키워드 분석 결과 저장 오류:', insertError)
      return NextResponse.json(
        { error: '키워드 분석 결과 저장에 실패했습니다.', detail: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      count: result.results.length, 
      results: result.results,
      data: result,
      range: { start: safeStart, end: safeEnd }
    }, { status: 200 })
  } catch (error: any) {
    console.error('키워드 분석 API 오류:', error?.response?.data || error?.message || error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', detail: error?.response?.data || error?.message || String(error) },
      { status: 500 }
    )
  }
}
