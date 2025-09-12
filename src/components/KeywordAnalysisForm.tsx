'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, Filter, Download, Save, TrendingUp, Globe, Users, Smartphone, Monitor, ChevronDown, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/utils/toast'

interface KeywordAnalysisData {
  startDate: string
  endDate: string
  timeUnit: 'date' | 'week' | 'month'
  category: Array<{ name: string; param: string[] }>
  keywords: Array<{ name: string; param: string[]; placeholder?: string }>
  device?: 'pc' | 'mo' | ''
  gender?: 'm' | 'f' | ''
  ages?: string[]
  profileId?: number
  save?: boolean
}

interface KeywordAnalysisFormProps {
  onAnalysis: (data: KeywordAnalysisData) => void
  isLoading: boolean
}

export default function KeywordAnalysisForm({ onAnalysis, isLoading }: KeywordAnalysisFormProps) {
  const [formData, setFormData] = useState<KeywordAnalysisData>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 전
    endDate: new Date().toISOString().split('T')[0], // 오늘
    timeUnit: 'date',
    category: [{ name: '해외여행', param: ['50000005'] }], // 기본값: 해외여행 (여행사 특화)
    keywords: [{ name: '해외여행', param: ['해외여행', '해외패키지', '해외투어'] }], // 기본값: 해외여행 키워드
    device: '',
    gender: '',
    ages: []
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])

  // 네이버 쇼핑 카테고리 옵션 (여행 관련이 우선, 해외여행이 기본값)
  const categoryOptions = [
    // 여행 관련 카테고리 (우선순위)
    { name: '해외여행', param: ['50000005'] }, // 기본값
    { name: '국내여행', param: ['50000006'] },
    { name: '항공권', param: ['50000007'] },
    { name: '숙박', param: ['50000008'] },
    { name: '렌터카', param: ['50000009'] },
    { name: '여행용품', param: ['50000010'] },
    // 기타 카테고리
    { name: '패션의류', param: ['50000000'] },
    { name: '화장품/미용', param: ['50000002'] },
    { name: '식품', param: ['50000003'] },
    { name: '생활용품', param: ['50000004'] },
    { name: '디지털/가전', param: ['50000001'] },
    { name: '스포츠/레저', param: ['50000011'] }
  ]

  // 키워드 예시 (참고용)
  const keywordExamples = [
    { name: '해외여행', placeholder: '해외여행, 해외패키지, 해외투어' },
    { name: '일본여행', placeholder: '일본여행, 일본패키지, 일본투어' },
    { name: '유럽여행', placeholder: '유럽여행, 유럽패키지, 유럽투어' },
    { name: '동남아여행', placeholder: '동남아여행, 동남아패키지, 동남아투어' },
    { name: '패션의류', placeholder: '여성의류, 원피스, 블라우스, 스커트' },
    { name: '화장품', placeholder: '스킨케어, 토너, 세럼, 크림' },
    { name: '디지털', placeholder: '스마트폰, 아이폰, 갤럭시, 안드로이드' }
  ]

  // API 키 프로필 목록 가져오기 (쇼핑검색 API만)
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/keys?api_type=shopping')
        const data = await response.json()
        if (response.ok) {
          setProfiles(data.profiles || [])
          // 기본 프로필 설정
          const defaultProfile = data.profiles?.find((p: any) => p.is_default)
          if (defaultProfile) {
            setFormData(prev => ({ ...prev, profileId: defaultProfile.id }))
          }
        }
      } catch (error) {
        console.error('프로필 조회 오류:', error)
      }
    }
    fetchProfiles()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.category.length === 0) {
      toast('최소 1개의 카테고리를 선택해주세요.', 'error')
      return
    }
    
    if (formData.keywords.length === 0) {
      toast('최소 1개의 키워드를 선택해주세요.', 'error')
      return
    }

    // profileId가 없으면 기본 프로필 사용
    const analysisData = {
      ...formData,
      profileId: formData.profileId || profiles.find(p => p.is_default)?.id,
      save: true
    }

    onAnalysis(analysisData)
  }

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      category: [...prev.category, { name: '해외여행', param: ['50000005'] }] // 기본값: 해외여행
    }))
  }

  const removeCategory = (index: number) => {
    if (formData.category.length > 1) {
      setFormData(prev => ({
        ...prev,
        category: prev.category.filter((_, i) => i !== index)
      }))
    }
  }

  const updateCategory = (index: number, category: { name: string; param: string[] }) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.map((c, i) => i === index ? category : c)
    }))
  }

  const addKeyword = () => {
    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, { name: '', param: [] }] // 빈 값으로 시작
    }))
  }

  const removeKeyword = (index: number) => {
    if (formData.keywords.length > 1) {
      setFormData(prev => ({
        ...prev,
        keywords: prev.keywords.filter((_, i) => i !== index)
      }))
    }
  }

  const updateKeyword = (index: number, field: 'name' | 'param' | 'placeholder', value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.map((k, i) => 
        i === index 
          ? { ...k, [field]: value }
          : k
      )
    }))
  }

  return (
    <div className="p-8 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 설정 */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-orange-500" />
            분석 기간 설정
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                max={formData.endDate}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                min={formData.startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                시간 단위
              </label>
              <select
                value={formData.timeUnit}
                onChange={(e) => setFormData(prev => ({ ...prev, timeUnit: e.target.value as 'date' | 'week' | 'month' }))}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="date">일별</option>
                <option value="week">주별</option>
                <option value="month">월별</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                API 키 프로필
              </label>
              <select
                value={formData.profileId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, profileId: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">기본 프로필 사용</option>
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} {profile.is_default ? '(기본)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 카테고리 설정 */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <Globe className="w-6 h-6 mr-3 text-orange-500" />
            분석 카테고리
          </h3>
          
          <div className="space-y-4">
            {formData.category.map((category, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      카테고리 선택
                    </label>
                    <select
                      value={category.name}
                      onChange={(e) => {
                        const selected = categoryOptions.find(opt => opt.name === e.target.value)
                        if (selected) {
                          updateCategory(index, selected)
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.name} value={option.name}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  {formData.category.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addCategory}
              className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>카테고리 추가</span>
            </button>
          </div>
        </div>

        {/* 키워드 설정 */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <Search className="w-6 h-6 mr-3 text-orange-500" />
            분석 키워드
          </h3>
          
          <div className="space-y-4">
            {formData.keywords.map((keyword, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        키워드 그룹 이름
                      </label>
                      <input
                        type="text"
                        value={keyword.name}
                        onChange={(e) => updateKeyword(index, 'name', e.target.value)}
                        placeholder="예) 해외여행, 일본여행, 패션의류"
                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    {formData.keywords.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      키워드 (쉼표로 구분, 최대 5개)
                    </label>
                    <input
                      type="text"
                      value={keyword.param.join(', ')}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        const keywords = inputValue.split(',').map(k => k.trim()).filter(k => k)
                        console.log('입력값:', inputValue)
                        console.log('분리된 키워드:', keywords)
                        updateKeyword(index, 'param', keywords)
                      }}
                      placeholder={keyword.placeholder || "예) 해외여행, 베트남 패키지, 푸꾸옥 여행"}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      분석할 키워드를 쉼표로 구분하여 입력하세요 (최대 5개)
                    </p>
                  </div>
                  
                  {/* 키워드 예시 표시 */}
                  <div className="mt-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">키워드 예시 (클릭하여 자동 입력) 또는 직접 입력:</p>
                    <div className="flex flex-wrap gap-2">
                      {keywordExamples.map(example => (
                        <button
                          key={example.name}
                          type="button"
                          onClick={() => {
                            updateKeyword(index, 'name', example.name)
                            updateKeyword(index, 'param', [])
                            updateKeyword(index, 'placeholder', example.placeholder)
                          }}
                          className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                        >
                          {example.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          updateKeyword(index, 'name', '')
                          updateKeyword(index, 'param', [])
                          updateKeyword(index, 'placeholder', '')
                        }}
                        className="px-3 py-1 text-xs bg-orange-200 dark:bg-orange-600 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-300 dark:hover:bg-orange-500 transition-colors font-medium"
                      >
                        직접 입력
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addKeyword}
              className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>키워드 추가</span>
            </button>
          </div>
        </div>

        {/* 고급 설정 */}
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>고급 설정</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      디바이스
                    </label>
                    <select
                      value={formData.device || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, device: e.target.value as 'pc' | 'mo' | '' }))}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">전체</option>
                      <option value="pc">PC</option>
                      <option value="mo">모바일</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      성별
                    </label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'm' | 'f' | '' }))}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">전체</option>
                      <option value="m">남성</option>
                      <option value="f">여성</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      연령대
                    </label>
                    <div className="space-y-2">
                      {['10', '20', '30', '40', '50', '60'].map(age => (
                        <label key={age} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.ages?.includes(age) || false}
                            onChange={(e) => {
                              const newAges = formData.ages || []
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, ages: [...newAges, age] }))
                              } else {
                                setFormData(prev => ({ ...prev, ages: newAges.filter(a => a !== age) }))
                              }
                            }}
                            className="w-4 h-4 text-orange-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{age}대</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {profiles.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      API 프로필 (쇼핑인사이트)
                    </label>
                    <select
                      value={formData.profileId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, profileId: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">기본 프로필 사용</option>
                      {profiles.map(profile => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name} {profile.is_default ? '(기본)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-center pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onAnalysis(formData)}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>키워드 분석 및 저장</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
