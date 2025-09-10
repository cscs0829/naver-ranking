import { NextRequest, NextResponse } from 'next/server'
import { NaverShoppingRankChecker } from '@/utils/naver-api'
import { supabase, SearchResult, checkSupabaseConfig } from '@/utils/supabase'
import { getNaverApiKeys, getActiveProfile } from '@/utils/api-keys'

export async function POST(request: NextRequest) {
  try {
    checkSupabaseConfig()
    const body = await request.json()
    const {
      searchQuery,
      targetMallName,
      targetBrand,
      targetProductName,
      maxPages = 10,
      profileId
    } = body

    if (!searchQuery) {
      return NextResponse.json(
        { error: '검색어는 필수입니다.' },
        { status: 400 }
      )
    }

    // 프로필ID가 있으면 프로필 기반, 없으면 기존 키 기반
    const naverKeys = profileId ? await getActiveProfile(Number(profileId)) : await getNaverApiKeys()
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

    // Supabase 클라이언트 null 체크
    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }

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
      { error: '서버 오류가 발생했습니다.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
