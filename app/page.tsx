'use client'

import React, { useState, useEffect } from 'react'
import SearchForm from '@/components/SearchForm'
import ResultsList from '@/components/ResultsList'
import ApiKeyManager from '@/components/ApiKeyManager'
import { Search, BarChart3, Database, Sparkles, TrendingUp, Zap, Moon, Sun, Menu, X, Settings, FileText, Key } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'search' | 'results' | 'keys'>('search')
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs: Array<{ id: 'search' | 'results' | 'keys'; label: string; icon: React.ReactNode; description: string }> = [
    { id: 'search', label: '검색', icon: <Search className="w-5 h-5" />, description: '네이버 쇼핑 순위 검색' },
    { id: 'results', label: '결과', icon: <BarChart3 className="w-5 h-5" />, description: '저장된 검색 결과' },
    { id: 'keys', label: 'API 키', icon: <Key className="w-5 h-5" />, description: 'API 키 관리' },
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
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-slate-800 shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">메뉴</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-6 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.icon}
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-sm opacity-75">{tab.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 및 제목 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    네이버 쇼핑 순위 검색기
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">실시간 상품 순위 분석</p>
                </div>
              </div>
            </div>

            {/* 데스크톱 네비게이션 */}
            <div className="hidden lg:flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 테마 토글 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`테마: ${theme}`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* 검색 섹션 헤더 */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>순위 분석</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  네이버 쇼핑 순위 분석
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  검색어를 입력하고 상품의 순위를 실시간으로 분석해보세요
                </p>
              </div>

              {/* 검색 폼 */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* 결과 섹션 헤더 */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>저장된 결과</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  검색 결과
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  이전에 검색한 결과들을 확인하고 분석해보세요
                </p>
              </div>

              {/* 결과 리스트 */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                <ResultsList refreshTrigger={refreshTrigger} />
              </div>
            </motion.div>
          )}

          {activeTab === 'keys' && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* API 키 섹션 헤더 */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  <Settings className="w-4 h-4" />
                  <span>API 키 관리</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  API 키 관리
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  네이버 쇼핑 API 키를 안전하게 관리하세요
                </p>
              </div>

              {/* API 키 매니저 */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                <ApiKeyManager />
              </div>
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
                네이버 쇼핑 순위 검색기
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-1">
              <p>네이버 쇼핑 API를 사용하여 상품 순위를 검색합니다.</p>
              <p>검색 결과는 데이터베이스에 저장되어 비교 분석이 가능합니다.</p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-500">
                © 2024 네이버 쇼핑 순위 검색기. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}