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
  keywords: Array<{ name: string; param: string[] }>
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

  // 카테고리별 키워드 옵션
  const getKeywordOptions = (categoryName: string) => {
    const categoryKeywords = {
      '패션의류': [
        { name: '여성의류', param: ['여성의류', '원피스', '블라우스', '스커트'] },
        { name: '남성의류', param: ['남성의류', '셔츠', '바지', '자켓'] },
        { name: '신발', param: ['신발', '운동화', '구두', '부츠'] }
      ],
      '화장품/미용': [
        { name: '스킨케어', param: ['스킨케어', '토너', '세럼', '크림'] },
        { name: '메이크업', param: ['메이크업', '립스틱', '파운데이션', '아이섀도'] },
        { name: '향수', param: ['향수', '퍼퓸', '오드뚜왈렛'] }
      ],
      '디지털/가전': [
        { name: '스마트폰', param: ['스마트폰', '아이폰', '갤럭시', '안드로이드'] },
        { name: '노트북', param: ['노트북', '맥북', '삼성노트북', 'LG노트북'] },
        { name: '가전제품', param: ['가전제품', '냉장고', '세탁기', 'TV'] }
      ],
      '식품': [
        { name: '건강식품', param: ['건강식품', '비타민', '프로틴', '영양제'] },
        { name: '간식', param: ['간식', '과자', '사탕', '초콜릿'] },
        { name: '음료', param: ['음료', '커피', '차', '주스'] }
      ],
      '해외여행': [
        { name: '해외여행', param: ['해외여행', '해외패키지', '해외투어'] }, // 기본값
        { name: '일본여행', param: ['일본여행', '일본패키지', '일본투어'] },
        { name: '유럽여행', param: ['유럽여행', '유럽패키지', '유럽투어'] },
        { name: '동남아여행', param: ['동남아여행', '동남아패키지', '동남아투어'] },
        { name: '중국여행', param: ['중국여행', '중국패키지', '중국투어'] },
        { name: '미국여행', param: ['미국여행', '미국패키지', '미국투어'] }
      ],
      '국내여행': [
        { name: '국내여행', param: ['국내여행', '국내패키지', '국내투어'] },
        { name: '제주도', param: ['제주도', '제주여행', '제주패키지'] },
        { name: '강원도', param: ['강원도', '강원여행', '강원패키지'] }
      ],
      '항공권': [
        { name: '국내항공', param: ['국내항공', '국내항공권', '제주항공'] },
        { name: '해외항공', param: ['해외항공', '해외항공권', '국제항공'] },
        { name: 'LCC', param: ['LCC', '저가항공', '할인항공'] }
      ],
      '숙박': [
        { name: '호텔', param: ['호텔', '리조트', '콘도'] },
        { name: '펜션', param: ['펜션', '게스트하우스', '민박'] },
        { name: '모텔', param: ['모텔', '여관', '여인숙'] }
      ]
    }
    
    return categoryKeywords[categoryName as keyof typeof categoryKeywords] || [
      { name: '해외여행', param: ['해외여행', '해외패키지', '해외투어'] } // 기본값: 해외여행
    ]
  }

  // API 키 프로필 목록 가져오기
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/keys')
        const data = await response.json()
        if (response.ok) {
          setProfiles(data.profiles?.filter((p: any) => p.api_type === 'insights') || [])
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

    onAnalysis(formData)
  }

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      category: [...prev.category, { name: '해외여행', param: ['50000005'] }]
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
    setFormData(prev => {
      const newCategory = prev.category.map((c, i) => i === index ? category : c)
      
      // 카테고리가 변경되면 해당 카테고리의 첫 번째 키워드 옵션으로 키워드도 업데이트
      const newKeywordOptions = getKeywordOptions(category.name)
      const newKeywords = prev.keywords.map((k, i) => 
        i === 0 && newKeywordOptions.length > 0 ? newKeywordOptions[0] : k
      )
      
      return {
        ...prev,
        category: newCategory,
        keywords: newKeywords
      }
    })
  }

  const addKeyword = () => {
    setFormData(prev => {
      const currentCategory = prev.category[0]?.name || '해외여행' // 기본값: 해외여행
      const keywordOptions = getKeywordOptions(currentCategory)
      const defaultKeyword = keywordOptions.length > 0 ? keywordOptions[0] : { name: '해외여행', param: ['해외여행', '해외패키지', '해외투어'] }
      
      return {
        ...prev,
        keywords: [...prev.keywords, defaultKeyword]
      }
    })
  }

  const removeKeyword = (index: number) => {
    if (formData.keywords.length > 1) {
      setFormData(prev => ({
        ...prev,
        keywords: prev.keywords.filter((_, i) => i !== index)
      }))
    }
  }

  const updateKeyword = (index: number, keyword: { name: string; param: string[] }) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.map((k, i) => i === index ? keyword : k)
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
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      키워드 그룹 선택
                    </label>
                    <select
                      value={keyword.name}
                      onChange={(e) => {
                        const selected = getKeywordOptions(formData.category[0]?.name || '해외여행').find(opt => opt.name === e.target.value)
                        if (selected) {
                          updateKeyword(index, selected)
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {getKeywordOptions(formData.category[0]?.name || '해외여행').map(option => (
                        <option key={option.name} value={option.name}>{option.name}</option>
                      ))}
                    </select>
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
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    키워드 (쉼표로 구분, 최대 5개)
                  </label>
                  <input
                    type="text"
                    value={keyword.param.join(', ')}
                    onChange={(e) => {
                      const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      const newKeyword = { ...keyword, param: keywords }
                      updateKeyword(index, newKeyword)
                    }}
                    placeholder="예: 해외여행, 베트남 패키지, 푸꾸옥 여행"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    분석할 키워드를 쉼표로 구분하여 입력하거나 위에서 선택하세요 (최대 5개)
                  </p>
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
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-6 h-6" />
                <span>키워드 분석 시작</span>
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onAnalysis({ ...formData, save: true })}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-6 h-6" />
            <span>분석 후 저장</span>
          </motion.button>
        </div>
      </form>
    </div>
  )
}
