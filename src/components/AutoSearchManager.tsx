'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { toast } from '@/utils/toast';
import DeleteConfirmationToast from './DeleteConfirmationToast';

interface AutoSearchConfig {
  id: number;
  name: string;
  search_query: string;
  target_mall_name?: string;
  target_brand?: string;
  target_product_name?: string;
  max_pages: number;
  profile_id?: number;
  interval_hours: number;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
  success_count: number;
  error_count: number;
  last_error?: string;
  description?: string;
  created_at?: string;
  api_key_profiles?: {
    id: number;
    name: string;
    client_id: string;
    is_active: boolean;
  };
  auto_search_logs?: Array<{
    id: number;
    status: string;
    started_at: string;
    completed_at?: string;
    duration_ms?: number;
    results_count: number;
    error_message?: string;
  }>;
}

const intervalOptions = [
  { value: 0.5, label: '30분마다' },
  { value: 1, label: '1시간마다' },
  { value: 2, label: '2시간마다' },
  { value: 3, label: '3시간마다' },
  { value: 6, label: '6시간마다' },
  { value: 12, label: '12시간마다' },
  { value: 24, label: '매일' },
  { value: 168, label: '매주 (7일)' },
  { value: 720, label: '매월 (30일)' }
];

export default function AutoSearchManager() {
  const [configs, setConfigs] = useState<AutoSearchConfig[]>([]);
  const [apiKeyProfiles, setApiKeyProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ searchQuery: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AutoSearchConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteButtonElement, setDeleteButtonElement] = useState<HTMLElement | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    search_query: '',
    target_mall_name: '',
    target_brand: '',
    target_product_name: '',
    max_pages: 10,
    profile_id: '',
    interval_hours: 6,
    description: ''
  });

  // 설정 목록 조회
  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/auto-search/configs');
      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('설정 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 필터 적용된 스케줄 목록 (실시간 결과 탭과 동일한 애니메이션 체계 적용을 위해 별도 메모)
  const filteredConfigs = useMemo(() => {
    if (!filters.searchQuery) return configs;
    const q = filters.searchQuery.toLowerCase();
    return configs.filter((config) =>
      (config.search_query || '').toLowerCase().includes(q) ||
      (config.name || '').toLowerCase().includes(q)
    );
  }, [configs, filters.searchQuery]);

  // API 키 프로필 목록 조회 (쇼핑 검색 API 타입만)
  const fetchApiKeyProfiles = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      // 쇼핑 검색 API 타입만 필터링
      const shoppingProfiles = (data.profiles || []).filter((profile: any) => profile.api_type === 'shopping');
      setApiKeyProfiles(shoppingProfiles);
    } catch (error) {
      console.error('API 키 프로필 조회 오류:', error);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchApiKeyProfiles();
  }, []);

  // API 키 프로필이 로드된 후 기본 프로필로 폼 초기화
  useEffect(() => {
    if (apiKeyProfiles.length > 0 && !formData.profile_id) {
      const defaultProfile = apiKeyProfiles.find(profile => profile.is_default);
      if (defaultProfile) {
        setFormData(prev => ({
          ...prev,
          profile_id: defaultProfile.id.toString()
        }));
      }
    }
  }, [apiKeyProfiles]);

  // 폼 초기화
  const resetForm = () => {
    // 기본 프로필 찾기 (is_default가 true인 프로필)
    const defaultProfile = apiKeyProfiles.find(profile => profile.is_default);
    
    setFormData({
      name: '',
      search_query: '',
      target_mall_name: '',
      target_brand: '',
      target_product_name: '',
      max_pages: 10,
      profile_id: defaultProfile ? defaultProfile.id.toString() : '',
      interval_hours: 1,
      description: ''
    });
    setEditingConfig(null);
    setShowForm(false);
  };

  // 설정 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingConfig 
        ? `/api/auto-search/configs/${editingConfig.id}`
        : '/api/auto-search/configs';
      
      const method = editingConfig ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profile_id: formData.profile_id ? parseInt(formData.profile_id) : null,
          interval_hours: parseFloat(formData.interval_hours.toString())
        }),
      });

      const data = await response.json();
      console.log('API 응답 데이터:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status} 오류가 발생했습니다.`);
      }
      
      if (data.success) {
        await fetchConfigs();
        
        // 새 설정 생성 시 즉시 실행
        if (!editingConfig && data.config && data.config.id) {
          try {
            const runResponse = await fetch('/api/auto-search/run', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                configId: data.config.id
              }),
            });
            
            const runData = await runResponse.json();
            if (runData.success) {
              toast('설정이 생성되었고 즉시 실행되었습니다!', 'success');
            } else {
              toast('설정이 생성되었지만 실행 중 오류가 발생했습니다: ' + runData.error, 'error');
            }
          } catch (runError) {
            console.error('즉시 실행 오류:', runError);
            toast('설정이 생성되었지만 즉시 실행 중 오류가 발생했습니다.', 'error');
          }
        } else {
          toast(editingConfig ? '설정이 수정되었습니다.' : '설정이 생성되었습니다.', 'success');
        }
        
        // 성공 애니메이션 후 폼 닫기
        setTimeout(() => {
          resetForm();
        }, 500);
      } else {
        toast('오류가 발생했습니다: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      toast('설정을 저장할 수 없습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 설정 삭제 확인
  const handleDeleteClick = (id: number, buttonElement?: HTMLElement) => {
    setDeleteTargetId(id);
    setDeleteButtonElement(buttonElement || null);
    setShowDeleteToast(true);
  };

  // 설정 삭제 실행
  const handleDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const response = await fetch(`/api/auto-search/configs/${deleteTargetId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('삭제 API 응답 데이터:', data);
      
      if (data.success) {
        await fetchConfigs();
        
        // 삭제된 항목 수 표시
        const deleted = data.deleted || {};
        const message = `설정과 관련 데이터가 삭제되었습니다.\n\n삭제된 항목:\n• 설정: ${deleted.config || 0}개\n• 결과: ${deleted.results || 0}개\n• 로그: ${deleted.logs || 0}개\n• 알림: ${deleted.notifications || 0}개`;
        
        toast(message, 'success');
      } else {
        toast('오류가 발생했습니다: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('설정 삭제 오류:', error);
      toast('설정을 삭제할 수 없습니다.', 'error');
    } finally {
      setShowDeleteToast(false);
      setDeleteTargetId(null);
    }
  };

  // 설정 활성화/비활성화
  const toggleConfig = async (config: AutoSearchConfig) => {
    try {
      const response = await fetch(`/api/auto-search/configs/${config.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !config.is_active
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchConfigs();
        toast(`설정이 ${!config.is_active ? '활성화' : '비활성화'}되었습니다.`, 'success');
      } else {
        toast('오류가 발생했습니다: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('설정 토글 오류:', error);
      toast('설정 상태를 변경할 수 없습니다.', 'error');
    }
  };

  // 수정 폼 열기
  const handleEdit = (config: AutoSearchConfig) => {
    // 기본 프로필 찾기 (is_default가 true인 프로필)
    const defaultProfile = apiKeyProfiles.find(profile => profile.is_default);
    
    setFormData({
      name: config.name,
      search_query: config.search_query,
      target_mall_name: config.target_mall_name || '',
      target_brand: config.target_brand || '',
      target_product_name: config.target_product_name || '',
      max_pages: config.max_pages,
      profile_id: config.profile_id?.toString() || (defaultProfile ? defaultProfile.id.toString() : ''),
      interval_hours: config.interval_hours,
      description: config.description || ''
    });
    setEditingConfig(config);
    setShowForm(true);
  };

  // 상태 아이콘
  const getStatusIcon = (config: AutoSearchConfig) => {
    if (!config.is_active) {
      return <Pause className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
    }
    
    if (config.error_count > 0 && config.success_count === 0) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    
    if (config.success_count > 0) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  // 마지막 실행 시간 포맷
  const formatLastRun = (lastRunAt?: string) => {
    if (!lastRunAt) return '실행 기록 없음';
    
    const date = new Date(lastRunAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  // 등록일 포맷
  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt) return '알 수 없음';
    
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* 헤더 스켈레톤 */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-96 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-32 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* 스케줄 목록 스켈레톤 */}
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="h-6 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="h-6 w-16 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-64 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-48 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 w-16 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-20 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, k) => (
                      <div key={k} className="h-6 w-20 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <div className="h-8 w-16 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
                  <div className="h-8 w-16 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
                  <div className="h-8 w-16 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">자동 검색 관리</h2>
          <p className="text-gray-600 dark:text-gray-400">정기적으로 네이버 쇼핑 검색을 실행하고 결과를 저장합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 스케줄
        </button>
      </div>

      {/* 검색어 필터 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Escape') setFilters({ searchQuery: '' }); }}
          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="검색어 또는 스케줄 이름으로 필터링"
        />
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {filteredConfigs.length}개 스케줄 표시 중{filters.searchQuery && ` (전체 ${configs.length}개 중)`}
        </div>
      </div>

      {/* 스케줄 목록 */}
      <div className="grid gap-4">
        {configs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>등록된 자동 검색 설정이 없습니다.</p>
            <p>새 설정을 만들어보세요.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredConfigs.map((config) => (
              <motion.div
                key={config.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
              >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(config)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {config.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      config.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {config.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 mb-3">
                    <p><strong>검색어:</strong> {config.search_query}</p>
                    {config.target_mall_name && (
                      <p><strong>대상 쇼핑몰:</strong> {config.target_mall_name}</p>
                    )}
                    {config.target_brand && (
                      <p><strong>대상 브랜드:</strong> {config.target_brand}</p>
                    )}
                    <p><strong>최대 페이지:</strong> {config.max_pages}페이지</p>
                    <p><strong>실행 주기:</strong> {config.interval_hours}시간마다</p>
                    {config.api_key_profiles && (
                      <p><strong>API 키:</strong> {config.api_key_profiles.name}</p>
                    )}
                    {config.description && (
                      <p><strong>설명:</strong> {config.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>마지막 실행: {formatLastRun(config.last_run_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserPlus className="w-4 h-4" />
                      <span>등록일: {formatCreatedAt(config.created_at)}</span>
                    </div>
                    <div>
                      <span>실행 횟수: {config.run_count}</span>
                    </div>
                    <div>
                      <span>성공: {config.success_count}</span>
                    </div>
                    <div>
                      <span>실패: {config.error_count}</span>
                    </div>
                  </div>

                  {config.last_error && config.error_count > 0 && config.success_count === 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      <strong>마지막 오류:</strong> {config.last_error}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleConfig(config)}
                    className={`p-2 rounded-lg transition-colors ${
                      config.is_active
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={config.is_active ? '비활성화' : '활성화'}
                  >
                    {config.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(config)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => handleDeleteClick(config.id, e.currentTarget)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 스케줄 생성/수정 폼 - Portal 사용 */}
      {showForm && typeof window !== 'undefined' && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[99999] backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative mx-4 sm:mx-0 border border-gray-200 dark:border-slate-700"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="닫기"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <div className="border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white pr-8">
                {editingConfig ? '설정 수정' : '새 설정 생성'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {editingConfig ? '기존 설정을 수정합니다.' : '새로운 자동 검색 설정을 생성합니다.'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  설정 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="설정 이름을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  검색어 *
                </label>
                <input
                  type="text"
                  name="search_query"
                  value={formData.search_query}
                  onChange={(e) => setFormData({ ...formData, search_query: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="검색할 키워드를 입력하세요"
                  autoComplete="on"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  타겟 상품명
                </label>
                <input
                  type="text"
                  name="target_product_name"
                  value={formData.target_product_name}
                  onChange={(e) => setFormData({ ...formData, target_product_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="찾고자 하는 상품명 (선택사항)"
                  autoComplete="on"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    타겟 쇼핑몰
                  </label>
                  <input
                    type="text"
                    name="target_mall_name"
                    value={formData.target_mall_name}
                    onChange={(e) => setFormData({ ...formData, target_mall_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="특정 쇼핑몰명 (선택사항)"
                    autoComplete="on"
                    list="mall-suggestions"
                  />
                  <datalist id="mall-suggestions">
                    <option value="하나투어" />
                    <option value="트립" />
                    <option value="패키지" />
                    <option value="여행" />
                    <option value="하나투어 트립 패키지 여행" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    타겟 브랜드
                  </label>
                  <input
                    type="text"
                    name="target_brand"
                    value={formData.target_brand}
                    onChange={(e) => setFormData({ ...formData, target_brand: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="특정 브랜드명 (선택사항)"
                    autoComplete="on"
                  />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    최대 페이지 수
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_pages}
                    onChange={(e) => setFormData({ ...formData, max_pages: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    실행 주기
                  </label>
                  <select
                    value={formData.interval_hours}
                    onChange={(e) => setFormData({ ...formData, interval_hours: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  >
                    {intervalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API 키 프로필 (쇼핑 검색 API)
                </label>
                <select
                  value={formData.profile_id}
                  onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                >
                  {apiKeyProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} {profile.is_default ? '(기본)' : ''} ({profile.is_active ? '활성' : '비활성'})
                    </option>
                  ))}
                </select>
                {apiKeyProfiles.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    쇼핑 검색 API 프로필이 없습니다. API 키 관리에서 프로필을 생성해주세요.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="설정에 대한 설명을 입력하세요 (선택사항)"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  취소
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isSubmitting 
                      ? 'bg-blue-400 text-white cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      {editingConfig ? '수정 중...' : '생성 중...'}
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {editingConfig ? '수정' : '생성'}
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>,
        document.body
      )}

      {/* 삭제 확인 토스트 */}
      <DeleteConfirmationToast
        isOpen={showDeleteToast}
        onClose={() => {
          setShowDeleteToast(false);
          setDeleteTargetId(null);
          setDeleteButtonElement(null);
        }}
        onConfirm={handleDelete}
        title="자동검색 설정 삭제"
        message="정말로 이 자동검색 설정을 삭제하시겠습니까? 설정과 함께 관련된 모든 데이터(검색 결과, 실행 로그, 알림 등)가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다."
        confirmText="예, 삭제합니다"
        cancelText="아니오, 취소"
        type="danger"
      />
    </div>
  );
}
