'use client'

import { useState, useEffect } from 'react'
import { SearchResult } from '@/utils/supabase'
import { Trash2, Search, ExternalLink, Calendar, BarChart3, Filter, TrendingUp, Award, Clock, Sparkles, Zap } from 'lucide-react'

interface ResultsListProps {
  refreshTrigger: number
}

export default function ResultsList({ refreshTrigger }: ResultsListProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    searchQuery: '',
    targetMallName: ''
  })

  // 결과 목록 가져오기
  const fetchResults = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery)
      if (filters.targetMallName) params.append('targetMallName', filters.targetMallName)

      const response = await fetch(`/api/results?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setResults(data.data || [])
        setError('')
      } else {
        setError(data.error || '결과를 가져올 수 없습니다.')
      }
    } catch (err) {
      setError('결과를 가져오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 개별 결과 삭제
  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 결과를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/results?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (response.ok) {
        setResults(prev => prev.filter(result => result.id !== id))
      } else {
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // 검색어별 그룹화
  const groupedResults = results.reduce((acc, result) => {
    const key = result.search_query
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchResults()
  }, [refreshTrigger, filters])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-medium text-gray-700">결과를 불러오는 중...</p>
          <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 필터 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              검색 결과 필터
            </h3>
          </div>
          <div>
            <a
              href={`/api/results?${new URLSearchParams({ ...(filters.searchQuery?{searchQuery:filters.searchQuery}:{}) , ...(filters.targetMallName?{targetMallName:filters.targetMallName}:{}) , export: 'excel' }).toString()}`}
              className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-md text-sm"
            >엑셀로 내보내기</a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="searchQueryFilter" className="flex items-center text-sm font-semibold text-gray-800">
              <Search className="w-4 h-4 mr-2 text-blue-600" />
              검색어
            </label>
            <input
              type="text"
              id="searchQueryFilter"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              placeholder="검색어로 필터링"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="mallNameFilter" className="flex items-center text-sm font-semibold text-gray-800">
              <Award className="w-4 h-4 mr-2 text-purple-600" />
              몰명
            </label>
            <input
              type="text"
              id="mallNameFilter"
              value={filters.targetMallName}
              onChange={(e) => setFilters(prev => ({ ...prev, targetMallName: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              placeholder="몰명으로 필터링"
            />
          </div>
        </div>
      </div>

      {/* 결과 목록 */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl relative" role="alert">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 text-sm">!</span>
            </div>
            <div>
              <strong className="font-bold">오류:</strong>
              <span className="block sm:inline ml-1"> {error}</span>
            </div>
          </div>
        </div>
      )}

      {Object.keys(groupedResults).length === 0 ? (
        <div className="text-center py-16">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            검색을 실행하면 결과가 여기에 표시됩니다. 
            <br />
            <span className="text-blue-600 font-medium">위의 검색 폼을 사용해서 상품 순위를 검색해보세요!</span>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedResults).map(([searchQuery, queryResults], index) => (
            <div key={searchQuery} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover-lift">
              <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        "{searchQuery}" 검색 결과
                      </h3>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-gray-600">
                          {queryResults.length}개 결과
                        </span>
                        <div className="ml-3 flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          최근 검색: {queryResults[0]?.created_at ? formatDate(queryResults[0].created_at) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                      <span className="text-xs font-medium text-green-700">
                        {queryResults.length}개 상품
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-2 text-blue-600" />
                          순위
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-green-600" />
                          상품명
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                          몰명
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-orange-600" />
                          브랜드
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
                          가격
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-600" />
                          검색일시
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {queryResults.map((result, idx) => (
                      <tr key={result.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group">
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">{result.total_rank}</span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {result.total_rank}위
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                {result.page}페이지 {result.rank_in_page}번째
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2" title={result.product_title}>
                              {result.product_title}
                            </div>
                            {result.product_link && (
                              <a
                                href={result.product_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                상품 보기
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mr-2">
                              <Award className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{result.mall_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            {result.brand ? (
                              <>
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mr-2">
                                  <Sparkles className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{result.brand}</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-2">
                              <TrendingUp className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {result.price ? `${parseInt(result.price).toLocaleString()}원` : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {result.created_at ? formatDate(result.created_at) : '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(result.id!)}
                            className="group relative p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="삭제"
                          >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}