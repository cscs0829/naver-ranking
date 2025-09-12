import { NextRequest, NextResponse } from 'next/server'
import { NaverShoppingInsights } from '@/utils/naver-insights'
import { supabase, checkSupabaseConfig } from '@/utils/supabase'
import { getActiveProfile } from '@/utils/api-keys'

export async function POST(request: NextRequest) {
  try {
    checkSupabaseConfig()
    const body = await request.json()
    const {
      startDate,
      endDate,
      timeUnit,
      category,
      keywords,
      device,
      gender,
      ages,
      profileId,
      save = false
    } = body

    if (!startDate || !endDate || !timeUnit || !category || !keywords) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 쇼핑인사이트 API 타입의 기본 프로필 사용
    const naverKeys = profileId ? await getActiveProfile(Number(profileId), 'insights') : await getActiveProfile(undefined, 'insights')
    if (!naverKeys) {
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

    // 키워드 트렌드 분석
    const result = await insights.getCategoryKeywordTrends(
      startDate,
      endDate,
      timeUnit,
      category,
      keywords,
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

    // 저장 모드인 경우 데이터베이스에 저장
    if (save) {
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
