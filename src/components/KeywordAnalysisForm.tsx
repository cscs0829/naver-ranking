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
    // 분야 고정: 여가/생활편의 > 해외여행 > 해외패키지/기타 (cat_id=10008402)
    category: [{ name: '여가/생활편의 > 해외여행 > 해외패키지/기타', param: ['10008402'] }],
    keywords: [{ name: '여행관련', param: ['여행', '항공권', '캐리어'] }], // 기본값: 데이터가 있는 키워드
    device: '',
    gender: '',
    ages: [],
    profileId: undefined
  })

  const [showAdvanced, setShowAdvanced] = useState(true)
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

  // 분야 고정 옵션: 여가/생활편의 > 해외여행 > 해외패키지/기타
  const categoryOptions = [
    { name: '여가/생활편의 > 해외여행 > 해외패키지/기타', param: ['10008402'] }
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
  // 기간 프리셋 설정
  const setPeriod = (days: number) => {
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
    setFormData(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      timeUnit: days <= 31 ? 'date' : days <= 93 ? 'week' : 'month'
    }))
  }


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
        {/* 심플 검색 설정 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-orange-500" />
              검색 설정
            </h3>
            {/* 프로필 선택 상단 고정 */}
            <div className="w-64">
              <label htmlFor="profileIdTop" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">API 키 프로필</label>
              <select
                id="profileIdTop"
                value={formData.profileId ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, profileId: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="">기본 프로필</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}{p.is_default ? ' (기본)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 상단: 카테고리(고정) + 키워드 입력 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">분야</label>
              <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                여가/생활편의 &gt; 해외여행 &gt; 해외패키지/기타
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">검색어 (최대 5개, 쉼표로 구분)</label>
              <input
                type="text"
                value={formData.keywords[0]?.param?.join(', ') || ''}
                onChange={(e) => {
                  const inputValue = e.target.value
                  updateKeyword(0, 'param', [inputValue])
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value
                  const keywords = inputValue.split(',').map(k => k.trim()).filter(k => k).slice(0,5)
                  updateKeyword(0, 'param', keywords)
                }}
                placeholder="비교할 검색어 추가"
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 기간 프리셋 + 직접입력 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <button type="button" onClick={() => setPeriod(1)} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm">일간</button>
              <button type="button" onClick={() => setPeriod(30)} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm">1개월</button>
              <button type="button" onClick={() => setPeriod(90)} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm">3개월</button>
              <button type="button" onClick={() => setPeriod(365)} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm">1년</button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">시작</label>
              <input type="date" value={formData.startDate} onChange={(e)=>setFormData(prev=>({...prev,startDate:e.target.value}))} className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white" max={formData.endDate} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">종료</label>
                <input type="date" value={formData.endDate} onChange={(e)=>setFormData(prev=>({...prev,endDate:e.target.value}))} className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white" min={formData.startDate} max={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">단위</label>
                <select value={formData.timeUnit} onChange={(e)=>setFormData(prev=>({...prev,timeUnit:e.target.value as 'date'|'week'|'month'}))} className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  <option value="date">일별</option>
                  <option value="week">주별</option>
                  <option value="month">월별</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리(고정) - 간단 표시 */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <Globe className="w-6 h-6 mr-3 text-orange-500" />
            카테고리
          </h3>
          <div className="space-y-4">
            {formData.category.map((category, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      카테고리 (고정)
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
                      disabled
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
            
            {/* 고정 */}
          </div>
        </div>

        {/* 키워드 설정 (간단 입력 유지) */}
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

        {/* 기본 필터 - 항상 노출 */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">디바이스</label>
              <select value={formData.device || ''} onChange={(e)=>setFormData(prev=>({...prev, device: e.target.value as 'pc'|'mo'|''}))} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                <option value="">전체</option>
                <option value="pc">PC</option>
                <option value="mo">모바일</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">성별</label>
              <select value={formData.gender || ''} onChange={(e)=>setFormData(prev=>({...prev, gender: e.target.value as 'm'|'f'|''}))} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                <option value="">전체</option>
                <option value="m">남성</option>
                <option value="f">여성</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">연령대</label>
              <div className="grid grid-cols-3 gap-2">
                {['10','20','30','40','50','60'].map(age => (
                  <label key={age} className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.ages?.includes(age) || false} onChange={(e)=>{
                      const newAges = formData.ages || []
                      if(e.target.checked){ setFormData(prev=>({...prev, ages:[...newAges, age]})) } else { setFormData(prev=>({...prev, ages:newAges.filter(a=>a!==age)})) }
                    }} className="w-4 h-4 text-orange-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{age}대</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
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
