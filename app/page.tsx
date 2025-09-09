'use client'

import { useState } from 'react'
import SearchForm from '@/components/SearchForm'
import ResultsList from '@/components/ResultsList'
import ApiKeyManager from '@/components/ApiKeyManager'
import { Search, BarChart3, Database } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <Search className="w-8 h-8 text-blue-600 mr-3" />
                  <h1 className="text-xl font-bold text-gray-900">
                    네이버 쇼핑 순위 검색기
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-1" />
                순위 분석
              </div>
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-1" />
                데이터 저장
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Search className="w-4 h-4 mr-2 inline" />
                검색
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2 inline" />
                결과
              </button>
              <button
                onClick={() => setActiveTab('keys')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'keys'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="w-4 h-4 mr-2 inline" />
                API 키 관리
              </button>
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'search' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                상품 순위 검색 및 비교
              </h2>
              <p className="text-gray-600">
                네이버 쇼핑에서 상품의 순위를 검색하고, 여러 검색어의 결과를 비교해보세요.
                <br />
                같은 검색어로 다시 검색하면 기존 데이터가 자동으로 업데이트됩니다.
              </p>
            </div>

            {/* 검색 폼 */}
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              검색 결과
            </h2>
            <ResultsList refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'keys' && (
          <ApiKeyManager />
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>네이버 쇼핑 API를 사용하여 상품 순위를 검색합니다.</p>
            <p className="mt-1">검색 결과는 데이터베이스에 저장되어 비교 분석이 가능합니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
