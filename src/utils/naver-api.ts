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
    if (targetProductName && !product.title.toLowerCase().includes(targetProductName.toLowerCase())) {
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
    let currentPage = 1
    const itemsPerPage = 100
    
    // 네이버 API 제한: 최대 1000개 (10페이지)
    const actualMaxPages = Math.min(maxPages, 10)
    const maxItems = actualMaxPages * itemsPerPage

    console.log(`검색 시작: "${searchQuery}", 최대 ${actualMaxPages}페이지 (${maxItems}개 상품)`)

    while (currentPage <= actualMaxPages) {
      const start = (currentPage - 1) * itemsPerPage + 1
      console.log(`페이지 ${currentPage} 검색 중... (start: ${start}, display: ${itemsPerPage})`)
      
      const response = await this.searchProducts(searchQuery, start, itemsPerPage)
      if (!response || !response.items) {
        console.error(`페이지 ${currentPage} 검색 실패`)
        break // 더 이상 검색할 수 없으면 중단
      }

      console.log(`페이지 ${currentPage}: ${response.items.length}개 상품 발견`)
      totalSearched += response.items.length

      for (let i = 0; i < response.items.length; i++) {
        const product = response.items[i]
        if (this.isTargetProduct(product, targetProductName, targetMallName, targetBrand)) {
          const productInfo = this.extractProductInfo(product)
          const totalRank = (currentPage - 1) * itemsPerPage + i + 1
          items.push({
            search_query: searchQuery,
            target_mall_name: targetMallName,
            target_brand: targetBrand,
            target_product_name: targetProductName,
            page: currentPage,
            rank_in_page: i + 1,
            total_rank: totalRank,
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
        }
      }

      // 더 이상 상품이 없으면 중단
      if (response.items.length < itemsPerPage) {
        console.log(`페이지 ${currentPage}에서 ${response.items.length}개만 반환됨. 검색 완료.`)
        break
      }

      // API 호출 제한을 고려한 딜레이 (네이버 API는 초당 10회 제한)
      await new Promise(resolve => setTimeout(resolve, 200))
      currentPage++
    }

    console.log(`검색 완료: 총 ${totalSearched}개 상품 검색, ${items.length}개 매칭`)
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