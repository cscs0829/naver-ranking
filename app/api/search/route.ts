import { NextRequest, NextResponse } from 'next/server'
import { NaverShoppingRankChecker } from '@/lib/naver-api'
import { supabase, SearchResult } from '@/lib/supabase'
import { getNaverApiKeys } from '@/lib/api-keys'

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
      .eq('target_mall_name', targetMallName || '')
      .eq('target_brand', targetBrand || '')
      .eq('target_product_name', targetProductName || '')

    if (deleteError) {
      console.error('기존 데이터 삭제 중 오류:', deleteError)
    }

    // 상품 순위 검색
    const searchResult = await checker.findProductRank(
      searchQuery,
      targetProductName,
      targetMallName,
      targetBrand,
      maxPages
    )

    if (searchResult.found) {
      // 검색 결과를 데이터베이스에 저장
      const resultData: Omit<SearchResult, 'id' | 'created_at' | 'updated_at'> = {
        search_query: searchResult.search_query,
        target_mall_name: targetMallName || null,
        target_brand: targetBrand || null,
        target_product_name: targetProductName || null,
        page: searchResult.page!,
        rank_in_page: searchResult.rank_in_page!,
        total_rank: searchResult.total_rank!,
        product_title: searchResult.product_info!.title,
        mall_name: searchResult.product_info!.mallName,
        brand: searchResult.product_info!.brand || searchResult.product_info!.maker,
        price: searchResult.product_info!.lprice,
        product_link: searchResult.product_info!.link,
        product_id: searchResult.product_info!.productId,
        category1: searchResult.product_info!.category1,
        category2: searchResult.product_info!.category2,
        category3: searchResult.product_info!.category3
      }

      const { data, error } = await supabase
        .from('search_results')
        .insert([resultData])
        .select()

      if (error) {
        console.error('데이터베이스 저장 중 오류:', error)
        return NextResponse.json(
          { error: '데이터베이스 저장 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: searchResult,
        saved: data
      })
    } else {
      return NextResponse.json({
        success: true,
        data: searchResult,
        message: '검색 결과에서 상품을 찾을 수 없습니다.'
      })
    }

  } catch (error) {
    console.error('검색 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
