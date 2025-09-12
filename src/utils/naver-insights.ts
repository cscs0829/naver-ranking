import axios from 'axios'

export interface KeywordTrendData {
  period: string
  group: string
  ratio: number
}

export interface KeywordTrendResult {
  title: string
  keyword: string[]
  data: KeywordTrendData[]
}

export interface InsightsResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: KeywordTrendResult[]
}

export interface CategoryTrendData {
  period: string
  group: string
  ratio: number
}

export interface CategoryTrendResult {
  title: string
  category: string[]
  data: CategoryTrendData[]
}

export interface CategoryInsightsResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: CategoryTrendResult[]
}

export interface AgeTrendData {
  period: string
  group: string
  ratio: number
}

export interface AgeTrendResult {
  title: string
  keyword: string[]
  data: AgeTrendData[]
}

export interface AgeInsightsResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: AgeTrendResult[]
}

export interface GenderTrendData {
  period: string
  group: string
  ratio: number
}

export interface GenderTrendResult {
  title: string
  keyword: string[]
  data: GenderTrendData[]
}

export interface GenderInsightsResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: GenderTrendResult[]
}

export interface DeviceTrendData {
  period: string
  group: string
  ratio: number
}

export interface DeviceTrendResult {
  title: string
  keyword: string[]
  data: DeviceTrendData[]
}

export interface DeviceInsightsResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: DeviceTrendResult[]
}

export class NaverShoppingInsights {
  private clientId: string
  private clientSecret: string
  private baseUrl = 'https://openapi.naver.com/v1/datalab/shopping'

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  // 쇼핑 카테고리별 키워드 트렌드 조회
  async getCategoryKeywordTrends(
    startDate: string,
    endDate: string,
    timeUnit: 'date' | 'week' | 'month',
    category: Array<{ name: string; param: string[] }>,
    keywords: Array<{ name: string; param: string[] }>,
    device?: 'pc' | 'mo' | '',
    gender?: 'm' | 'f' | '',
    ages?: string[]
  ): Promise<InsightsResponse | null> {
    try {
      const requestBody = {
        startDate,
        endDate,
        timeUnit,
        category,
        keywords,
        ...(device && { device }),
        ...(gender && { gender }),
        ...(ages && { ages })
      }

      const response = await axios.post(`${this.baseUrl}/category/keywords`, requestBody, {
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return response.data
    } catch (error) {
      console.error('카테고리 키워드 트렌드 조회 오류:', error)
      if (axios.isAxiosError(error)) {
        console.error('API 응답:', error.response?.data)
        console.error('상태 코드:', error.response?.status)
      }
      return null
    }
  }

  // 쇼핑 카테고리별 트렌드 조회
  async getCategoryTrends(
    startDate: string,
    endDate: string,
    timeUnit: 'date' | 'week' | 'month',
    category: Array<{ name: string; param: string[] }>,
    device?: 'pc' | 'mo' | '',
    gender?: 'm' | 'f' | '',
    ages?: string[]
  ): Promise<CategoryInsightsResponse | null> {
    try {
      const requestBody = {
        startDate,
        endDate,
        timeUnit,
        category,
        ...(device && { device }),
        ...(gender && { gender }),
        ...(ages && { ages })
      }

      const response = await axios.post(`${this.baseUrl}/categories`, requestBody, {
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return response.data
    } catch (error) {
      console.error('카테고리 트렌드 조회 오류:', error)
      if (axios.isAxiosError(error)) {
        console.error('API 응답:', error.response?.data)
        console.error('상태 코드:', error.response?.status)
      }
      return null
    }
  }

  // 쇼핑 카테고리별 연령 트렌드 조회
  async getCategoryAgeTrends(
    startDate: string,
    endDate: string,
    timeUnit: 'date' | 'week' | 'month',
    category: Array<{ name: string; param: string[] }>,
    device?: 'pc' | 'mo' | '',
    gender?: 'm' | 'f' | '',
    ages?: string[]
  ): Promise<AgeInsightsResponse | null> {
    try {
      const requestBody = {
        startDate,
        endDate,
        timeUnit,
        category,
        ...(device && { device }),
        ...(gender && { gender }),
        ...(ages && { ages })
      }

      const response = await axios.post(`${this.baseUrl}/category/age`, requestBody, {
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return response.data
    } catch (error) {
      console.error('카테고리 연령 트렌드 조회 오류:', error)
      if (axios.isAxiosError(error)) {
        console.error('API 응답:', error.response?.data)
        console.error('상태 코드:', error.response?.status)
      }
      return null
    }
  }

  // 쇼핑 카테고리별 성별 트렌드 조회
  async getCategoryGenderTrends(
    startDate: string,
    endDate: string,
    timeUnit: 'date' | 'week' | 'month',
    category: Array<{ name: string; param: string[] }>,
    device?: 'pc' | 'mo' | '',
    ages?: string[]
  ): Promise<GenderInsightsResponse | null> {
    try {
      const requestBody = {
        startDate,
        endDate,
        timeUnit,
        category,
        ...(device && { device }),
        ...(ages && { ages })
      }

      const response = await axios.post(`${this.baseUrl}/category/gender`, requestBody, {
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return response.data
    } catch (error) {
      console.error('카테고리 성별 트렌드 조회 오류:', error)
      if (axios.isAxiosError(error)) {
        console.error('API 응답:', error.response?.data)
        console.error('상태 코드:', error.response?.status)
      }
      return null
    }
  }

  // 쇼핑 카테고리별 키워드 연령 트렌드 조회
  async getCategoryKeywordAgeTrends(
    startDate: string,
    endDate: string,
    timeUnit: 'date' | 'week' | 'month',
    category: Array<{ name: string; param: string[] }>,
    keywords: Array<{ name: string; param: string[] }>,
    device?: 'pc' | 'mo' | '',
    gender?: 'm' | 'f' | '',
    ages?: string[]
  ): Promise<AgeInsightsResponse | null> {
    try {
      const requestBody = {
        startDate,
        endDate,
        timeUnit,
        category,
        keywords,
        ...(device && { device }),
        ...(gender && { gender }),
        ...(ages && { ages })
      }

      const response = await axios.post(`${this.baseUrl}/category/keyword/age`, requestBody, {
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return response.data
    } catch (error) {
      console.error('카테고리 키워드 연령 트렌드 조회 오류:', error)
      if (axios.isAxiosError(error)) {
        console.error('API 응답:', error.response?.data)
        console.error('상태 코드:', error.response?.status)
      }
      return null
    }
  }

  // 여행 관련 카테고리 매핑
  getTravelCategories() {
    return [
      { name: '해외여행', param: ['50000005'] },
      { name: '국내여행', param: ['50000006'] },
      { name: '항공권', param: ['50000007'] },
      { name: '숙박', param: ['50000008'] },
      { name: '렌터카', param: ['50000009'] },
      { name: '여행용품', param: ['50000010'] }
    ]
  }

  // 여행 관련 키워드 예시
  getTravelKeywords() {
    return [
      { name: '해외여행', param: ['해외여행', '해외패키지', '해외투어'] },
      { name: '일본여행', param: ['일본여행', '일본패키지', '일본투어'] },
      { name: '유럽여행', param: ['유럽여행', '유럽패키지', '유럽투어'] },
      { name: '동남아여행', param: ['동남아여행', '동남아패키지', '동남아투어'] },
      { name: '중국여행', param: ['중국여행', '중국패키지', '중국투어'] },
      { name: '미국여행', param: ['미국여행', '미국패키지', '미국투어'] }
    ]
  }
}
