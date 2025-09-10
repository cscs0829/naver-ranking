'use client'

import { useState, useEffect } from 'react'
import SearchForm from '@/components/SearchForm'
import ResultsList from '@/components/ResultsList'
import ApiKeyManager from '@/components/ApiKeyManager'
import { Search, BarChart3, Database, Sparkles, TrendingUp, Zap, KeyRound } from 'lucide-react'

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
  const [showKeysPanel, setShowKeysPanel] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
          if (top) {
            alert(`1등 상품: ${top.product_title}\n링크: ${top.product_link || '-'}\n페이지: ${top.page} / 순위: ${top.rank_in_page} (전체 ${top.total_rank})`)
          } else {
            alert('조건에 맞는 결과가 없습니다.')
          }
        } else {
          // 저장 모드: 결과 탭으로 이동해 관리
          setActiveTab('results')
          setRefreshTrigger(prev => prev + 1)
        }
      } else {
        alert(`검색 중 오류가 발생했습니다: ${result.error}`)
      }
    } catch (error) {
      console.error('검색 오류:', error)
      alert('검색 중 오류가 발생했습니다.')
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
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => setShowKeysPanel(v => !v)}
                className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700 transition-all duration-300 hover:scale-105"
              >
                <KeyRound className="w-4 h-4 mr-2 text-purple-600" />
                <span className="font-medium">API 키 패널 {showKeysPanel ? '숨기기' : '보이기'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠: 반응형 그리드 (모바일 1열, lg 2열, xl 3열), 패널 내부 스크롤 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {/* 검색 패널 */}
          <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-medium">
                <Sparkles className="w-4 h-4 mr-2" /> 순위 분석
              </div>
              <h2 className="mt-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">네이버 쇼핑 순위 분석</h2>
            </div>
            <div className="p-5 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </section>

          {/* 결과 패널 */}
          <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col lg:col-span-1 xl:col-span-1">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-xs font-medium">
                <TrendingUp className="w-4 h-4 mr-2" /> 저장된 결과
              </div>
              <h2 className="mt-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">검색 결과</h2>
            </div>
            <div className="p-5 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <ResultsList refreshTrigger={refreshTrigger} />
            </div>
          </section>

          {/* API 키 패널 (표시 토글) */}
          {showKeysPanel && (
            <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col">
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium">
                  <Zap className="w-4 h-4 mr-2" /> API 키 관리
                </div>
                <h2 className="mt-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">API 키 관리</h2>
              </div>
              <div className="p-5 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <ApiKeyManager />
              </div>
            </section>
          )}
        </div>
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
