'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface SearchFormProps {
  onSearch: (data: SearchData) => void
  isLoading: boolean
}

interface SearchData {
  searchQuery: string
  targetMallName?: string
  targetBrand?: string
  targetProductName?: string
  maxPages: number
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2" />
        상품 순위 검색
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색어 *
            </label>
            <input
              type="text"
              value={formData.searchQuery}
              onChange={(e) => handleInputChange('searchQuery', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 베트남 여행"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              쇼핑몰명
            </label>
            <input
              type="text"
              value={formData.targetMallName}
              onChange={(e) => handleInputChange('targetMallName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 하나투어"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              브랜드명
            </label>
            <input
              type="text"
              value={formData.targetBrand}
              onChange={(e) => handleInputChange('targetBrand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 나이키"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상품명
            </label>
            <input
              type="text"
              value={formData.targetProductName}
              onChange={(e) => handleInputChange('targetProductName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 에어맥스 270"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            최대 검색 페이지 수
          </label>
          <select
            value={formData.maxPages}
            onChange={(e) => handleInputChange('maxPages', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5페이지</option>
            <option value={10}>10페이지</option>
            <option value={20}>20페이지</option>
            <option value={50}>50페이지</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.searchQuery.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              검색 중...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              검색 시작
            </>
          )}
        </button>
      </form>
    </div>
  )
}
