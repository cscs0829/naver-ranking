'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface SearchData {
  searchQuery: string
  targetMallName?: string
  targetBrand?: string
  targetProductName?: string
  maxPages: number
}

interface SearchFormProps {
  onSearch: (data: SearchData) => void
  isLoading: boolean
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [formData, setFormData] = useState<SearchData>({
    searchQuery: '',
    targetMallName: '',
    targetBrand: '',
    targetProductName: '',
    maxPages: 10
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.searchQuery.trim()) {
      onSearch(formData)
    }
  }

  const handleInputChange = (field: keyof SearchData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 검색어 */}
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-2">
            검색어 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="searchQuery"
            value={formData.searchQuery}
            onChange={(e) => handleInputChange('searchQuery', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 베트남 여행, 아이폰 케이스"
            required
          />
        </div>

        {/* 검색 옵션들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 타겟 상품명 */}
          <div>
            <label htmlFor="targetProductName" className="block text-sm font-medium text-gray-700 mb-2">
              타겟 상품명 (선택사항)
            </label>
            <input
              type="text"
              id="targetProductName"
              value={formData.targetProductName}
              onChange={(e) => handleInputChange('targetProductName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 베트남 다낭 패키지"
            />
            <p className="text-xs text-gray-500 mt-1">
              상품명에 포함되어야 할 키워드
            </p>
          </div>

          {/* 타겟 몰명 */}
          <div>
            <label htmlFor="targetMallName" className="block text-sm font-medium text-gray-700 mb-2">
              타겟 몰명 (선택사항)
            </label>
            <input
              type="text"
              id="targetMallName"
              value={formData.targetMallName}
              onChange={(e) => handleInputChange('targetMallName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 하나투어, 트리플클럽"
            />
            <p className="text-xs text-gray-500 mt-1">
              몰명에 포함되어야 할 키워드
            </p>
          </div>

          {/* 타겟 브랜드 */}
          <div>
            <label htmlFor="targetBrand" className="block text-sm font-medium text-gray-700 mb-2">
              타겟 브랜드 (선택사항)
            </label>
            <input
              type="text"
              id="targetBrand"
              value={formData.targetBrand}
              onChange={(e) => handleInputChange('targetBrand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 삼성, 애플"
            />
            <p className="text-xs text-gray-500 mt-1">
              브랜드명에 포함되어야 할 키워드
            </p>
          </div>

          {/* 최대 검색 페이지 */}
          <div>
            <label htmlFor="maxPages" className="block text-sm font-medium text-gray-700 mb-2">
              최대 검색 페이지
            </label>
            <select
              id="maxPages"
              value={formData.maxPages}
              onChange={(e) => handleInputChange('maxPages', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5페이지 (500개 상품)</option>
              <option value={10}>10페이지 (1,000개 상품)</option>
              <option value={20}>20페이지 (2,000개 상품)</option>
              <option value={50}>50페이지 (5,000개 상품)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              더 많은 페이지를 검색할수록 정확도가 높아집니다
            </p>
          </div>
        </div>

        {/* 검색 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !formData.searchQuery.trim()}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                순위 검색
              </>
            )}
          </button>
        </div>
      </form>

      {/* 사용법 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 사용법 안내</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong>검색어</strong>: 네이버 쇼핑에서 검색할 키워드를 입력하세요</li>
          <li>• <strong>타겟 상품명</strong>: 찾고자 하는 상품명에 포함되어야 할 키워드</li>
          <li>• <strong>타겟 몰명</strong>: 특정 몰에서 판매하는 상품을 찾을 때</li>
          <li>• <strong>타겟 브랜드</strong>: 특정 브랜드의 상품을 찾을 때</li>
          <li>• 같은 검색어로 다시 검색하면 기존 데이터가 자동으로 업데이트됩니다</li>
        </ul>
      </div>
    </div>
  )
}