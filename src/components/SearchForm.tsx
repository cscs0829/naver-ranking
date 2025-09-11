'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Target, Building2, Tag, BarChart3, Sparkles, Zap, Database, ChevronDown, Info } from 'lucide-react'

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
    save: true
  })
  const [profiles, setProfiles] = useState<{ id: number; name: string; is_default: boolean }[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

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
    <div className="p-8 space-y-8">
      {/* 메인 검색 섹션 */}
      <div className="space-y-6">
        {/* 검색어 입력 */}
        <div className="space-y-3">
          <label htmlFor="searchQuery" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
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
              className="w-full px-4 py-4 pl-12 pr-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="예: 베트남 여행, 아이폰 케이스"
              required
              disabled={isLoading}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">최소 1자 이상 입력하세요.</p>
        </div>

        {/* 고급 옵션 토글 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <span className="font-medium">고급 옵션</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 고급 옵션들 */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API 키 프로필 */}
                <div className="space-y-3">
                  <label htmlFor="profileId" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                    사용할 API 키 프로필
                  </label>
                  <div className="relative">
                    <select
                      id="profileId"
                      value={formData.profileId ?? ''}
                      onChange={(e) => handleInputChange('profileId', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-4 py-4 pl-12 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                      disabled={isLoading}
                    >
                      <option value="">기본 프로필(설정 시)</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}{p.is_default ? ' (기본)' : ''}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Sparkles className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  {loadingProfiles && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">프로필 불러오는 중...</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">선택하지 않으면 기본 프로필이 사용됩니다.</p>
                </div>
                
                {/* 타겟 상품명 */}
                <div className="space-y-3">
                  <label htmlFor="targetProductName" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Target className="w-4 h-4 mr-2 text-emerald-600" />
                    타겟 상품명
                    <span className="text-slate-400 text-xs ml-2">(선택사항)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="targetProductName"
                      value={formData.targetProductName}
                      onChange={(e) => handleInputChange('targetProductName', e.target.value)}
                      className="w-full px-4 py-4 pl-12 pr-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                      placeholder="예: 베트남 다낭 패키지"
                      disabled={isLoading}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Target className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    상품명에 포함되어야 할 키워드
                  </p>
                </div>

                {/* 타겟 몰명 */}
                <div className="space-y-3">
                  <label htmlFor="targetMallName" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                    타겟 몰명
                    <span className="text-slate-400 text-xs ml-2">(선택사항)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="targetMallName"
                      value={formData.targetMallName}
                      onChange={(e) => handleInputChange('targetMallName', e.target.value)}
                      className="w-full px-4 py-4 pl-12 pr-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                      placeholder="예: 하나투어, 트리플클럽"
                      disabled={isLoading}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    몰명에 포함되어야 할 키워드
                  </p>
                </div>

                {/* 타겟 브랜드 */}
                <div className="space-y-3">
                  <label htmlFor="targetBrand" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Tag className="w-4 h-4 mr-2 text-orange-600" />
                    타겟 브랜드
                    <span className="text-slate-400 text-xs ml-2">(선택사항)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="targetBrand"
                      value={formData.targetBrand}
                      onChange={(e) => handleInputChange('targetBrand', e.target.value)}
                      className="w-full px-4 py-4 pl-12 pr-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                      placeholder="예: 삼성, 애플"
                      disabled={isLoading}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Tag className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    브랜드명에 포함되어야 할 키워드
                  </p>
                </div>
              </div>

              {/* 최대 검색 페이지 */}
              <div className="space-y-3">
                <label htmlFor="maxPages" className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
                  최대 검색 페이지
                </label>
                <div className="relative">
                  <select
                    id="maxPages"
                    value={formData.maxPages}
                    onChange={(e) => handleInputChange('maxPages', parseInt(e.target.value))}
                    className="w-full px-4 py-4 pl-12 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                    disabled={isLoading}
                  >
                    <option value={5}>5페이지 (500개 상품)</option>
                    <option value={10}>10페이지 (1,000개 상품)</option>
                    <option value={20}>20페이지 (2,000개 상품)</option>
                    <option value={50}>50페이지 (5,000개 상품)</option>
                  </select>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <BarChart3 className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  더 많은 페이지를 검색할수록 정확도가 높아집니다
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 검색 버튼 */}
      <div className="flex justify-center pt-6">
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleAnalyzeAndSave}
          disabled={isLoading || !formData.searchQuery.trim()}
          className="group relative flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              <span>검색 중...</span>
            </>
          ) : (
            <>
              <Database className="w-6 h-6 mr-3" />
              <span>검색 실행</span>
              <Sparkles className="w-5 h-5 ml-2 group-hover:animate-pulse" />
            </>
          )}
        </motion.button>
      </div>

      {/* 사용법 안내 */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
            <Info className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            사용법 안내
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">검색어 입력</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">네이버 쇼핑에서 검색할 키워드를 입력하세요</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">타겟 상품명</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">찾고자 하는 상품명에 포함되어야 할 키워드</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">타겟 몰명</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">특정 몰에서 판매하는 상품을 찾을 때</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">4</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">타겟 브랜드</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">특정 브랜드의 상품을 찾을 때</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-600">
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center">
            <Zap className="w-3 h-3 mr-2 text-yellow-500" />
            <strong>팁:</strong> 같은 검색어로 다시 검색하면 기존 데이터가 자동으로 업데이트됩니다
          </p>
        </div>
      </div>
    </div>
  )
}