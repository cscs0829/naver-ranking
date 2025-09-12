'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, Filter, Download, Save, TrendingUp, Globe, Users, Smartphone, Monitor, ChevronDown, Plus, X, Sparkles } from 'lucide-react'
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
    ages: [],
    profileId: undefined
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [profiles, setProfiles] = useState<{ id: number; name: string; is_default: boolean }[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)

  // 프로필 목록 로드 (쇼핑인사이트 API만)
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProfiles(true)
        const res = await fetch('/api/keys?api_type=insights')
        const data = await res.json()
        if (res.ok && data.profiles) {
          // 쇼핑인사이트 API 타입만 필터링
          const insightsProfiles = data.profiles.filter((p: any) => p.api_type === 'insights')
          setProfiles(insightsProfiles)
          // 기본 프로필을 자동으로 선택
          const defaultProfile = insightsProfiles?.find((p: any) => p.is_default)
          if (defaultProfile) {
            setFormData(prev => ({ ...prev, profileId: defaultProfile.id }))
          }
        }
      } catch (e) {
        console.error('프로필 조회 오류:', e)
      } finally {
        setLoadingProfiles(false)
      }
    }
    load()
  }, [])

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

    // 키워드 유효성 검사
    const validKeywords = formData.keywords.filter(k => 
      k && k.param && k.param.length > 0 && k.param.some(keyword => keyword.trim().length > 0)
    )
    
    if (validKeywords.length === 0) {
      toast('최소 하나 이상의 유효한 키워드를 입력해주세요.', 'error')
      return
    }

    onAnalysis(formData)
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
                        // 입력 중에는 원본 텍스트를 그대로 저장 (쉼표 분리하지 않음)
                        updateKeyword(index, 'param', [inputValue])
                      }}
                      onBlur={(e) => {
                        // 포커스를 잃을 때만 쉼표로 분리
                        const inputValue = e.target.value
                        // 빈 문자열, 공백만 있는 문자열, 쉼표만 있는 경우를 제거
                        const keywords = inputValue
                          .split(',')
                          .map(k => k.trim())
                          .filter(k => k && k.length > 0)
                          .slice(0, 5)
                        console.log('입력값:', inputValue)
                        console.log('분리된 키워드:', keywords)
                        updateKeyword(index, 'param', keywords)
                      }}
                      onKeyDown={(e) => {
                        // Enter 키로도 키워드를 추가할 수 있도록 처리
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const inputValue = e.currentTarget.value
                          const keywords = inputValue
                            .split(',')
                            .map(k => k.trim())
                            .filter(k => k && k.length > 0)
                            .slice(0, 5)
                          updateKeyword(index, 'param', keywords)
                        }
                      }}
                      placeholder={keyword.placeholder || "예) 해외여행, 베트남 패키지, 푸꾸옥 여행"}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      분석할 키워드를 쉼표로 구분하여 입력하세요 (최대 5개)
                    </p>
                    
                    {/* 여행사 키워드 가이드 */}
                    <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">💡 여행사 키워드 추천:</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                        <div><strong>해외여행:</strong> 해외여행, 해외패키지, 해외투어, 해외자유여행</div>
                        <div><strong>국내여행:</strong> 국내여행, 국내패키지, 당일치기, 주말여행</div>
                        <div><strong>지역별:</strong> 동남아여행, 유럽여행, 일본여행, 중국여행</div>
                        <div><strong>테마여행:</strong> 신혼여행, 가족여행, 혼자여행, 힐링여행</div>
                        <div><strong>계절여행:</strong> 여름휴가, 겨울여행, 봄여행, 가을여행</div>
                      </div>
                    </div>
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
                        onChange={(e) => setFormData(prev => ({ ...prev, profileId: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-full px-4 py-4 pl-12 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                        disabled={isLoading}
                      >
                        <option value="">기본 프로필 사용</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {p.is_default ? ' (기본)' : ''}
                          </option>
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
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
