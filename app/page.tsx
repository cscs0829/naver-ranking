'use client'

import { useState, useEffect } from 'react'
import SearchForm from '@/components/SearchForm'
import ResultsList from '@/components/ResultsList'
import ApiKeyManager from '@/components/ApiKeyManager'
import { Search, BarChart3, Database, Sparkles, TrendingUp, Zap } from 'lucide-react'

interface SearchData {
  searchQuery: string
  targetMallName?: string
  targetBrand?: string
  targetProductName?: string
  maxPages: number
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState<'search' | 'results' | 'keys'>('search')
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
        if (result.data.found) {
          alert(`상품을 찾았습니다!\n페이지: ${result.data.page}페이지\n순위: ${result.data.rank_in_page}번째\n전체 순위: ${result.data.total_rank}위`)
        } else {
          alert('검색 결과에서 상품을 찾을 수 없습니다.')
        }
        
        // 결과 목록 새로고침
        setRefreshTrigger(prev => prev + 1)
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
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 transition-all duration-300 hover:scale-105">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-medium">순위 분석</span>
              </div>
              <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-gray-700 transition-all duration-300 hover:scale-105">
                <Database className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-medium">데이터 저장</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                검색
                {activeTab === 'search' && <Sparkles className="w-4 h-4 ml-2 animate-pulse" />}
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === 'results'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                결과
                {activeTab === 'results' && <TrendingUp className="w-4 h-4 ml-2 animate-pulse" />}
              </button>
              <button
                onClick={() => setActiveTab('keys')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === 'keys'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Database className="w-4 h-4 mr-2" />
                API 키 관리
                {activeTab === 'keys' && <Zap className="w-4 h-4 ml-2 animate-pulse" />}
              </button>
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'search' && (
            <div className="animate-fade-in">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  상품 순위 검색 및 비교
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  네이버 쇼핑 순위 분석
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  네이버 쇼핑에서 상품의 순위를 검색하고, 여러 검색어의 결과를 비교해보세요.
                  <br />
                  <span className="text-blue-600 font-medium">같은 검색어로 다시 검색하면 기존 데이터가 자동으로 업데이트됩니다.</span>
                </p>
              </div>

              {/* 검색 폼 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="animate-fade-in">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-medium mb-4">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  검색 결과 분석
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  검색 결과
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  저장된 검색 결과를 확인하고 분석해보세요.
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <ResultsList refreshTrigger={refreshTrigger} />
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="animate-fade-in">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-4">
                  <Zap className="w-4 h-4 mr-2" />
                  API 키 관리
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  API 키 관리
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  네이버 API 키를 관리하고 설정을 확인하세요.
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <ApiKeyManager />
              </div>
            </div>
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
