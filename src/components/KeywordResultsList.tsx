'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Filter, Download, Trash2, Search, BarChart3, Users, Smartphone, Monitor, Globe, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/utils/toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

interface KeywordTrendData {
  period: string
  group: string
  ratio: number
}

interface KeywordTrendResult {
  title: string
  keyword: string[]
  data: KeywordTrendData[]
}

interface KeywordAnalysisResult {
  id: number
  analysis_name: string
  start_date: string
  end_date: string
  time_unit: string
  category: string
  keywords: string
  device?: string
  gender?: string
  ages?: string
  results: KeywordTrendResult[]
  created_at: string
  updated_at: string
}

interface KeywordResultsListProps {
  refreshTrigger: number
  onNavigateToAnalysis: () => void
}

export default function KeywordResultsList({ refreshTrigger, onNavigateToAnalysis }: KeywordResultsListProps) {
  const [results, setResults] = useState<KeywordAnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    analysisName: '',
    category: '',
    keyword: ''
  })
  const [sortOptions, setSortOptions] = useState({
    sortBy: 'created_at' as 'created_at' | 'analysis_name' | 'start_date',
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set())

  // 키워드 분석 결과 가져오기
  const fetchResults = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams()
      if (filters.analysisName) params.append('analysisName', filters.analysisName)
      if (filters.category) params.append('category', filters.category)
      if (filters.keyword) params.append('keyword', filters.keyword)
      params.append('sortBy', sortOptions.sortBy)
      params.append('sortOrder', sortOptions.sortOrder)

      const response = await fetch(`/api/keyword-results?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setResults(data.data || [])
        setError('')
      } else {
        setError(data.error || '키워드 분석 결과를 가져올 수 없습니다.')
      }
    } catch (err) {
      console.error('키워드 분석 결과 로딩 오류:', err)
      setError('키워드 분석 결과를 가져오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [refreshTrigger, filters, sortOptions])

  // 결과 삭제
  const handleDelete = async (id: number) => {
    if (!confirm('이 키워드 분석 결과를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/keyword-results?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast('키워드 분석 결과가 삭제되었습니다.', 'success')
        fetchResults()
      } else {
        const data = await response.json()
        toast(`삭제 실패: ${data.error}`, 'error')
      }
    } catch (err) {
      console.error('삭제 오류:', err)
      toast('삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  // 모든 결과 삭제
  const handleDeleteAll = async () => {
    if (!confirm('모든 키워드 분석 결과를 삭제하시겠습니까?')) return

    try {
      const response = await fetch('/api/keyword-results', {
        method: 'DELETE'
      })

      if (response.ok) {
        toast('모든 키워드 분석 결과가 삭제되었습니다.', 'success')
        fetchResults()
      } else {
        const data = await response.json()
        toast(`삭제 실패: ${data.error}`, 'error')
      }
    } catch (err) {
      console.error('전체 삭제 오류:', err)
      toast('전체 삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  // Excel 내보내기
  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/keyword-results/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `keyword-analysis-results-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast('Excel 파일이 다운로드되었습니다.', 'success')
      } else {
        toast('Excel 내보내기 실패', 'error')
      }
    } catch (err) {
      console.error('Excel 내보내기 오류:', err)
      toast('Excel 내보내기 중 오류가 발생했습니다.', 'error')
    }
  }

  // 결과 확장/축소
  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedResults(newExpanded)
  }

  // 최대값 찾기
  const getMaxRatio = (data: KeywordTrendData[]) => {
    if (!data || data.length === 0) return 0
    return Math.max(...data.map(d => d.ratio))
  }

  // 최소값 찾기
  const getMinRatio = (data: KeywordTrendData[]) => {
    if (!data || data.length === 0) return 0
    return Math.min(...data.map(d => d.ratio))
  }

  // 평균값 계산
  const getAverageRatio = (data: KeywordTrendData[]) => {
    if (!data || data.length === 0) return 0
    const sum = data.reduce((acc, d) => acc + d.ratio, 0)
    return sum / data.length
  }

  // 차트 데이터 준비
  const prepareChartData = (data: KeywordTrendData[]) => {
    if (!data || data.length === 0) return []
    
    // 기간별로 그룹화
    const groupedData: { [key: string]: { [group: string]: number } } = {}
    
    data.forEach(item => {
      if (!groupedData[item.period]) {
        groupedData[item.period] = {}
      }
      groupedData[item.period][item.group] = item.ratio
    })
    
    // 차트용 데이터로 변환
    return Object.keys(groupedData).map(period => ({
      period,
      ...groupedData[period]
    }))
  }

  return (
    <div className="p-8 space-y-8">
      {/* 필터 섹션 */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200 dark:border-cyan-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          키워드 분석 결과 필터
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              분석명
            </label>
            <input
              type="text"
              value={filters.analysisName}
              onChange={(e) => setFilters(prev => ({ ...prev, analysisName: e.target.value }))}
              placeholder="분석명으로 검색..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-800 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              카테고리
            </label>
            <input
              type="text"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              placeholder="카테고리로 검색..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-800 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              키워드
            </label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder="키워드로 검색..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">정렬:</label>
            <select
              value={sortOptions.sortBy}
              onChange={(e) => setSortOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
            >
              <option value="created_at">생성일</option>
              <option value="analysis_name">분석명</option>
              <option value="start_date">시작일</option>
            </select>
            <select
              value={sortOptions.sortOrder}
              onChange={(e) => setSortOptions(prev => ({ ...prev, sortOrder: e.target.value as any }))}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
            >
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-wrap gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNavigateToAnalysis}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <TrendingUp className="w-5 h-5" />
          <span>새 키워드 분석</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportExcel}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Download className="w-5 h-5" />
          <span>Excel 내보내기</span>
        </motion.button>
        
        {results.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteAll}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Trash2 className="w-5 h-5" />
            <span>전체 삭제</span>
          </motion.button>
        )}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold">키워드 분석 결과를 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 오류 상태 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-2xl">
          <div className="flex items-center">
            <div className="w-6 h-6 mr-3 text-red-600 dark:text-red-400">⚠️</div>
            <div>
              <strong className="font-bold">오류가 발생했습니다</strong>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 결과 목록 */}
      {!loading && !error && (
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                키워드 분석 결과가 없습니다
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                새로운 키워드 분석을 시작해보세요
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToAnalysis}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                키워드 분석 시작
              </motion.button>
            </div>
          ) : (
            results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* 결과 헤더 */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {result.analysis_name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{result.start_date} ~ {result.end_date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>
                            {Array.isArray(result.category) 
                              ? result.category.join(', ')
                              : result.category
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Search className="w-4 h-4" />
                          <span>
                            {Array.isArray(result.keywords) 
                              ? result.keywords.join(', ')
                              : '키워드 정보 없음'
                            }
                          </span>
                        </div>
                        {result.device && (
                          <div className="flex items-center space-x-1">
                            {result.device === 'pc' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                            <span>{result.device === 'pc' ? 'PC' : '모바일'}</span>
                          </div>
                        )}
                        {result.gender && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{result.gender === 'm' ? '남성' : '여성'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleExpanded(result.id)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {expandedResults.has(result.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(result.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* 결과 상세 */}
                <AnimatePresence>
                  {expandedResults.has(result.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6 bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className="space-y-6">
                        {result.results.map((trendResult, index) => {
                          const maxRatio = getMaxRatio(trendResult.data)
                          const minRatio = getMinRatio(trendResult.data)
                          const avgRatio = getAverageRatio(trendResult.data)
                          
                          return (
                            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                {trendResult.title}
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{maxRatio.toFixed(1)}</div>
                                  <div className="text-sm text-blue-600 dark:text-blue-400">최대값</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{avgRatio.toFixed(1)}</div>
                                  <div className="text-sm text-green-600 dark:text-green-400">평균값</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{minRatio.toFixed(1)}</div>
                                  <div className="text-sm text-orange-600 dark:text-orange-400">최소값</div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <h5 className="font-medium text-slate-900 dark:text-white">트렌드 차트:</h5>
                                <div className="h-80 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={prepareChartData(trendResult.data)}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                      <XAxis 
                                        dataKey="period" 
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      <YAxis 
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      <Tooltip 
                                        contentStyle={{
                                          backgroundColor: '#1e293b',
                                          border: '1px solid #334155',
                                          borderRadius: '8px',
                                          color: '#f1f5f9'
                                        }}
                                        labelStyle={{ color: '#f1f5f9' }}
                                      />
                                      <Line 
                                        type="monotone" 
                                        dataKey={trendResult.title} 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                                
                                {/* 데이터 테이블 */}
                                <div className="space-y-2">
                                  <h6 className="text-sm font-medium text-slate-700 dark:text-slate-300">데이터 테이블:</h6>
                                  <div className="max-h-40 overflow-y-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-600">
                                          <th className="text-left py-2 text-slate-600 dark:text-slate-400">기간</th>
                                          <th className="text-left py-2 text-slate-600 dark:text-slate-400">그룹</th>
                                          <th className="text-right py-2 text-slate-600 dark:text-slate-400">비율</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {trendResult.data.map((data, dataIndex) => (
                                          <tr key={dataIndex} className="border-b border-slate-100 dark:border-slate-700">
                                            <td className="py-2 text-slate-900 dark:text-white">{data.period}</td>
                                            <td className="py-2 text-slate-900 dark:text-white">{data.group}</td>
                                            <td className="py-2 text-right text-slate-900 dark:text-white">{data.ratio.toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
