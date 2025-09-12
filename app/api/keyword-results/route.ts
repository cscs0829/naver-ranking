import { NextRequest, NextResponse } from 'next/server'
import { supabase, checkSupabaseConfig } from '@/utils/supabase'

// GET: 키워드 분석 결과 조회
export async function GET(request: NextRequest) {
  try {
    checkSupabaseConfig()
    const { searchParams } = new URL(request.url)
    const analysisName = searchParams.get('analysisName')
    const category = searchParams.get('category')
    const keyword = searchParams.get('keyword')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }

    let query = supabase
      .from('keyword_analysis_results')
      .select('*')

    // 필터 적용
    if (analysisName) {
      query = query.ilike('analysis_name', `%${analysisName}%`)
    }
    if (category) {
      query = query.ilike('category', `%${category}%`)
    }
    if (keyword) {
      query = query.ilike('keywords', `%${keyword}%`)
    }

    // 정렬 적용
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data, error } = await query

    if (error) {
      console.error('키워드 분석 결과 조회 오류:', error)
      return NextResponse.json(
        { error: '키워드 분석 결과 조회 중 오류가 발생했습니다.', detail: error.message },
        { status: 500 }
      )
    }

    // JSON 문자열을 안전하게 파싱하여 반환
    const results = data?.map(item => {
      const safeParse = (jsonString: string, defaultValue: any = []) => {
        try {
          if (typeof jsonString === 'string') {
            return JSON.parse(jsonString)
          }
          return jsonString || defaultValue
        } catch (e) {
          console.warn('JSON 파싱 실패:', jsonString, e)
          return defaultValue
        }
      }

      return {
        ...item,
        results: safeParse(item.results, []),
        category: safeParse(item.category, []),
        keywords: safeParse(item.keywords, []),
        ages: item.ages ? safeParse(item.ages, null) : null
      }
    }) || []

    return NextResponse.json({ data: results }, { status: 200 })
  } catch (error) {
    console.error('키워드 분석 결과 조회 오류:', error)
    return NextResponse.json(
      { error: '키워드 분석 결과 조회 중 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE: 키워드 분석 결과 삭제
export async function DELETE(request: NextRequest) {
  try {
    checkSupabaseConfig()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }

    if (id) {
      // 특정 결과 삭제
      const { error } = await supabase
        .from('keyword_analysis_results')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('키워드 분석 결과 삭제 오류:', error)
        return NextResponse.json(
          { error: '키워드 분석 결과 삭제에 실패했습니다.', detail: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: '키워드 분석 결과가 삭제되었습니다.' }, { status: 200 })
    } else {
      // 모든 결과 삭제
      const { error } = await supabase
        .from('keyword_analysis_results')
        .delete()
        .neq('id', 0) // 모든 레코드 삭제

      if (error) {
        console.error('키워드 분석 결과 전체 삭제 오류:', error)
        return NextResponse.json(
          { error: '키워드 분석 결과 전체 삭제에 실패했습니다.', detail: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: '모든 키워드 분석 결과가 삭제되었습니다.' }, { status: 200 })
    }
  } catch (error) {
    console.error('키워드 분석 결과 삭제 오류:', error)
    return NextResponse.json(
      { error: '키워드 분석 결과 삭제 중 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
