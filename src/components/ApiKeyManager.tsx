'use client'

import { useState, useEffect } from 'react'
import { Key, Settings, CheckCircle, AlertCircle, Sparkles, Zap, Star, Plus, Eye, EyeOff, Trash2, Edit, Save, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ApiKeyManager() {
  const [keys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKey, setNewKey] = useState({
    keyName: '',
    keyValue: '',
    description: ''
  })
  const [editingKeyId, setEditingKeyId] = useState<number | null>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState<{ id?: number; name: string; clientId: string; clientSecret: string; apiType: 'shopping' | 'insights'; makeDefault: boolean }>({ 
    name: '', 
    clientId: '', 
    clientSecret: '', 
    apiType: 'shopping',
    makeDefault: false 
  })
  const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({})

  // API 키 목록 가져오기
  const fetchKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/keys')
      const data = await response.json()

      if (response.ok) {
        setProfiles(data.profiles || [])
        setError('')
      } else {
        setError(data.error || 'API 키를 가져올 수 없습니다.')
      }
    } catch (err) {
      setError('API 키를 가져오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 프로필 저장/수정
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileForm.name || !profileForm.clientId || !profileForm.clientSecret) {
      setError('프로필 이름, Client ID, Client Secret은 필수입니다.')
      return
    }
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileForm })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message || '프로필이 저장되었습니다.')
        setError('')
        setShowProfileForm(false)
        setProfileForm({ name: '', clientId: '', clientSecret: '', apiType: 'shopping', makeDefault: false })
        fetchKeys()
      } else {
        setError(data.error || '프로필 저장에 실패했습니다.')
        setSuccess('')
      }
    } catch (e) {
      setError('프로필 저장 중 오류가 발생했습니다.')
      setSuccess('')
    }
  }

  const handleSetDefaultProfile = async (id: number) => {
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setDefaultProfileId: id })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message)
        setError('')
        fetchKeys()
      } else {
        setError(data.error || '기본 프로필 설정에 실패했습니다.')
        setSuccess('')
      }
    } catch (e) {
      setError('기본 프로필 설정 중 오류가 발생했습니다.')
      setSuccess('')
    }
  }

  const handleDeleteProfile = async (id: number) => {
    if (!confirm('이 프로필을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
      const res = await fetch(`/api/keys?profileId=${id}&hard=true`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message)
        setError('')
        fetchKeys()
      } else {
        setError(data.error || '프로필 삭제에 실패했습니다.')
        setSuccess('')
      }
    } catch (e) {
      setError('프로필 삭제 중 오류가 발생했습니다.')
      setSuccess('')
    }
  }

  const toggleSecretVisibility = (id: number) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // 키 값 마스킹 함수
  const maskKeyValue = (value: string) => {
    if (value.length <= 8) return value
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4)
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 animate-pulse">API 키를 불러오는 중...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center">
          <Sparkles className="w-8 h-8 mr-3 animate-pulse" />
          API 키 관리
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">네이버 쇼핑 API 키를 안전하게 관리하세요</p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowProfileForm(!showProfileForm)
            setProfileForm({ name: '', clientId: '', clientSecret: '', apiType: 'shopping', makeDefault: false })
            setError('')
            setSuccess('')
          }}
          className="group flex items-center px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 hover:from-emerald-700 hover:to-teal-700"
        >
          <Plus className="w-7 h-7 mr-4 group-hover:animate-pulse" />
          <span className="text-xl font-bold">프로필(아이디+시크릿) 추가</span>
          <Star className="w-6 h-6 ml-3 group-hover:animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </motion.button>
      </div>

      {/* 알림 메시지 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-2xl" 
            role="alert"
          >
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3 text-red-600 dark:text-red-400" />
              <div>
                <strong className="font-bold text-lg">오류가 발생했습니다</strong>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-6 py-4 rounded-2xl" 
            role="alert"
          >
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />
              <div>
                <strong className="font-bold text-lg">성공!</strong>
                <p className="text-sm mt-1">{success}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 프로필 추가/수정 폼 */}
      <AnimatePresence>
        {showProfileForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                  <Key className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">네이버 API 프로필 추가</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Client ID와 Secret을 한 번에 저장합니다</p>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">프로필 이름</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="예: Shopping API"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">API 타입</label>
                  <select
                    value={profileForm.apiType}
                    onChange={(e) => setProfileForm({ ...profileForm, apiType: e.target.value as 'shopping' | 'insights' })}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="shopping">쇼핑 검색 API</option>
                    <option value="insights">쇼핑인사이트 API</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Client ID</label>
                  <input
                    type="text"
                    value={profileForm.clientId}
                    onChange={(e) => setProfileForm({ ...profileForm, clientId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="예: your_client_id_here"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Client Secret</label>
                  <input
                    type="text"
                    value={profileForm.clientSecret}
                    onChange={(e) => setProfileForm({ ...profileForm, clientSecret: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="예: your_client_secret_here"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  id="makeDefault" 
                  type="checkbox" 
                  checked={profileForm.makeDefault} 
                  onChange={(e) => setProfileForm({ ...profileForm, makeDefault: e.target.checked })} 
                  className="w-4 h-4 text-emerald-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500 dark:focus:ring-emerald-400" 
                />
                <label htmlFor="makeDefault" className="text-sm text-slate-700 dark:text-slate-300">
                  이 프로필을 {profileForm.apiType === 'shopping' ? '쇼핑 검색 API' : '쇼핑인사이트 API'}의 기본으로 설정
                </label>
              </div>
              <div className="flex justify-center space-x-4 pt-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button" 
                  onClick={() => setShowProfileForm(false)} 
                  className="px-10 py-4 border-2 border-slate-300 dark:border-slate-600 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 font-bold text-lg hover:shadow-md"
                >
                  취소
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  className="group px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-xl transform transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 font-bold text-lg"
                >
                  <span className="flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3 group-hover:animate-pulse" /> 저장하기
                  </span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 프로필 목록 */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center">
            <Key className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            등록된 프로필 (Client ID + Secret)
          </h3>
        </div>
        {profiles.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            등록된 프로필이 없습니다. 위 버튼으로 추가하세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600">
              <thead className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">이름</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">API 타입</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Client ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Client Secret</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">기본</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.api_type === 'shopping' 
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                          : 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                      }`}>
                        {p.api_type === 'shopping' ? '쇼핑 검색' : '쇼핑인사이트'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                          {p.client_id ? maskKeyValue(p.client_id) : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                          {p.client_secret ? (showSecrets[p.id] ? p.client_secret : maskKeyValue(p.client_secret)) : '-'}
                        </span>
                        {p.client_secret && (
                          <button
                            onClick={() => toggleSecretVisibility(p.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            {showSecrets[p.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.is_default ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                          기본
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                          활성
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {!p.is_default && p.is_active && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSetDefaultProfile(p.id)} 
                            className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                          >
                            {p.api_type === 'shopping' ? '쇼핑검색 기본' : '인사이트 기본'}
                          </motion.button>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteProfile(p.id)} 
                          className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4 mr-1 inline" />
                          삭제
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}