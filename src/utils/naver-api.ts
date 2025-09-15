import axios from 'axios'
import { supabase, SearchResult } from './supabase'

export interface NaverProduct {
  title: string
  link: string
  image: string
  lprice: string
  hprice: string
  mallName: string
  productId: string
  productType: string
  brand: string
  maker: string
  category1: string
  category2: string
  category3: string
  category4: string
}

export interface NaverSearchResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NaverProduct[]
}

export class NaverShoppingRankChecker {
  private clientId: string
  private clientSecret: string
  private baseUrl = 'https://openapi.naver.com/v1/search/shop.json'

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  async searchProducts(query: string, start: number = 1, display: number = 100): Promise<NaverSearchResponse | null> {
    try {
      // 네이버 API 제한사항 확인
      if (start > 1000) {
        console.warn(`start 파라미터가 1000을 초과했습니다: ${start}`)
        return null
      }
      
      if (display > 100) {
        display = 100 // 최대 100개로 제한
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          query,
          start,
          display,
          sort: 'sim' // 정확도 순
        },
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret
        },
        timeout: 15000
      })

      return response.data
    } catch (error) {
      console.error('네이버 API 호출 오류:', error)
      if (axios.isAxiosError(error)) {
        console.error('API 응답:', error.response?.data)
        console.error('상태 코드:', error.response?.status)
      }
      return null
    }
  }

  extractProductInfo(product: NaverProduct): Partial<SearchResult> {
    return {
      product_title: product.title,
      product_link: product.link,
      product_id: product.productId,
      mall_name: product.mallName,
      brand: product.brand || product.maker,
      price: product.lprice || product.hprice,
      category1: product.category1,
      category2: product.category2,
      category3: product.category3
    }
  }

  isTargetProduct(
    product: NaverProduct,
    targetProductName?: string,
    targetMallName?: string,
    targetBrand?: string
  ): boolean {
    // 상품명 매칭 로직 개선
    if (targetProductName) {
      const productTitle = product.title.toLowerCase()
      const targetName = targetProductName.toLowerCase()
      
      // 1. 정확한 매칭 시도
      if (productTitle === targetName) {
        return true
      }
      
      // 2. 타겟 상품명이 상품 제목에 포함되는지 확인
      if (productTitle.includes(targetName)) {
        return true
      }
      
      // 3. 상품 제목이 타겟 상품명에 포함되는지 확인 (긴 상품명의 경우)
      if (targetName.includes(productTitle)) {
        return true
      }
      
      // 4. 키워드 기반 매칭 (공백으로 분리하여 주요 키워드들이 모두 포함되는지 확인)
      const targetKeywords = targetName.split(/\s+/).filter(keyword => keyword.length > 1)
      const productKeywords = productTitle.split(/\s+/).filter(keyword => keyword.length > 1)
      
      if (targetKeywords.length > 0) {
        const matchedKeywords = targetKeywords.filter(keyword => 
          productKeywords.some(productKeyword => 
            productKeyword.includes(keyword) || keyword.includes(productKeyword)
          )
        )
        
        // 70% 이상의 키워드가 매칭되면 일치로 판단
        if (matchedKeywords.length / targetKeywords.length >= 0.7) {
          console.log(`키워드 매칭 성공: ${matchedKeywords.length}/${targetKeywords.length} (${(matchedKeywords.length / targetKeywords.length * 100).toFixed(1)}%)`)
          console.log(`타겟: "${targetProductName}"`)
          console.log(`상품: "${product.title}"`)
          console.log(`매칭된 키워드: ${matchedKeywords.join(', ')}`)
          return true
        }
      }
      
      console.log(`상품명 매칭 실패: "${product.title}" vs "${targetProductName}"`)
      return false
    }

    if (targetMallName && !product.mallName.toLowerCase().includes(targetMallName.toLowerCase())) {
      return false
    }

    if (targetBrand && product.brand && !product.brand.toLowerCase().includes(targetBrand.toLowerCase())) {
      return false
    }

    return true
  }

  async findProductRank(
    searchQuery: string,
    targetProductName?: string,
    targetMallName?: string,
    targetBrand?: string,
    maxPages: number = 10
  ): Promise<{ found: boolean; data?: SearchResult; totalSearched: number }> {
    // 유지: 기존 단건 탐색 (호환 목적)
    const res = await this.findAllMatches(searchQuery, targetProductName, targetMallName, targetBrand, maxPages)
    if (res.items.length > 0) {
      return { found: true, data: res.items[0], totalSearched: res.totalSearched }
    }
    return { found: false, totalSearched: res.totalSearched }
  }

  async findAllMatches(
    searchQuery: string,
    targetProductName?: string,
    targetMallName?: string,
    targetBrand?: string,
    maxPages: number = 10
  ): Promise<{ items: SearchResult[]; totalSearched: number; foundCount: number }> {
    const items: SearchResult[] = []
    let totalSearched = 0
    let currentApiPage = 1
    const itemsPerApiPage = 100 // API에서 한 번에 가져오는 상품 수
    const itemsPerWebPage = 40  // 실제 네이버 쇼핑 웹페이지에서 표시하는 상품 수
    
    // 끝까지 검색 옵션 처리
    const isSearchUntilFound = maxPages === -1
    const actualMaxPages = isSearchUntilFound ? 25 : Math.min(maxPages, 25) // API 최대 25페이지(1000개)
    const maxItems = actualMaxPages * itemsPerApiPage

    console.log(`검색 시작: "${searchQuery}"`)
    console.log(`타겟 상품명: "${targetProductName || '없음'}"`)
    console.log(`타겟 몰명: "${targetMallName || '없음'}"`)
    console.log(`타겟 브랜드: "${targetBrand || '없음'}"`)
    if (isSearchUntilFound) {
      console.log(`끝까지 검색 모드: 타겟 상품을 찾을 때까지 최대 ${actualMaxPages}페이지 검색`)
    } else {
      console.log(`제한 검색 모드: 최대 ${actualMaxPages}페이지 (${maxItems}개 상품)`)
    }
    console.log(`실제 네이버 쇼핑 웹페이지: 한 페이지당 ${itemsPerWebPage}개 상품 표시`)

    while (currentApiPage <= actualMaxPages) {
      const start = (currentApiPage - 1) * itemsPerApiPage + 1
      console.log(`API 페이지 ${currentApiPage} 검색 중... (start: ${start}, display: ${itemsPerApiPage})`)
      
      const response = await this.searchProducts(searchQuery, start, itemsPerApiPage)
      if (!response || !response.items) {
        console.error(`API 페이지 ${currentApiPage} 검색 실패`)
        break // 더 이상 검색할 수 없으면 중단
      }

      console.log(`API 페이지 ${currentApiPage}: ${response.items.length}개 상품 발견`)
      totalSearched += response.items.length

      // API에서 가져온 100개를 실제 웹페이지 기준 40개씩 나누어 처리
      for (let i = 0; i < response.items.length; i++) {
        const product = response.items[i]
        console.log(`상품 ${i + 1} 검사 중: "${product.title}"`)
        
        if (this.isTargetProduct(product, targetProductName, targetMallName, targetBrand)) {
          console.log(`✅ 매칭된 상품 발견!`)
          const productInfo = this.extractProductInfo(product)
          
          // 실제 네이버 쇼핑 웹페이지 기준으로 페이지와 순위 계산
          const totalRank = (currentApiPage - 1) * itemsPerApiPage + i + 1
          const webPage = Math.floor(totalRank / itemsPerWebPage) + 1
          const rankInWebPage = ((totalRank - 1) % itemsPerWebPage) + 1
          
          console.log(`상품 정보: ${productInfo.product_title}`)
          console.log(`몰명: ${productInfo.mall_name}`)
          console.log(`브랜드: ${productInfo.brand}`)
          console.log(`가격: ${productInfo.price}`)
          console.log(`전체 순위: ${totalRank}위`)
          console.log(`웹페이지: ${webPage}페이지 ${rankInWebPage}번째`)
          
          items.push({
            search_query: searchQuery,
            target_mall_name: targetMallName,
            target_brand: targetBrand,
            target_product_name: targetProductName,
            page: webPage, // 실제 웹페이지 번호
            rank_in_page: rankInWebPage, // 웹페이지 내 순위
            total_rank: totalRank, // 전체 순위
            product_title: productInfo.product_title!,
            mall_name: productInfo.mall_name!,
            brand: productInfo.brand,
            price: productInfo.price!,
            product_link: productInfo.product_link!,
            product_id: productInfo.product_id!,
            category1: productInfo.category1,
            category2: productInfo.category2,
            category3: productInfo.category3
          })
          
          console.log(`매칭 상품 발견: 전체 ${totalRank}위, 웹페이지 ${webPage}페이지 ${rankInWebPage}번째`)
        }
      }

      // 끝까지 검색 모드에서 타겟 상품을 찾았고, 더 이상 검색할 필요가 없는 경우
      if (isSearchUntilFound && items.length > 0) {
        console.log(`타겟 상품을 찾았습니다! ${items.length}개 상품 발견, 검색 종료`)
        break
      }

      // 더 이상 상품이 없으면 중단
      if (response.items.length < itemsPerApiPage) {
        console.log(`API 페이지 ${currentApiPage}에서 ${response.items.length}개만 반환됨. 검색 완료.`)
        break
      }

      // API 호출 제한을 고려한 딜레이 (네이버 API는 초당 10회 제한)
      await new Promise(resolve => setTimeout(resolve, 200))
      currentApiPage++
    }

    console.log(`검색 완료: 총 ${totalSearched}개 상품 검색, ${items.length}개 매칭`)
    console.log(`실제 웹페이지 기준: 최대 ${Math.ceil(totalSearched / itemsPerWebPage)}페이지`)
    return { items, totalSearched, foundCount: items.length }
  }

  async searchAllProductsAndSave(
    searchQuery: string,
    targetProductName?: string,
    targetMallName?: string,
    targetBrand?: string,
    maxPages: number = 10,
    save: boolean = false
  ): Promise<{ success: boolean; items?: SearchResult[]; count?: number; error?: string }> {
    try {
      const result = await this.findAllMatches(searchQuery, targetProductName, targetMallName, targetBrand, maxPages)

      if (save) {
        if (!supabase) {
          throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
        }
        // 같은 검색어 기존 데이터 삭제 후 저장
        await supabase.from('search_results').delete().eq('search_query', searchQuery)
        if (result.items.length > 0) {
          const { error } = await supabase
            .from('search_results')
            .insert(result.items)
          if (error) {
            console.error('데이터베이스 저장 오류:', error)
            return { success: false, error: '데이터베이스 저장에 실패했습니다.' }
          }
        }
      }

      return { success: true, items: result.items, count: result.items.length }
    } catch (error) {
      console.error('검색 및 저장 오류:', error)
      return { success: false, error: '검색 중 오류가 발생했습니다.' }
    }
  }
}

// 자동 검색용 간단한 함수
export async function searchNaverShopping(
  params: { query: string; display: number; start: number; sort: string },
  credentials: { clientId: string; clientSecret: string }
): Promise<NaverSearchResponse | null> {
  const checker = new NaverShoppingRankChecker(credentials.clientId, credentials.clientSecret);
  return await checker.searchProducts(params.query, params.start, params.display);
}