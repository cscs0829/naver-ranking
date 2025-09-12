import { NextRequest, NextResponse } from 'next/server'
import { NaverShoppingInsights } from '@/utils/naver-insights'
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

    if (!startDate || !endDate || !timeUnit || !category || !keywords) {
      console.error('필수 파라미터 누락:', { startDate, endDate, timeUnit, category, keywords })
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 키워드 유효성 검사
    const validKeywords = keywords.filter((k: any) => k && k.param && k.param.length > 0 && k.param.some((keyword: string) => keyword.trim().length > 0))
    if (validKeywords.length === 0) {
      console.error('유효한 키워드가 없습니다:', keywords)
      return NextResponse.json(
        { error: '최소 하나 이상의 유효한 키워드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 쇼핑인사이트 API 타입의 기본 프로필 사용
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

    // 네이버 쇼핑인사이트 API 클라이언트 초기화
    const insights = new NaverShoppingInsights(
      naverKeys.clientId,
      naverKeys.clientSecret
    )

    // 키워드 트렌드 분석 (유효한 키워드만 사용)
    const result = await insights.getCategoryKeywordTrends(
      startDate,
      endDate,
      timeUnit,
      category,
      validKeywords,
      device,
      gender,
      ages
    )

    if (!result) {
      return NextResponse.json(
        { error: '키워드 트렌드 분석에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 분석 결과를 데이터베이스에 저장
    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }

    const analysisName = `키워드 분석 ${new Date().toLocaleString('ko-KR')}`
    const analysisData = {
      analysis_name: analysisName,
      start_date: startDate,
      end_date: endDate,
      time_unit: timeUnit,
      category: JSON.stringify(category),
      keywords: JSON.stringify(keywords),
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
        { error: '키워드 분석 결과 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      count: result.results.length, 
      results: result.results,
      data: result
    }, { status: 200 })
  } catch (error) {
    console.error('키워드 분석 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
