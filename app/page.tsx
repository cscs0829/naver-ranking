'use client'

import React, { useState, useEffect } from 'react'
import SearchForm from '@/components/SearchForm'
import ResultsList from '@/components/ResultsList'
import KeywordAnalysisForm from '@/components/KeywordAnalysisForm'
import KeywordResultsList from '@/components/KeywordResultsList'
import ApiKeyManager from '@/components/ApiKeyManager'
import AutoSearchManager from '@/components/AutoSearchManager'
import AutoSearchDashboard from '@/components/AutoSearchDashboard'
import AutoSearchNotifications from '@/components/AutoSearchNotifications'
import { Search, BarChart3, Database, Sparkles, TrendingUp, Zap, Moon, Sun, Menu, X, Settings, FileText, Key, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/utils/toast'

interface SearchData {
  searchQuery: string
  targetMallName?: string
  targetBrand?: string
  targetProductName?: string
  maxPages: number
  profileId?: number
  save?: boolean
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState<'search' | 'results' | 'keyword-analysis' | 'keyword-results' | 'keys' | 'auto-search' | 'dashboard' | 'notifications'>('search')
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs: Array<{ id: 'search' | 'results' | 'keyword-analysis' | 'keyword-results' | 'keys' | 'auto-search' | 'dashboard' | 'notifications'; label: string; icon: React.ReactNode; description: string }> = [
    { id: 'search', label: '순위 검색', icon: <Search className="w-5 h-5" />, description: '네이버 쇼핑 순위 검색' },
    { id: 'results', label: '순위 결과', icon: <BarChart3 className="w-5 h-5" />, description: '저장된 검색 결과' },
    { id: 'auto-search', label: '자동 검색', icon: <Clock className="w-5 h-5" />, description: '정기 자동 검색 스케줄 관리' },
    { id: 'dashboard', label: '대시보드', icon: <BarChart3 className="w-5 h-5" />, description: '자동 검색 통계 및 현황' },
    { id: 'keyword-analysis', label: '키워드 분석', icon: <TrendingUp className="w-5 h-5" />, description: '네이버 쇼핑인사이트 키워드 분석' },
    { id: 'keyword-results', label: '키워드 결과', icon: <Database className="w-5 h-5" />, description: '저장된 키워드 분석 결과' },
    { id: 'keys', label: 'API 키', icon: <Key className="w-5 h-5" />, description: 'API 키 관리' },
    { id: 'notifications', label: '알림', icon: <Zap className="w-5 h-5" />, description: '자동 검색 알림 관리' },
  ]

  useEffect(() => {
    setMounted(true)
    // theme init
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const preferredDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const next = (stored as any) || 'system'
    setTheme(next)
    const isDark = next === 'dark' || (next === 'system' && preferredDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
    localStorage.setItem('theme', next)
    const preferredDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = next === 'dark' || (next === 'system' && preferredDark)
    document.documentElement.classList.toggle('dark', isDark)
  }

  const handleSearch = async (searchData: SearchData) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      })

      const result = await response.json()

      if (result.success) {
        // 분석 모드: 최상단 1등 정보 안내
        if (!searchData.save) {
          const top = result.top
          if (top) toast(`1등: ${top.product_title}`, 'success')
          else toast('조건에 맞는 결과 없음', 'info')
        } else {
          // 저장 모드: 결과 탭으로 이동해 관리
          setActiveTab('results')
          setRefreshTrigger((prev: number) => prev + 1)
        }
      } else {
        toast(`오류: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('검색 오류:', error)
      toast('검색 중 오류 발생', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeywordAnalysis = async (analysisData: any) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/keyword-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      })

      const result = await response.json()

      if (result.success) {
        // 키워드 분석 완료 후 저장하고 결과 탭으로 이동
        setActiveTab('keyword-results')
        setRefreshTrigger((prev: number) => prev + 1)
        toast(`키워드 분석 완료: ${result.count}개 키워드 분석 및 저장됨`, 'success')
      } else {
        toast(`오류: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('키워드 분석 오류:', error)
      toast('키워드 분석 중 오류 발생', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 모바일 사이드바 오버레이 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/20 dark:border-slate-700/20"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-700/60">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">메뉴</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-6 space-y-3">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-600'}`}>
                      {tab.icon}
                    </div>
                    <div>
                      <div className="font-semibold">{tab.label}</div>
                      <div className="text-sm opacity-80">{tab.description}</div>
                    </div>
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 및 제목 */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:shadow-md"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent whitespace-nowrap">
                    네이버 데이터 수집
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">실시간 데이터 분석</p>
                </div>
              </div>
            </div>

            {/* 데스크톱 네비게이션 */}
            <div className="hidden lg:flex items-center space-x-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md'
                  }`}
                >
                  <div className={`p-1 rounded-md ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-600'}`}>
                    {tab.icon}
                  </div>
                  <span className="text-sm">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* 테마 토글 */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:shadow-md"
                title={`테마: ${theme}`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              {/* 검색 섹션 헤더 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>순위 분석</span>
                </motion.div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  네이버 쇼핑 순위 분석
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  검색어를 입력하고 상품의 순위를 실시간으로 분석해보세요
                </p>
              </motion.div>

              {/* 검색 폼 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-3xl transition-all duration-300"
              >
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              {/* 결과 섹션 헤더 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-500/25"
                >
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                  <span>저장된 결과</span>
                </motion.div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  순위 결과
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  이전에 검색한 순위 결과들을 확인하고 분석해보세요
                </p>
              </motion.div>

              {/* 결과 리스트 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-3xl transition-all duration-300"
              >
                <ResultsList 
                  refreshTrigger={refreshTrigger} 
                  onNavigateToSearch={() => setActiveTab('search')}
                />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'keyword-analysis' && (
            <motion.div
              key="keyword-analysis"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              {/* 키워드 분석 섹션 헤더 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-orange-500/25"
                >
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                  <span>키워드 분석</span>
                </motion.div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  네이버 쇼핑인사이트 키워드 분석
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  여행 관련 키워드의 검색 트렌드를 분석하고 인사이트를 얻어보세요
                </p>
              </motion.div>

              {/* 키워드 분석 폼 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-3xl transition-all duration-300"
              >
                <KeywordAnalysisForm onAnalysis={handleKeywordAnalysis} isLoading={isLoading} />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'keyword-results' && (
            <motion.div
              key="keyword-results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              {/* 키워드 결과 섹션 헤더 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-cyan-500/25"
                >
                  <Database className="w-5 h-5 animate-pulse" />
                  <span>키워드 결과</span>
                </motion.div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  키워드 분석 결과
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  이전에 분석한 키워드 트렌드 결과들을 확인하고 비교해보세요
                </p>
              </motion.div>

              {/* 키워드 결과 리스트 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-3xl transition-all duration-300"
              >
                <KeywordResultsList 
                  refreshTrigger={refreshTrigger} 
                  onNavigateToAnalysis={() => setActiveTab('keyword-analysis')}
                />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'auto-search' && (
            <motion.div
              key="auto-search"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              {/* 자동 검색 섹션 헤더 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-violet-500/25"
                >
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span>자동 검색</span>
                </motion.div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  자동 검색 관리
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  정기적으로 네이버 쇼핑 검색을 실행하고 결과를 자동으로 저장합니다
                </p>
              </motion.div>

              {/* 자동 검색 매니저 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-3xl transition-all duration-300 p-8"
              >
                <AutoSearchManager />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'keys' && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              {/* API 키 섹션 헤더 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center space-y-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-purple-500/25"
                >
                  <Settings className="w-5 h-5 animate-pulse" />
                  <span>API 키 관리</span>
                </motion.div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  API 키 관리
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  네이버 쇼핑 API 키를 안전하게 관리하세요
                </p>
              </motion.div>

              {/* API 키 매니저 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-3xl transition-all duration-300"
              >
                <ApiKeyManager />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-3xl transition-all duration-300 p-6"
              >
                <AutoSearchDashboard />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-3xl transition-all duration-300 p-6"
              >
                <AutoSearchNotifications />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 푸터 */}
      <footer className="mt-16 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                네이버 데이터 수집
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-1">
              <p>네이버 API를 사용하여 다양한 데이터를 검색하고 분석합니다.</p>
              <p>검색 결과는 데이터베이스에 저장되어 비교 분석이 가능합니다.</p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-500">
                © 네이버 데이터 수집. All rights reserved made by sean.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}