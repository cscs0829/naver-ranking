'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Trash2, Save, AlertCircle } from 'lucide-react'

interface ApiKey {
  id: number
  key_name: string
  key_value: string
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKey, setNewKey] = useState({
    keyName: '',
    keyValue: '',
    description: ''
  })

  // API 키 목록 가져오기
  const fetchKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/keys')
      const data = await response.json()
      
      if (response.ok) {
        setKeys(data.keys)
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

  // API 키 추가/수정
  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newKey.keyName || !newKey.keyValue) {
      setError('키 이름과 값은 필수입니다.')
      return
    }

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKey),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('API 키가 성공적으로 저장되었습니다.')
        setNewKey({ keyName: '', keyValue: '', description: '' })
        setShowAddForm(false)
        fetchKeys()
      } else {
        setError(data.error || 'API 키 저장에 실패했습니다.')
      }
    } catch (err) {
      setError('API 키 저장 중 오류가 발생했습니다.')
    }
  }

  // API 키 비활성화
  const handleDeactivateKey = async (keyName: string) => {
    if (!confirm(`'${keyName}' 키를 비활성화하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/keys?keyName=${keyName}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('API 키가 비활성화되었습니다.')
        fetchKeys()
      } else {
        setError(data.error || 'API 키 비활성화에 실패했습니다.')
      }
    } catch (err) {
      setError('API 키 비활성화 중 오류가 발생했습니다.')
    }
  }

  // 키 값 마스킹
  const maskKeyValue = (value: string) => {
    if (value.length <= 8) return value
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4)
  }

  useEffect(() => {
    fetchKeys()
  }, [])


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">로딩 중...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Key className="mr-2 h-6 w-6" />
          API 키 관리
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          새 키 추가
        </button>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* 새 키 추가 폼 */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">새 API 키 추가</h3>
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                키 이름 *
              </label>
              <input
                type="text"
                value={newKey.keyName}
                onChange={(e) => setNewKey({ ...newKey, keyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: NAVER_CLIENT_ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                키 값 *
              </label>
              <input
                type="text"
                value={newKey.keyValue}
                onChange={(e) => setNewKey({ ...newKey, keyValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="API 키 값 입력"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <input
                type="text"
                value={newKey.description}
                onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="키에 대한 설명"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewKey({ keyName: '', keyValue: '', description: '' })
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API 키 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                키 이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                키 값
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key.key_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {maskKeyValue(key.key_value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    key.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {key.is_active ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(key.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {key.is_active && (
                    <button
                      onClick={() => handleDeactivateKey(key.key_name)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      비활성화
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {keys.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            등록된 API 키가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
