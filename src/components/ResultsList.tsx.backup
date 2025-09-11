'use client'

import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SearchResult } from '@/utils/supabase'
import { Trash2, Search, ExternalLink, Calendar, BarChart3, Filter, TrendingUp, Award, Clock, Sparkles, Zap, ArrowUpDown, ArrowUp, ArrowDown, Target, Users, Download, AlertTriangle, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/utils/toast'
import Lottie from 'lottie-react'
import emptyAnim from '@/components/empty-state.json'
import { motion, AnimatePresence } from 'framer-motion'

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
      const data = await response.json()

      if (response.ok) {
        setResults(prev => prev.filter(result => result.id !== id))
        toast('삭제되었습니다', 'success')
      } else {
        toast(data.error || '삭제에 실패했습니다.', 'error')
      }
    } catch (err) {
      toast('삭제 중 오류가 발생했습니다.', 'error')
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

  // 검색어별 통계 정보 계산
  const getSearchQueryStats = (queryResults: SearchResult[]) => {
    const ranks = queryResults.map(r => r.total_rank).sort((a, b) => a - b)
    const bestRank = ranks[0] || 0
    const worstRank = ranks[ranks.length - 1] || 0
    const averageRank = ranks.length > 0 ? Math.round(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length) : 0
    const uniqueMalls = new Set(queryResults.map(r => r.mall_name)).size
    const lastSearch = queryResults[0]?.created_at

    return {
      totalResults: queryResults.length,
      bestRank,
      worstRank,
      averageRank,
      uniqueMalls,
      lastSearch
    }
  }

  const toggleExpanded = (id: number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

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

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.hover-lift').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 16,
          duration: 0.35,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        })
      })
    })
    return () => ctx.revert()
  }, [results])

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
              className="space-y-6 overflow-hidden"
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

              {/* 정렬 옵션 */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mr-3">
                    <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
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
                      {sortOptions.sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 mr-2 text-emerald-600" /> : <ArrowDown className="w-4 h-4 mr-2 text-red-600" />}
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
            검색을 실행하면 결과가 여기에 표시됩니다. 
            <br />
            <span className="text-blue-600 dark:text-blue-400 font-medium">위의 검색 폼을 사용해서 상품 순위를 검색해보세요!</span>
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
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        "{searchQuery}" 검색 결과
                      </h3>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {queryResults.length}개 결과
                        </span>
                        <div className="ml-3 flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3 mr-1" />
                          최근 검색: {queryResults[0]?.created_at ? formatDate(queryResults[0].created_at) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/50 dark:to-blue-900/50 rounded-full">
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        {queryResults.length}개 상품
                      </span>
                    </div>
                  </div>
                </div>

                {/* 통계 정보 카드 */}
                {(() => {
                  const stats = getSearchQueryStats(queryResults)
                  return (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-full flex items-center justify-center mr-2">
                            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">최고 순위</div>
                            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{stats.bestRank}위</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center mr-2">
                            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">평균 순위</div>
                            <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{stats.averageRank}위</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full flex items-center justify-center mr-2">
                            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">참여 몰 수</div>
                            <div className="text-sm font-bold text-purple-700 dark:text-purple-300">{stats.uniqueMalls}개</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 rounded-full flex items-center justify-center mr-2">
                            <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">최저 순위</div>
                            <div className="text-sm font-bold text-orange-700 dark:text-orange-300">{stats.worstRank}위</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600 hidden md:table">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                          순위
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                          상품명
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                          몰명
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                          검색일시
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                    {queryResults.map((result, idx) => (
                      <tr key={result.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 group">
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">{result.total_rank}</span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">
                                {result.total_rank}위
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                {result.page}페이지 {result.rank_in_page}번째
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2" title={result.product_title}>
                              {result.product_title}
                            </div>
                            <a
                              href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(result.mall_name || result.search_query)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              가격비교에서 보기
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/50 dark:to-blue-900/50 rounded-full flex items-center justify-center mr-2">
                              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{result.mall_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <Clock className="w-4 h-4 mr-2 text-slate-400" />
                            <div>
                              <div className="font-medium">
                                {result.created_at ? formatDate(result.created_at) : '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-medium">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => toggleExpanded(result.id!)}
                              className="px-2 py-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                              title="상세"
                            >
                              {expanded[result.id!] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(result.id!)}
                              className="group relative p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200"
                              title="삭제"
                            >
                              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                          </div>
                          <AnimatePresence>
                            {expanded[result.id!] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-3 text-left bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl p-4"
                              >
                                <div className="text-xs text-slate-600 dark:text-slate-400">상세 정보</div>
                                <ul className="mt-2 text-sm text-slate-800 dark:text-slate-200 space-y-1">
                                  <li>검색어: {result.search_query}</li>
                                  <li>브랜드: {result.brand || '-'}</li>
                                  <li>링크: {result.product_link ? <a className="text-blue-600 dark:text-blue-400" href={result.product_link} target="_blank" rel="noreferrer">열기</a> : '-'}</li>
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* 모바일 카드 리스트 */}
                <div className="md:hidden space-y-4 p-4">
                  {queryResults.map((result) => (
                    <div key={result.id} className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 shadow hover-lift will-change-transform">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">{result.total_rank}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{result.total_rank}위</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{result.page}페이지 {result.rank_in_page}번째</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(result.id!)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-3 text-sm font-medium text-slate-900 dark:text-white line-clamp-3" title={result.product_title}>
                        {result.product_title}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-400" />{result.mall_name}
                        </div>
                        <div className="flex items-center col-span-2">
                          <Clock className="w-4 h-4 mr-1 text-slate-400" />{result.created_at ? formatDate(result.created_at) : '-'}
                        </div>
                      </div>
                      <a href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(result.mall_name || result.search_query)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                        <ExternalLink className="w-3 h-3 mr-1" />가격비교에서 보기
                      </a>
                    </div>
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