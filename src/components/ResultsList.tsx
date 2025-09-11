'use client'

import { useState, useEffect } from 'react'
import { SearchResult } from '@/utils/supabase'
import { Filter, ChevronDown, Download, Trash2, Search, Award, BarChart3, AlertTriangle, TrendingUp, Sparkles, ExternalLink, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import emptyAnim from './empty-state.json'
import { toast } from '@/utils/toast'

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
  const [sortOptions, setSortOptions] = useState({
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  // HTML 태그 제거 함수
  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '')
  }

  // 결과 목록 가져오기
  const fetchResults = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery)
      if (filters.targetMallName) params.append('targetMallName', filters.targetMallName)
      params.append('sortBy', sortOptions.sortBy)
      params.append('sortOrder', sortOptions.sortOrder)

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

      if (response.ok) {
        setResults(prev => prev.filter(result => result.id !== id))
        toast('결과가 삭제되었습니다.', 'success')
      } else {
        const data = await response.json()
        toast(data.error || '삭제에 실패했습니다.', 'error')
      }
    } catch (err) {
      toast('삭제 중 오류가 발생했습니다.', 'error')
    }
  }

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
  }, [refreshTrigger, filters, sortOptions])

  // 결과 그룹화
  const groupedResults = results.reduce((acc, result) => {
    const key = result.search_query
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
          <div className="h-6 w-40 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
          <div className="h-6 w-48 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
          <div className="mt-4 h-40 rounded-xl animate-pulse bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* 필터 섹션 */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              검색 결과 필터
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-3 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
            >
              <span>필터</span>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`/api/results?${new URLSearchParams({ ...(filters.searchQuery?{searchQuery:filters.searchQuery}:{}) , ...(filters.targetMallName?{targetMallName:filters.targetMallName}:{}) , export: 'excel' }).toString()}`}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Download className="w-5 h-5" />
              <span>엑셀 내보내기</span>
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if(!confirm('정말 모든 데이터를 삭제하시겠습니까? 되돌릴 수 없습니다.')) return
                try {
                  const res = await fetch('/api/results', { method: 'DELETE' })
                  const data = await res.json()
                  if(res.ok){ setResults([]); setError(''); toast('전체 삭제 완료','success') } else { toast(data.error || '전체 삭제 실패','error') }
                } catch(e){ toast('전체 삭제 중 오류','error') }
              }}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Trash2 className="w-5 h-5" />
              <span>전체 삭제</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600 space-y-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="searchQueryFilter" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Search className="w-4 h-4 mr-2 text-blue-600" />
                    검색어
                  </label>
                  <input
                    type="text"
                    id="searchQueryFilter"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="검색어로 필터링"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mallNameFilter" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Award className="w-4 h-4 mr-2 text-purple-600" />
                    몰명
                  </label>
                  <input
                    type="text"
                    id="mallNameFilter"
                    value={filters.targetMallName}
                    onChange={(e) => setFilters(prev => ({ ...prev, targetMallName: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="몰명으로 필터링"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">정렬 옵션</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="sortBy" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
                      정렬 기준
                    </label>
                    <select
                      id="sortBy"
                      value={sortOptions.sortBy}
                      onChange={(e) => setSortOptions(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                    >
                      <option value="created_at">검색 시간</option>
                      <option value="search_query">검색어</option>
                      <option value="total_rank">순위</option>
                      <option value="mall_name">몰명</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sortOrder" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
                      정렬 순서
                    </label>
                    <select
                      id="sortOrder"
                      value={sortOptions.sortOrder}
                      onChange={(e) => setSortOptions(prev => ({ ...prev, sortOrder: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                    >
                      <option value="desc">내림차순 (최신순)</option>
                      <option value="asc">오름차순 (오래된순)</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-2xl relative" role="alert">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <strong className="font-bold">오류:</strong>
              <span className="block sm:inline ml-1"> {error}</span>
            </div>
          </div>
        </div>
      )}

      {/* 결과 목록 */}
      {Object.keys(groupedResults).length === 0 ? (
        <div className="text-center py-16">
          <div className="w-40 mx-auto mb-4">
            <Lottie animationData={emptyAnim} loop autoplay />
          </div>
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            검색 결과가 없습니다
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            아직 검색한 결과가 없습니다. 검색 탭에서 새로운 검색을 시작해보세요.
          </p>
          <div className="mt-6">
            <a
              href="#panel-search"
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all"
            >
              <Search className="w-4 h-4 mr-2" />
              검색하러 가기
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedResults).map(([searchQuery, queryResults], index) => (
            <motion.div
              key={searchQuery}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover-lift"
            >
              {/* 검색어 헤더 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                      <Search className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {searchQuery}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {queryResults.length}개의 결과
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(queryResults[0].created_at || '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 결과 목록 */}
              <div className="p-6">
                <div className="space-y-4">
                  {queryResults.map((result, resultIndex) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: resultIndex * 0.05 }}
                      className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                              #{resultIndex + 1}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {result.mall_name}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {stripHtmlTags(result.product_title || '')}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>순위: {result.total_rank}</span>
                            <span>가격: {result.price ? `${result.price.toLocaleString()}원` : 'N/A'}</span>
                            <span>브랜드: {result.brand || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setExpanded(prev => ({ ...prev, [result.id!]: !prev[result.id!] }))}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
                            title="상세 정보"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(result.id!)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors duration-200"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      {/* 상세 정보 */}
                      <AnimatePresence>
                        {expanded[result.id!] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">검색어:</span>
                                <span className="ml-2 text-slate-600 dark:text-slate-400">{result.search_query}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">상품 ID:</span>
                                <span className="ml-2 text-slate-600 dark:text-slate-400">{result.product_id}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">브랜드:</span>
                                <span className="ml-2 text-slate-600 dark:text-slate-400">{result.brand || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">가격:</span>
                                <span className="ml-2 text-slate-600 dark:text-slate-400">
                                  {result.price ? `${result.price.toLocaleString()}원` : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">쇼핑몰:</span>
                                <span className="ml-2 text-slate-600 dark:text-slate-400">{result.mall_name}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">카테고리:</span>
                                <span className="ml-2 text-slate-600 dark:text-slate-400">
                                  {result.category1} {result.category2 && `> ${result.category2}`}
                                </span>
                              </div>
                            </div>
                            {result.product_link && (
                              <div className="mt-4">
                                <a
                                  href={result.product_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors duration-200"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  상품 페이지 보기
                                </a>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}