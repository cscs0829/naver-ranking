import { NextRequest, NextResponse } from 'next/server'
import { NaverShoppingRankChecker } from '@/utils/naver-api'
import { supabase, SearchResult } from '@/utils/supabase'
import { getNaverApiKeys } from '@/utils/api-keys'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      searchQuery,
      targetMallName,
      targetBrand,
      targetProductName,
      maxPages = 10
    } = body

    if (!searchQuery) {
      return NextResponse.json(
        { error: '검색어는 필수입니다.' },
        { status: 400 }
      )
    }

    // 데이터베이스에서 네이버 API 키 가져오기
    const naverKeys = await getNaverApiKeys()
    if (!naverKeys) {
      return NextResponse.json(
        { error: '네이버 API 키를 데이터베이스에서 가져올 수 없습니다.' },
        { status: 500 }
      )
    }

    // 네이버 API 클라이언트 초기화
    const checker = new NaverShoppingRankChecker(
      naverKeys.clientId,
      naverKeys.clientSecret
    )

    // 기존 검색 결과 삭제 (같은 검색어)
    const { error: deleteError } = await supabase
      .from('search_results')
      .delete()
      .eq('search_query', searchQuery)

    if (deleteError) {
      console.error('기존 검색 결과 삭제 중 오류:', deleteError)
      // 오류가 발생해도 검색은 계속 진행
    }

    // 상품 순위 검색 및 저장
    const result = await checker.searchAllProductsAndSave(
      searchQuery,
      targetProductName,
      targetMallName,
      targetBrand,
      maxPages
    )

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('검색 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
