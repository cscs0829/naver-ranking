'use client'

import { useState, useEffect } from 'react'
import { Key, Settings, CheckCircle, AlertCircle, Sparkles, Zap, Star } from 'lucide-react'

export default function ApiKeyManager() {
  // API 키 목록 제거: 프로필만 사용
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
  // 프로필 상태
  const [profiles, setProfiles] = useState<any[]>([])
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState<{ id?: number; name: string; clientId: string; clientSecret: string; makeDefault: boolean }>({ name: '', clientId: '', clientSecret: '', makeDefault: false })

  // API 키 목록 가져오기
  const fetchKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/keys')
      const data = await response.json()

      if (response.ok) {
        // setKeys(data.keys) // 사용하지 않음
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

  // API 키 추가/수정 제거

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
        setProfileForm({ name: '', clientId: '', clientSecret: '', makeDefault: false })
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

  const handleDeactivateProfile = async (id: number) => {
    if (!confirm('이 프로필을 비활성화하시겠습니까?')) return
    try {
      const res = await fetch(`/api/keys?profileId=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message)
        setError('')
        fetchKeys()
      } else {
        setError(data.error || '프로필 비활성화에 실패했습니다.')
        setSuccess('')
      }
    } catch (e) {
      setError('프로필 비활성화 중 오류가 발생했습니다.')
      setSuccess('')
    }
  }

  // API 키 비활성화
  const handleDeactivateKey = async (keyName: string, hard = false) => {
    if (!confirm(`정말로 '${keyName}' API 키를 ${hard ? '삭제' : '비활성화'}하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/keys?keyName=${keyName}&hard=${hard}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setError('')
        fetchKeys() // 목록 새로고침
      } else {
        setError(data.error || 'API 키 비활성화에 실패했습니다.')
        setSuccess('')
      }
    } catch (err) {
      setError('API 키 비활성화 중 오류가 발생했습니다.')
      setSuccess('')
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-gray-800 animate-pulse">API 키를 불러오는 중...</p>
          <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-[15px] lg:text-[13px] xl:text-[14px]">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2 flex items-center justify-center">
          <Sparkles className="w-8 h-8 mr-3 animate-pulse" />
          API 키 관리
        </h2>
        <p className="text-gray-600 text-lg">네이버 쇼핑 API 키를 안전하게 관리하세요</p>
      </div>

      {/* 액션 버튼: 프로필만 유지 */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            setShowProfileForm(!showProfileForm)
            setProfileForm({ name: '', clientId: '', clientSecret: '', makeDefault: false })
            setError('')
            setSuccess('')
          }}
          className="ml-4 group flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
        >
          <Key className="w-6 h-6 mr-3 group-hover:animate-pulse" />
          <span className="text-lg font-semibold">프로필(아이디+시크릿) 추가</span>
          <Star className="w-5 h-5 ml-2" />
        </button>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-6 animate-fade-in" role="alert">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-3 text-red-600" />
            <div>
              <strong className="font-bold text-lg">오류가 발생했습니다</strong>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-2xl mb-6 animate-fade-in" role="alert">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
            <div>
              <strong className="font-bold text-lg">성공!</strong>
              <p className="text-sm mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 추가/수정 폼 (Client ID + Secret 묶어서) */}
      {showProfileForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mb-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                <Key className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold gradient-text">네이버 API 프로필 추가</h3>
            <p className="text-gray-600 mt-2">Client ID와 Secret을 한 번에 저장합니다</p>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">프로필 이름</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="예: Main Profile"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Client ID</label>
                <input
                  type="text"
                  value={profileForm.clientId}
                  onChange={(e) => setProfileForm({ ...profileForm, clientId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="ycVfKVqp7TXD_KRDrdiW"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Client Secret</label>
                <input
                  type="text"
                  value={profileForm.clientSecret}
                  onChange={(e) => setProfileForm({ ...profileForm, clientSecret: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="jWX0ylyHyX"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input id="makeDefault" type="checkbox" checked={profileForm.makeDefault} onChange={(e) => setProfileForm({ ...profileForm, makeDefault: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="makeDefault" className="text-sm text-gray-700">이 프로필을 기본으로 설정</label>
            </div>
            <div className="flex justify-center space-x-4 pt-2">
              <button type="button" onClick={() => setShowProfileForm(false)} className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold">취소</button>
              <button type="submit" className="group px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transform transition-all duration-300 hover:scale-105 font-semibold">
                <span className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" /> 저장하기
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API 키 추가/수정 폼 제거 */}

      {/* 프로필 목록 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Key className="w-5 h-5 mr-2 text-emerald-600" />
            등록된 프로필 (Client ID + Secret)
          </h3>
        </div>
        {profiles.length === 0 ? (
          <div className="text-center py-10 text-gray-500">등록된 프로필이 없습니다. 위 버튼으로 추가하세요.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-emerald-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">이름</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">기본</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {profiles.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4 font-mono text-sm">{p.client_id ? (p.client_id.substring(0,4) + '••••••' + p.client_id.slice(-4)) : '-'}</td>
                    <td className="px-6 py-4">{p.is_default ? <span className="text-emerald-700 font-semibold">기본</span> : '-'}</td>
                    <td className="px-6 py-4">{p.is_active ? <span className="text-green-600">활성</span> : <span className="text-gray-400">비활성</span>}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {!p.is_default && p.is_active && (
                          <button onClick={() => handleSetDefaultProfile(p.id)} className="px-3 py-1 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">기본설정</button>
                        )}
                        {p.is_active && (
                          <button onClick={() => handleDeactivateProfile(p.id)} className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200">비활성</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API 키 목록 제거 */}
    </div>
  )
}