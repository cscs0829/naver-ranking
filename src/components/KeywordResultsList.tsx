'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { SearchResult } from '@/utils/supabase'
import { Filter, ChevronDown, Download, Trash2, Search, Award, BarChart3, AlertTriangle, TrendingUp, Sparkles, ExternalLink, Eye, X, Smartphone, Monitor, Users, Globe, FileSpreadsheet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import emptyAnim from './empty-state.json'
import { toast } from '@/utils/toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
  category: any
  keywords: any
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
  const [autoNavigated, setAutoNavigated] = useState(false)

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

  // 데이터가 비어 있으면 키워드 분석 탭으로 유도
  useEffect(() => {
    if (!loading && !error && results.length === 0 && !autoNavigated) {
      setAutoNavigated(true)
      onNavigateToAnalysis()
    }
  }, [loading, error, results, autoNavigated, onNavigateToAnalysis])

  const handleDelete = async (id: number) => {
    if (!confirm('이 키워드 분석 결과를 삭제하시겠습니까?')) return
    try {
      const response = await fetch(`/api/keyword-results?id=${id}`, { method: 'DELETE' })
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

  const toggleExpanded = (id: number) => {
    const next = new Set(expandedResults)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpandedResults(next)
  }

  const handleDeleteAll = async () => {
    if (!confirm('모든 키워드 분석 결과를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
      const response = await fetch(`/api/keyword-results`, { method: 'DELETE' })
      const data = await response.json()
      if (response.ok) {
        toast(data.message || '모든 키워드 분석 결과가 삭제되었습니다.', 'success')
        fetchResults()
      } else {
        toast(`전체 삭제 실패: ${data.error || '알 수 없는 오류'}`, 'error')
      }
    } catch (err) {
      console.error('전체 삭제 오류:', err)
      toast('전체 삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  const handleExportExcel = async () => {
    if (!results || results.length === 0) {
      toast('내보낼 데이터가 없습니다.', 'info')
      return
    }

    try {
      const response = await fetch('/api/keyword-analysis/export-excel');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `키워드_분석_결과_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast('엑셀 파일이 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      toast('엑셀 파일 생성 중 오류가 발생했습니다.', 'error');
    }
  }

  // 단일 비교 차트용 데이터 변환
  const prepareComparisonChart = (trendResults: KeywordTrendResult[]) => {
    if (!trendResults || trendResults.length === 0) return [] as any[]
    const byPeriod: Record<string, any> = {}
    trendResults.forEach(tr => {
      tr.data.forEach(d => {
        if (!byPeriod[d.period]) byPeriod[d.period] = { period: d.period }
        byPeriod[d.period][tr.title] = d.ratio
      })
    })
    return Object.values(byPeriod).sort((a: any, b: any) => (a.period < b.period ? -1 : a.period > b.period ? 1 : 0))
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        {/* 액션 바 스켈레톤 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-6 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-48 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-20 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* 필터 스켈레톤 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-10 w-32 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-48 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-24 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* 키워드 결과 카드 스켈레톤 */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
              {/* 카드 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="h-6 w-48 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-16 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  <div className="h-8 w-8 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>

              {/* 키워드 태그 스켈레톤 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-8 w-20 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                ))}
              </div>

              {/* 차트 스켈레톤 */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="h-6 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700 mb-4" />
                <div className="h-64 w-full rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* 통계 정보 스켈레톤 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {[...Array(4)].map((_, k) => (
                  <div key={k} className="text-center">
                    <div className="h-8 w-16 mx-auto rounded animate-pulse bg-slate-200 dark:bg-slate-700 mb-2" />
                    <div className="h-4 w-20 mx-auto rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-2xl">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* 액션 바 */}
          <div className="flex items-center justify-end gap-2">
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={handleExportExcel} className="px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> 내보내기(엑셀)
            </motion.button>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={handleDeleteAll} className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> 전체 삭제
            </motion.button>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold">키워드 분석 결과가 없습니다</h3>
            </div>
          ) : (
            results.map((result) => {
              const comparisonData = prepareComparisonChart(result.results)
              const titles = result.results.map(r => r.title)
              const color = (i: number) => ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"][i%5]

              // 디버깅: 데이터 로그 (렌더 외부)
              if (typeof window !== 'undefined' && (comparisonData as any[]).length === 0) {
                try { console.debug('DEBUG chart raw results', result.results) } catch {}
              }

              // 요약 텍스트
              const keywordsSummary = Array.isArray(result.keywords)
                ? result.keywords.map((k: any) => (typeof k === 'object' ? (k.param?.join(', ') || k.name || '') : String(k))).join(', ')
                : String(result.keywords || '')

              const deviceText = result.device === 'pc' ? 'PC' : result.device === 'mo' ? '모바일' : '전체'
              const genderText = result.gender === 'm' ? '남성' : result.gender === 'f' ? '여성' : '전체'
              const agesText = result.ages ? (Array.isArray(result.ages) ? result.ages.join(',') : String(result.ages)) : '전체'

              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* 카드 헤더: 분석 요약 */}
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="text-lg font-bold">{result.analysis_name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="mr-3">기간: {result.start_date} ~ {result.end_date}</span>
                          <span className="mr-3">카테고리: {Array.isArray(result.category) ? (result.category[0]?.name || '') : String(result.category || '')}</span>
                          <span className="mr-3">기기: {deviceText}</span>
                          <span className="mr-3">성별: {genderText}</span>
                          <span>연령: {agesText}</span>
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-200">
                          검색어: {keywordsSummary}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>toggleExpanded(result.id)} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          상세 {expandedResults.has(result.id) ? '닫기' : '보기'}
                        </motion.button>
                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>handleDelete(result.id)} className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300">
                          삭제
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* 비교 차트 */}
                  <div className="p-6">
                    {comparisonData.length === 0 ? (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        표시할 데이터가 없습니다. 기간 또는 필터를 변경해 보세요.
                      </div>
                    ) : (
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} labelStyle={{ color: '#f1f5f9' }} />
                            {titles.map((t, i) => (
                              <Line key={t} type="monotone" dataKey={t} stroke={color(i)} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* 상세(선택) - 원래 per-series 데이터 테이블을 토글로 제공 */}
                  <AnimatePresence>
                    {expandedResults.has(result.id) && (
                      <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="p-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">원시 데이터</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-2">키워드</th>
                                <th className="text-left py-2">기간</th>
                                <th className="text-right py-2">비율</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.results.flatMap((tr) => tr.data.map((d, idx) => (
                                <tr key={`${tr.title}-${idx}`} className="border-b border-slate-100 dark:border-slate-700/50">
                                  <td className="py-2">{tr.title}</td>
                                  <td className="py-2">{d.period}</td>
                                  <td className="py-2 text-right">{d.ratio.toFixed(2)}</td>
                                </tr>
                              )))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
