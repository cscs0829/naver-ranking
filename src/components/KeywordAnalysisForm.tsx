'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, Save, Globe, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
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
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    timeUnit: 'date',
    category: [{ name: '여가/생활편의 > 해외여행 > 해외패키지/기타', param: ['50000005'] }],
    keywords: [{ name: '', param: [] }],
    device: '',
    gender: '',
    ages: [],
    profileId: undefined
  })

  const [profiles, setProfiles] = useState<{ id: number; name: string; is_default: boolean }[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProfiles(true)
        const res = await fetch('/api/keys?api_type=insights')
        const data = await res.json()
        if (res.ok && data.profiles) {
          const insightsProfiles = data.profiles.filter((p: any) => p.api_type === 'insights')
          setProfiles(insightsProfiles)
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

  const categoryOptions = [
    { name: '여가/생활편의 > 해외여행 > 해외패키지/기타', param: ['50000005'] }
  ]

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

    if (formData.keywords.length === 0) {
      toast('최소 1개의 키워드를 입력해주세요.', 'error')
      return
    }

    const valid = (formData.keywords[0]?.param || []).filter(k => k && k.trim().length > 0)
    if (valid.length === 0) {
      toast('최소 하나 이상의 유효한 키워드를 입력해주세요.', 'error')
      return
    }

    onAnalysis({ ...formData, keywords: [{ name: '검색어', param: valid.slice(0, 5) }] })
  }

  return (
    <div className="p-8 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-orange-500" />
              검색 설정
            </h3>
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
                  setFormData(prev => ({ ...prev, keywords: [{ name: '검색어', param: [inputValue] }] }))
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value
                  const keywords = inputValue.split(',').map(k => k.trim()).filter(k => k).slice(0,5)
                  setFormData(prev => ({ ...prev, keywords: [{ name: '검색어', param: keywords }] }))
                }}
                placeholder="비교할 검색어 추가"
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

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

        <div className="flex justify-center pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
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
