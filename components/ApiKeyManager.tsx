'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Edit, Trash2, Database } from 'lucide-react'
import { ApiKey } from '@/lib/api-keys'

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
  const [editingKeyId, setEditingKeyId] = useState<number | null>(null)

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyName: newKey.keyName,
          keyValue: newKey.keyValue,
          description: newKey.description
        })
      })
      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setError('')
        setNewKey({ keyName: '', keyValue: '', description: '' })
        setShowAddForm(false)
        setEditingKeyId(null)
        fetchKeys() // 목록 새로고침
      } else {
        setError(data.error || 'API 키 저장에 실패했습니다.')
        setSuccess('')
      }
    } catch (err) {
      setError('API 키 저장 중 오류가 발생했습니다.')
      setSuccess('')
    }
  }

  // API 키 비활성화
  const handleDeactivateKey = async (keyName: string) => {
    if (!confirm(`정말로 '${keyName}' API 키를 비활성화하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/keys?keyName=${keyName}`, {
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
          <Database className="w-6 h-6 mr-2 text-blue-600" />
          API 키 관리
        </h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm)
            setNewKey({ keyName: '', keyValue: '', description: '' })
            setEditingKeyId(null)
            setError('')
            setSuccess('')
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          새 API 키 추가
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">오류:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">성공:</strong>
          <span className="block sm:inline"> {success}</span>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {editingKeyId ? 'API 키 수정' : '새 API 키 추가'}
          </h3>
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
                키 이름
              </label>
              <input
                type="text"
                id="keyName"
                value={newKey.keyName}
                onChange={(e) => setNewKey({ ...newKey, keyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: NAVER_CLIENT_ID"
                disabled={!!editingKeyId} // 수정 중에는 키 이름 변경 불가
              />
            </div>
            <div>
              <label htmlFor="keyValue" className="block text-sm font-medium text-gray-700 mb-1">
                키 값
              </label>
              <input
                type="text"
                id="keyValue"
                value={newKey.keyValue}
                onChange={(e) => setNewKey({ ...newKey, keyValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="API 키 값을 입력하세요"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                설명 (선택사항)
              </label>
              <textarea
                id="description"
                value={newKey.description}
                onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이 키에 대한 설명을 입력하세요"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingKeyId ? '수정' : '저장'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                키 이름
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                키 값
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key.key_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {maskKeyValue(key.key_value)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {key.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      활성
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      비활성
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingKeyId(key.id)
                      setNewKey({
                        keyName: key.key_name,
                        keyValue: key.key_value,
                        description: key.description || ''
                      })
                      setShowAddForm(true)
                      setError('')
                      setSuccess('')
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="수정"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {key.is_active && (
                    <button
                      onClick={() => handleDeactivateKey(key.key_name)}
                      className="text-red-600 hover:text-red-900"
                      title="비활성화"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}