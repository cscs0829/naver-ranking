'use client'

import { useState, useEffect } from 'react'
import { Trash2, ExternalLink, Calendar, MapPin, Tag } from 'lucide-react'

interface SearchResult {
  id: number
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
  created_at: string
}

interface ResultsListProps {
  refreshTrigger: number
}

export default function ResultsList({ refreshTrigger }: ResultsListProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [groupedResults, setGroupedResults] = useState<Record<string, SearchResult[]>>({})

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/results')
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
        
        // 검색어별로 그룹화
        const grouped = data.data.reduce((acc: Record<string, SearchResult[]>, result: SearchResult) => {
          const key = `${result.search_query}_${result.target_mall_name || '전체'}_${result.target_brand || '전체'}_${result.target_product_name || '전체'}`
          if (!acc[key]) {
            acc[key] = []
          }
          acc[key].push(result)
          return acc
        }, {})
        
        setGroupedResults(grouped)
      }
    } catch (error) {
      console.error('결과 조회 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteResult = async (id: number) => {
    try {
      const response = await fetch(`/api/results?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchResults()
      }
    } catch (error) {
      console.error('삭제 중 오류:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: string) => {
    return parseInt(price).toLocaleString('ko-KR') + '원'
  }

  useEffect(() => {
    fetchResults()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">결과를 불러오는 중...</span>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <MapPin className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-500">위에서 검색어를 입력하여 상품 순위를 확인해보세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedResults).map(([groupKey, groupResults]) => {
        const firstResult = groupResults[0]
        const searchInfo = groupKey.split('_')
        
        return (
          <div key={groupKey} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  검색어: {firstResult.search_query}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  {firstResult.target_mall_name && (
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      쇼핑몰: {firstResult.target_mall_name}
                    </span>
                  )}
                  {firstResult.target_brand && (
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      브랜드: {firstResult.target_brand}
                    </span>
                  )}
                  {firstResult.target_product_name && (
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      상품: {firstResult.target_product_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(firstResult.created_at)}
              </div>
            </div>

            <div className="space-y-3">
              {groupResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          {result.total_rank}위
                        </span>
                        <span className="text-sm text-gray-600">
                          {result.page}페이지 {result.rank_in_page}번째
                        </span>
                        <span className="text-sm text-gray-600">
                          {result.mall_name}
                        </span>
                        {result.brand && (
                          <span className="text-sm text-gray-600">
                            {result.brand}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">
                        {result.product_title}
                      </h4>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-medium text-green-600">
                          {formatPrice(result.price)}
                        </span>
                        {result.category1 && (
                          <span>{result.category1}</span>
                        )}
                        {result.category2 && (
                          <span>→ {result.category2}</span>
                        )}
                        {result.category3 && (
                          <span>→ {result.category3}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <a
                        href={result.product_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="상품 보기"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => deleteResult(result.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
