import { createClient } from '@supabase/supabase-js'

// Vercel + Supabase 통합 시 자동으로 설정되는 환경변수 사용
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다. Vercel에서 Supabase 통합을 확인해주세요.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export interface SearchResult {
  id?: number
  search_query: string
  target_mall_name?: string
  target_brand?: string
  target_product_name?: string
  page: number
  rank_in_page: number
  total_rank: number
  product_title: string
  mall_name: string
  brand?: string
  price: string
  product_link: string
  product_id: string
  category1?: string
  category2?: string
  category3?: string
  created_at?: string
  updated_at?: string
}

export interface SearchQuery {
  id?: number
  query: string
  target_mall_name?: string
  target_brand?: string
  target_product_name?: string
  created_at?: string
  updated_at?: string
}