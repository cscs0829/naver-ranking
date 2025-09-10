'use client'

import React, { useState, useEffect } from 'react'
import SearchForm from '@/components/SearchForm'
import ResultsList from '@/components/ResultsList'
import ApiKeyManager from '@/components/ApiKeyManager'
import { Search, BarChart3, Database, Sparkles, TrendingUp, Zap, Moon, Sun } from 'lucide-react'
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
  const searchTabRef = React.useRef<HTMLButtonElement | null>(null)
  const resultsTabRef = React.useRef<HTMLButtonElement | null>(null)
  const keysTabRef = React.useRef<HTMLButtonElement | null>(null)
  const [underline, setUnderline] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const tabs: Array<{ id: 'search' | 'results' | 'keys'; label: string }> = [
    { id: 'search', label: '검색' },
    { id: 'results', label: '결과' },
    { id: 'keys', label: 'API 키' },
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

  useEffect(() => {
    if (!mounted) return
    const map: Record<typeof activeTab, HTMLButtonElement | null> = {
      search: searchTabRef.current,
      results: resultsTabRef.current,
      keys: keysTabRef.current
    }
    const el = map[activeTab]
    if (el) {
      const rect = el.getBoundingClientRect()
      const parentRect = el.parentElement?.getBoundingClientRect()
      const left = parentRect ? rect.left - parentRect.left : rect.left
      setUnderline({ left, width: rect.width })
    }
    const onResize = () => {
      const el2 = map[activeTab]
      if (el2) {
        const rect2 = el2.getBoundingClientRect()
        const parentRect2 = el2.parentElement?.getBoundingClientRect()
        const left2 = parentRect2 ? rect2.left - parentRect2.left : rect2.left
        setUnderline({ left: left2, width: rect2.width })
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeTab, mounted])

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center group">
                  <div className="relative">
                    <Search className="w-8 h-8 text-blue-600 mr-3 transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    네이버 쇼핑 순위 검색기
                  </h1>
                </div>
              </div>
            </div>
            <div
              className="flex items-center space-x-2 text-sm"
              role="tablist"
              aria-label="메인 탭"
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                const order = tabs.map(t => t.id)
                const currentIndex = order.indexOf(activeTab)
                if (e.key === 'ArrowRight') {
                  const next = order[(currentIndex + 1) % order.length]
                  setActiveTab(next as typeof activeTab)
                } else if (e.key === 'ArrowLeft') {
                  const prev = order[(currentIndex - 1 + order.length) % order.length]
                  setActiveTab(prev as typeof activeTab)
                } else if (e.key === 'Home') {
                  setActiveTab(order[0] as typeof activeTab)
                } else if (e.key === 'End') {
                  setActiveTab(order[order.length - 1] as typeof activeTab)
                }
              }}
            >
              <button
                id="tab-search"
                role="tab"
                aria-selected={activeTab === 'search'}
                aria-controls="panel-search"
                tabIndex={activeTab === 'search' ? 0 : -1}
                onClick={() => setActiveTab('search')}
                ref={searchTabRef}
                className={`flex items-center px-3 py-1.5 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 ${activeTab==='search' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow' : 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 hover:scale-105'}`}
              >
                <Search className="w-4 h-4 mr-2" /> 검색
              </button>
              <button
                id="tab-results"
                role="tab"
                aria-selected={activeTab === 'results'}
                aria-controls="panel-results"
                tabIndex={activeTab === 'results' ? 0 : -1}
                onClick={() => setActiveTab('results')}
                ref={resultsTabRef}
                className={`flex items-center px-3 py-1.5 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 ${activeTab==='results' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow' : 'bg-gradient-to-r from-green-100 to-blue-100 text-gray-700 hover:scale-105'}`}
              >
                <BarChart3 className="w-4 h-4 mr-2" /> 결과
              </button>
              <button
                id="tab-keys"
                role="tab"
                aria-selected={activeTab === 'keys'}
                aria-controls="panel-keys"
                tabIndex={activeTab === 'keys' ? 0 : -1}
                onClick={() => setActiveTab('keys')}
                ref={keysTabRef}
                className={`flex items-center px-3 py-1.5 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 ${activeTab==='keys' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow' : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700 hover:scale-105'}`}
              >
                <Database className="w-4 h-4 mr-2" /> API 키
              </button>
              <div className="relative h-1 mt-1">
                <motion.div
                  className="absolute bottom-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  animate={{ x: underline.left, width: underline.width }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="ml-2 inline-flex items-center px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all"
                title={`테마: ${theme}`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠: 한 화면에 하나의 패널만 표시, 상단 버튼으로 이동 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 container-query">
        <AnimatePresence mode="wait">
        {activeTab === 'search' && (
          <motion.section
            id="panel-search"
            role="tabpanel"
            aria-labelledby="tab-search"
            className="panel bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col text-[15px] lg:text-[13px] xl:text-[14px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-medium">
                <Sparkles className="w-4 h-4 mr-2" /> 순위 분석
              </div>
              <h2 className="mt-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">네이버 쇼핑 순위 분석</h2>
            </div>
            <div className="p-5 lg:p-4">
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </motion.section>
        )}

        {activeTab === 'results' && (
          <motion.section
            id="panel-results"
            role="tabpanel"
            aria-labelledby="tab-results"
            className="panel bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col text-[15px] lg:text-[13px] xl:text-[14px]"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-xs font-medium">
                <TrendingUp className="w-4 h-4 mr-2" /> 저장된 결과
              </div>
              <h2 className="mt-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">검색 결과</h2>
            </div>
            <div className="p-5 lg:p-4">
              <ResultsList refreshTrigger={refreshTrigger} />
            </div>
          </motion.section>
        )}

        {activeTab === 'keys' && (
          <motion.section
            id="panel-keys"
            role="tabpanel"
            aria-labelledby="tab-keys"
            className="panel bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col text-[15px] lg:text-[13px] xl:text-[14px]"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium">
                <Zap className="w-4 h-4 mr-2" /> API 키 관리
              </div>
              <h2 className="mt-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">API 키 관리</h2>
            </div>
            <div className="p-5 lg:p-4">
              <ApiKeyManager />
            </div>
          </motion.section>
        )}
        </AnimatePresence>
      </main>

      {/* 푸터 */}
      <footer className="bg-white/60 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  네이버 쇼핑 순위 검색기
                </span>
              </div>
            </div>
            <div className="text-gray-600 text-sm space-y-1">
              <p>네이버 쇼핑 API를 사용하여 상품 순위를 검색합니다.</p>
              <p>검색 결과는 데이터베이스에 저장되어 비교 분석이 가능합니다.</p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <p className="text-xs text-gray-500">
                © 2024 네이버 쇼핑 순위 검색기. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
