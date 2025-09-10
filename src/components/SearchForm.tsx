'use client'

import React, { useEffect, useState } from 'react'
import { Search, Loader2, Target, Building2, Tag, BarChart3, Sparkles, Zap } from 'lucide-react'

interface SearchData {
  searchQuery: string
  targetMallName?: string
  targetBrand?: string
  targetProductName?: string
  maxPages: number
  profileId?: number
  save?: boolean
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
    maxPages: 10,
    profileId: undefined,
    save: false
  })
  const [profiles, setProfiles] = useState<{ id: number; name: string; is_default: boolean }[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)

  // 프로필 목록 로드
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProfiles(true)
        const res = await fetch('/api/keys')
        const data = await res.json()
        if (res.ok && data.profiles) {
          setProfiles(data.profiles)
          const def = data.profiles.find((p: any) => p.is_default)
          if (def) {
            setFormData(prev => ({ ...prev, profileId: def.id }))
          }
        }
      } catch (e) {
        // noop
      } finally {
        setLoadingProfiles(false)
      }
    }
    load()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.searchQuery.trim()) {
      onSearch(formData)
    }
  }

  const handleAnalyzeOnly = () => {
    if (!formData.searchQuery.trim()) return
    onSearch({ ...formData, save: false })
  }

  const handleAnalyzeAndSave = () => {
    if (!formData.searchQuery.trim()) return
    onSearch({ ...formData, save: true })
  }

  const handleInputChange = (field: keyof SearchData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 검색어 */}
        <div className="space-y-3">
          <label htmlFor="searchQuery" className="flex items-center text-sm font-semibold text-gray-800">
            <Search className="w-4 h-4 mr-2 text-blue-600" />
            검색어 
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="searchQuery"
              value={formData.searchQuery}
              onChange={(e) => handleInputChange('searchQuery', e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              placeholder="예: 베트남 여행, 아이폰 케이스"
              required
            />
            <div className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* 검색 옵션들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* API 키 프로필 */}
          <div className="space-y-3">
            <label htmlFor="profileId" className="flex items-center text-sm font-semibold text-gray-800">
              <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
              사용할 API 키 프로필
            </label>
            <div className="relative">
              <select
                id="profileId"
                value={formData.profileId ?? ''}
                onChange={(e) => handleInputChange('profileId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none"
              >
                <option value="">기본 프로필(설정 시)</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}{p.is_default ? ' (기본)' : ''}</option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Sparkles className="w-5 h-5 text-gray-400" />
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {loadingProfiles && (
              <p className="text-xs text-gray-500">프로필 불러오는 중...</p>
            )}
          </div>
          {/* 타겟 상품명 */}
          <div className="space-y-3">
            <label htmlFor="targetProductName" className="flex items-center text-sm font-semibold text-gray-800">
              <Target className="w-4 h-4 mr-2 text-green-600" />
              타겟 상품명
              <span className="text-gray-400 text-xs ml-2">(선택사항)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="targetProductName"
                value={formData.targetProductName}
                onChange={(e) => handleInputChange('targetProductName', e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder="예: 베트남 다낭 패키지"
              />
              <div className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2">
                <Target className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              상품명에 포함되어야 할 키워드
            </p>
          </div>

          {/* 타겟 */}
          <div className="space-y-3">
            <label htmlFor="targetMallName" className="flex items-center text-sm font-semibold text-gray-800">
              <Building2 className="w-4 h-4 mr-2 text-purple-600" />
              타겟 몰명
              <span className="text-gray-400 text-xs ml-2">(선택사항)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="targetMallName"
                value={formData.targetMallName}
                onChange={(e) => handleInputChange('targetMallName', e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder="예: 하나투어, 트리플클럽"
              />
              <div className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2">
                <Building2 className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              몰명에 포함되어야 할 키워드
            </p>
          </div>

          {/* 타겟 브랜드 */}
          <div className="space-y-3">
            <label htmlFor="targetBrand" className="flex items-center text-sm font-semibold text-gray-800">
              <Tag className="w-4 h-4 mr-2 text-orange-600" />
              타겟 브랜드
              <span className="text-gray-400 text-xs ml-2">(선택사항)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="targetBrand"
                value={formData.targetBrand}
                onChange={(e) => handleInputChange('targetBrand', e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder="예: 삼성, 애플"
              />
              <div className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2">
                <Tag className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              브랜드명에 포함되어야 할 키워드
            </p>
          </div>

          {/* 최대 검색 페이지 */}
          <div className="space-y-3">
            <label htmlFor="maxPages" className="flex items-center text-sm font-semibold text-gray-800">
              <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
              최대 검색 페이지
            </label>
            <div className="relative">
              <select
                id="maxPages"
                value={formData.maxPages}
                onChange={(e) => handleInputChange('maxPages', parseInt(e.target.value))}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none"
              >
                <option value={5}>5페이지 (500개 상품)</option>
                <option value={10}>10페이지 (1,000개 상품)</option>
                <option value={20}>20페이지 (2,000개 상품)</option>
                <option value={50}>50페이지 (5,000개 상품)</option>
              </select>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              더 많은 페이지를 검색할수록 정확도가 높아집니다
            </p>
          </div>
        </div>

        {/* 검색 버튼 */}
        <div className="flex justify-center pt-4 gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleAnalyzeOnly}
            disabled={isLoading || !formData.searchQuery.trim()}
            className="group relative flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                <span>순위 분석</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleAnalyzeAndSave}
            disabled={isLoading || !formData.searchQuery.trim()}
            className="group relative flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="w-5 h-5 mr-2" />
            <span>데이터 저장</span>
          </button>
        </div>
      </form>

      {/* 사용법 안내 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            사용법 안내
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">검색어 입력</p>
                <p className="text-xs text-gray-600">네이버 쇼핑에서 검색할 키워드를 입력하세요</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">타겟 상품명</p>
                <p className="text-xs text-gray-600">찾고자 하는 상품명에 포함되어야 할 키워드</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">타겟 몰명</p>
                <p className="text-xs text-gray-600">특정 몰에서 판매하는 상품을 찾을 때</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-xs font-bold">4</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">타겟 브랜드</p>
                <p className="text-xs text-gray-600">특정 브랜드의 상품을 찾을 때</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-200">
          <p className="text-xs text-gray-600 flex items-center">
            <Zap className="w-3 h-3 mr-2 text-yellow-500" />
            <strong>팁:</strong> 같은 검색어로 다시 검색하면 기존 데이터가 자동으로 업데이트됩니다
          </p>
        </div>
      </div>
    </div>
  )
}