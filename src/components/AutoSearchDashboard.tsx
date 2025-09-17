'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Zap,
  Calendar,
  Target,
  Trash2,
  Download,
  FileSpreadsheet,
  RefreshCw,
  X,
  History,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/utils/toast';
import { toast as sonnerToast } from 'sonner';
import ConfirmationDialog from './ConfirmationDialog';

interface DashboardStats {
  totalConfigs: number;
  activeConfigs: number;
  totalRuns: number;
  successRuns: number;
  errorRuns: number;
  totalResults: number;
  recentActivity: Array<{
    id: number;
    config_id: number;
    config_name: string;
    search_query: string;
    target_product_name?: string;
    target_mall_name?: string;
    target_brand?: string;
    status: string;
    started_at: string;
    completed_at?: string;
    results_count: number;
    duration_ms?: number;
    error_message?: string;
  }>;
  topConfigs: Array<{
    id: number;
    name: string;
    search_query: string;
    run_count: number;
    success_count: number;
    success_rate: number;
  }>;
  scheduleRankings: Array<{
    config_id: number;
    config_name: string;
    search_query: string;
    target_product_name?: string;
    target_mall_name?: string;
    target_brand?: string;
    is_active: boolean;
    latest_check: string;
    check_date: string;
    rankings: Array<{
      product_title: string;
      mall_name: string;
      brand?: string;
      total_rank: number;
      page: number;
      rank_in_page: number;
      price: string;
      product_link: string;
      checked_at: string;
      check_date: string;
      is_exact_match: boolean;
      match_confidence: number;
    }>;
  }>;
}

interface AutoSearchDashboardProps {
  onDataChange?: () => void; // 데이터 변경 시 콜백
}

export default function AutoSearchDashboard({ onDataChange }: AutoSearchDashboardProps = {}) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showDeleteScheduleDialog, setShowDeleteScheduleDialog] = useState(false);
  const [deleteTargetSchedule, setDeleteTargetSchedule] = useState<any>(null);
  const [expandedSchedules, setExpandedSchedules] = useState<Record<number, boolean>>({});
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  
  // 필터 상태 추가
  const [filters, setFilters] = useState({
    searchQuery: '',
    targetProduct: '',
    targetMall: '',
    targetBrand: ''
  });
  const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]);
  

  // 모달 열릴 때: 내부 스크롤 최상단 + 모바일에서만 배경 스크롤 잠금
  useEffect(() => {
    if (selectedSchedule) {
      const originalOverflow = document.body.style.overflow;
      const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
      setTimeout(() => {
        try { modalScrollRef.current?.scrollTo({ top: 0 }); } catch {}
      }, 0);
      return () => {
        if (isMobile) {
          document.body.style.overflow = originalOverflow;
        }
      };
    }
  }, [selectedSchedule]);

  // ESC 키로 모달 닫기 (순위결과 모달 로직 참고)
  useEffect(() => {
    if (!selectedSchedule) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeHistoryModal();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedSchedule]);

  // 포커스 트랩 및 탭 순환
  useEffect(() => {
    if (!selectedSchedule) return;
    const container = modalContainerRef.current;
    if (!container) return;

    const focusableSelectors = [
      'a[href]','button:not([disabled])','textarea:not([disabled])','input:not([disabled])','select:not([disabled])','[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const focusable = Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];
    if (firstEl) firstEl.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedSchedule]);

  // 스와이프 다운으로 닫기 (모바일 UX)
  useEffect(() => {
    if (!selectedSchedule) return;
    let startY = 0; let currentY = 0; let isDragging = false;
    const overlay = modalContainerRef.current?.parentElement; // overlay는 컨테이너의 부모
    if (!overlay) return;

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      if (!isDragging) return;
      const delta = currentY - startY;
      if (delta > 80) {
        closeHistoryModal();
      }
      isDragging = false;
      startY = 0; currentY = 0;
    };

    overlay.addEventListener('touchstart', onTouchStart, { passive: true });
    overlay.addEventListener('touchmove', onTouchMove, { passive: true });
    overlay.addEventListener('touchend', onTouchEnd);
    return () => {
      overlay.removeEventListener('touchstart', onTouchStart as any);
      overlay.removeEventListener('touchmove', onTouchMove as any);
      overlay.removeEventListener('touchend', onTouchEnd as any);
    };
  }, [selectedSchedule]);

  // 통계 데이터 조회
  const fetchStats = async () => {
    try {
      setLoading(true);
      setSlowLoading(false);
      const start = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
      const slowTimer = setTimeout(() => setSlowLoading(true), 1500);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`/api/auto-search/dashboard?t=${Date.now()}`, { signal: controller.signal });
      const data = await response.json();
      setStats(data);
      const end = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
      const duration = Math.round(end - start);
      setLastDurationMs(duration);
      if (process.env.NODE_ENV !== 'production') {
        try { console.debug(`[Dashboard] 응답 시간: ${duration}ms`); } catch {}
      }
      clearTimeout(timeout);
      clearTimeout(slowTimer);
      setInitialLoaded(true);
    } catch (error) {
      console.error('통계 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 필터링 로직
  const applyFilters = (schedules: any[]) => {
    if (!schedules) return [];
    
    return schedules.filter(schedule => {
      // 검색어 필터
      if (filters.searchQuery && !schedule.search_query.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }
      
      // 대상 상품 필터
      if (filters.targetProduct && !schedule.target_product_name?.toLowerCase().includes(filters.targetProduct.toLowerCase())) {
        return false;
      }
      
      // 대상 몰 필터
      if (filters.targetMall && !schedule.target_mall_name?.toLowerCase().includes(filters.targetMall.toLowerCase())) {
        return false;
      }
      
      // 대상 브랜드 필터
      if (filters.targetBrand && !schedule.target_brand?.toLowerCase().includes(filters.targetBrand.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  // 필터 적용
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      targetProduct: '',
      targetMall: '',
      targetBrand: ''
    });
  };

  // 히스토리 필터링 로직


  // 수동 새로고침
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchStats();
  };

  // 전체 데이터 삭제 확인
  const handleDeleteAllDataClick = () => {
    setShowDeleteAllDialog(true);
  };

  // 전체 데이터 삭제 실행
  const handleDeleteAllData = async () => {
    try {
      const response = await fetch('/api/auto-search/delete-all', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        sonnerToast.success('모든 자동검색 데이터가 삭제되었습니다. (설정은 유지됨)');
        await fetchStats();
        // 부모 컴포넌트에 데이터 변경 알림
        if (onDataChange) {
          onDataChange();
        }
      } else {
        sonnerToast.error('오류가 발생했습니다: ' + data.error);
      }
    } catch (error) {
      console.error('데이터 삭제 오류:', error);
      sonnerToast.error('데이터를 삭제할 수 없습니다.');
    }
  };

  // 스케줄별 데이터 삭제 확인
  const handleDeleteScheduleDataClick = (configId: number, configName: string) => {
    // 안전한 값으로 설정 (null/undefined 방지)
    const safeConfigId = configId || 0;
    const safeConfigName = configName || 'Unknown';
    
    console.log('삭제 확인 다이얼로그 표시:', { configId: safeConfigId, configName: safeConfigName });
    setDeleteTargetSchedule({ configId: safeConfigId, configName: safeConfigName });
    setShowDeleteScheduleDialog(true);
  };

  // 스케줄별 데이터 삭제 실행
  const handleDeleteScheduleData = async () => {
    if (!deleteTargetSchedule || !deleteTargetSchedule.configId) {
      sonnerToast.error('삭제할 스케줄 정보가 없습니다.');
      setShowDeleteScheduleDialog(false); // 다이얼로그 닫기
      return;
    }

    try {
      console.log('스케줄 삭제 시작:', deleteTargetSchedule.configId);
      const response = await fetch(`/api/auto-search/delete-schedule/${deleteTargetSchedule.configId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        sonnerToast.success('스케줄 데이터가 삭제되었습니다.');
        // 히스토리 모달이 현재 해당 스케줄을 보고 있다면 닫고 상태 초기화
        if (selectedSchedule && selectedSchedule.config_id === deleteTargetSchedule.configId) {
          closeHistoryModal();
        }
        await fetchStats();
        // 부모 컴포넌트에 데이터 변경 알림
        if (onDataChange) {
          onDataChange();
        }
      } else {
        sonnerToast.error('오류가 발생했습니다: ' + data.error);
      }
    } catch (error) {
      console.error('스케줄 데이터 삭제 오류:', error);
      sonnerToast.error('데이터를 삭제할 수 없습니다.');
    } finally {
      // 삭제 완료 후 다이얼로그 닫기 및 상태 초기화
      setShowDeleteScheduleDialog(false);
      setDeleteTargetSchedule(null);
    }
  };

  // 엑셀 내보내기 (현재 표시된 모든 스케줄)
  const handleExportToExcel = async () => {
    try {
      const requestUrl = new URL('/api/auto-search/export-excel', window.location.origin);
      
      // 히스토리 모달이 열려있고 특정 스케줄이 선택된 경우
      if (selectedSchedule && selectedSchedule.config_id) {
        requestUrl.searchParams.set('configId', String(selectedSchedule.config_id));
      } else {
        // 필터가 적용된 경우에만 현재 표시된 스케줄 ID를 전달
        // 아무것도 입력하지 않은 경우는 configIds를 전달하지 않아 모든 활성 스케줄을 가져옴
        const hasActiveFilters = filters.searchQuery || filters.targetProduct || filters.targetMall || filters.targetBrand;
        
        if (hasActiveFilters) {
          const visibleConfigIds = filteredSchedules.map(schedule => schedule.config_id).join(',');
          if (visibleConfigIds) {
            requestUrl.searchParams.set('configIds', visibleConfigIds);
          }
        }
        // 필터가 없으면 configIds를 전달하지 않음 (API에서 모든 활성 스케줄 조회)
      }
      
      const response = await fetch(requestUrl.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }
      
      // 응답을 ArrayBuffer로 받아서 Blob 생성
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // 파일명 생성
      let filename = `자동검색_결과_${new Date().toISOString().split('T')[0]}`;
      if (selectedSchedule && selectedSchedule.config_id) {
        filename += `_${selectedSchedule.config_name.replace(/[\\\/\?\*\[\]:]/g, '_')}`;
      } else if (Object.values(filters).some(f => f)) {
        const activeFilters = [];
        if (filters.searchQuery) activeFilters.push(`검색어_${filters.searchQuery}`);
        if (filters.targetProduct) activeFilters.push(`상품_${filters.targetProduct}`);
        if (filters.targetMall) activeFilters.push(`몰_${filters.targetMall}`);
        if (filters.targetBrand) activeFilters.push(`브랜드_${filters.targetBrand}`);
        filename += `_필터_${activeFilters.join('_')}`;
      }
      filename += '.xlsx';
      
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      
      // 성공 메시지
      let successMessage = '엑셀 파일이 다운로드되었습니다.';
      if (selectedSchedule && selectedSchedule.config_id) {
        successMessage = `"${selectedSchedule.config_name}" 스케줄의 엑셀 파일이 다운로드되었습니다.`;
      } else if (Object.values(filters).some(f => f)) {
        successMessage = '필터 조건에 맞는 스케줄들의 엑셀 파일이 다운로드되었습니다.';
      } else {
        successMessage = '모든 활성 스케줄의 엑셀 파일이 다운로드되었습니다.';
      }
      
      toast(successMessage, 'success');
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      toast(`엑셀 파일을 생성할 수 없습니다: ${errorMessage}`, 'error');
    }
  };

  // 디버그 정보 조회
  const handleDebugInfo = async () => {
    try {
      const response = await fetch('/api/auto-search/debug');
      const data = await response.json();
      
      if (data.success) {
        console.log('디버그 정보:', data.debug);
        toast(`디버그 정보가 콘솔에 출력되었습니다.\n설정: ${data.debug.configs.count}개, 결과: ${data.debug.results.count}개, 로그: ${data.debug.logs.count}개`, 'info');
      } else {
        toast('디버그 정보를 가져올 수 없습니다: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('디버그 정보 조회 오류:', error);
      toast('디버그 정보를 조회할 수 없습니다.', 'error');
    }
  };

  // 스케줄 히스토리 조회
  const fetchScheduleHistory = async (configId: number) => {
    try {
      setHistoryLoading(true);
      const response = await fetch(`/api/auto-search/history/${configId}`);
      const data = await response.json();
      
      if (data.success) {
        setHistoryData(data);
      } else {
        toast('히스토리를 가져올 수 없습니다: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('히스토리 조회 오류:', error);
      toast('히스토리를 조회할 수 없습니다.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  // 스케줄 카드 클릭 핸들러
  const handleScheduleClick = (schedule: any) => {
    setSelectedSchedule(schedule);
    fetchScheduleHistory(schedule.config_id);
  };

  // 히스토리 모달 닫기
  const closeHistoryModal = () => {
    setSelectedSchedule(null);
    setHistoryData(null);
  };

  useEffect(() => {
    fetchStats();
  }, []);


  if (loading) {
    return (
      <div className="space-y-6">
        {/* 헤더 스켈레톤 */}
        <div className="text-center">
          <div className="h-8 w-48 mx-auto rounded-md animate-pulse bg-slate-200 dark:bg-slate-700 mb-2" />
          <div className="h-6 w-96 mx-auto rounded-md animate-pulse bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 px-4 sm:px-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        </div>

        {/* 통계 카드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  <div className="h-8 w-16 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="w-12 h-12 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="mt-2">
                <div className="h-4 w-24 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>

        {/* 스케줄별 순위 결과 스켈레톤 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="h-6 w-40 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="h-6 w-48 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-20 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="h-9 w-16 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-1">
                        <div className="h-4 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-24 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 w-20 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-16 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상위 설정 스켈레톤 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="h-6 w-24 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-48 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                  <div className="h-6 w-16 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 활동 스켈레톤 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="h-6 w-32 rounded-md animate-pulse bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-48 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-24 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-16 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-12 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 느린 로딩 안내 (1.5초 이상 걸릴 때만 표시) */}
        {slowLoading && (
          <div className="mx-4 sm:mx-0 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex items-center justify-between">
            <span>데이터를 불러오는 중입니다. 잠시만 기다려 주세요...</span>
            {lastDurationMs != null && (
              <span className="text-amber-700 dark:text-amber-300">(지연: ~{Math.max(2, Math.round(lastDurationMs/1000))}초)</span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>통계 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const successRate = stats.totalRuns > 0 ? (stats.successRuns / stats.totalRuns * 100).toFixed(1) : 0;
  const errorRate = stats.totalRuns > 0 ? (stats.errorRuns / stats.totalRuns * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">실시간 결과</h2>
        <p className="text-gray-600 dark:text-gray-400">자동 검색 시스템의 전체 현황을 확인하세요</p>
        
        {/* 액션 버튼들 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 px-4 sm:px-0">
          <button
            onClick={handleRefresh}
            className="w-full justify-center flex items-center gap-2 px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
          <button
            onClick={handleDebugInfo}
            className="w-full justify-center flex items-center gap-2 px-3 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Activity className="w-4 h-4" />
            디버그 정보
          </button>
          <button
            onClick={handleDeleteAllDataClick}
            className="w-full justify-center flex items-center gap-2 px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            전체 데이터 삭제
          </button>
        </div>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">총 설정</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConfigs}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 dark:text-green-400">
              {stats.activeConfigs}개 활성
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">총 실행</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRuns}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 dark:text-green-400">
              성공률 {successRate}%
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">성공 실행</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.successRuns}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-slate-500">
              {stats.errorRuns}개 실패
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">총 결과</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalResults.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-slate-500">
              검색된 상품 수
            </span>
          </div>
        </motion.div>
      </div>

      {/* 필터 섹션 */}

      {/* 스케줄별 순위 결과 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            스케줄별 순위 결과
          </h3>
        </div>

        {/* 스케줄 필터 */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
          
          {/* 검색어 입력 */}
          <div className="mb-4">
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange({ ...filters, searchQuery: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="검색어로 필터링"
            />
          </div>

          {/* 고급 필터 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={filters.targetProduct}
              onChange={(e) => handleFilterChange({ ...filters, targetProduct: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="대상 상품명으로 필터링"
            />
            <input
              type="text"
              value={filters.targetMall}
              onChange={(e) => handleFilterChange({ ...filters, targetMall: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="대상 쇼핑몰명으로 필터링"
            />
            <input
              type="text"
              value={filters.targetBrand}
              onChange={(e) => handleFilterChange({ ...filters, targetBrand: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="대상 브랜드명으로 필터링"
            />
          </div>
          
          {/* 필터 액션 버튼들 */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              {stats && (
                <>
                  <motion.span
                    key={applyFilters(stats.scheduleRankings).length}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center"
                  >
                    {applyFilters(stats.scheduleRankings).length}개 스케줄 표시 중
                    {Object.values(filters).some(f => f) && ` (전체 ${stats.scheduleRankings.length}개 중)`}
                  </motion.span>
                  {Object.values(filters).some(f => f) && (
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="px-2 py-0.5 rounded-full text-xs bg-blue-600 text-white shadow"
                    >
                      필터 적용됨
                    </motion.span>
                  )}
                </>
              )}
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                엑셀 내보내기
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 font-semibold"
              >
                초기화
              </motion.button>
            </div>
          </div>
        </div>
        <motion.div layout className="space-y-6">
          {stats.scheduleRankings.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg mb-2">순위 결과가 없습니다</p>
              <p className="text-gray-400 text-sm mb-4">
                자동 검색을 실행하면 여기에 순위 결과가 표시됩니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-blue-800 text-sm font-medium mb-2">데이터 확인 방법:</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 자동 검색 설정이 생성되어 있는지 확인</li>
                  <li>• 설정이 활성화되어 있는지 확인</li>
                  <li>• 자동 검색이 실제로 실행되었는지 확인</li>
                  <li>• 대상 상품이 네이버 쇼핑에서 검색되는지 확인</li>
                </ul>
              </div>
            </div>
          ) : applyFilters(stats.scheduleRankings).length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg mb-2">필터 조건에 맞는 결과가 없습니다</p>
              <p className="text-gray-400 text-sm mb-4">
                다른 필터 조건을 시도해보거나 필터를 초기화해보세요.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                필터 초기화
              </motion.button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
            {applyFilters(stats.scheduleRankings).map((schedule) => (
              <motion.div 
                key={schedule.config_id} 
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.2 }}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg bg-white dark:bg-slate-800"
                onClick={() => handleScheduleClick(schedule)}
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                    <div className="break-words">
                      <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                        {schedule.config_name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        검색어: "{schedule.search_query}"
                        {schedule.target_product_name && (
                          <span> | 대상상품: "{schedule.target_product_name}"</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedSchedules(prev => ({ ...prev, [schedule.config_id]: !prev[schedule.config_id] }));
                      }}
                      className="h-9 px-3 py-0 sm:py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                    >
                      {expandedSchedules[schedule.config_id] ? '간단히' : '상세보기'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (schedule && schedule.config_id) {
                          handleDeleteScheduleDataClick(schedule.config_id, schedule.config_name || 'Unknown');
                        }
                      }}
                      className="h-9 flex items-center gap-1 px-3 py-0 sm:py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </div>

                {/* 검색 정보 */}
                {expandedSchedules[schedule.config_id] && (
                  <div className="space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 w-20">검색어:</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">"{schedule.search_query}"</span>
                    </div>
                    {schedule.target_product_name && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 w-20">대상 상품:</span>
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">"{schedule.target_product_name}"</span>
                      </div>
                    )}
                    {schedule.target_mall_name && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 w-20">대상 쇼핑몰:</span>
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">"{schedule.target_mall_name}"</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 최신 실행 정보 */}
                {schedule.rankings.length > 0 ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-bold ${
                          schedule.rankings[0].total_rank <= 10 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          schedule.rankings[0].total_rank <= 50 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {schedule.rankings[0].total_rank}
                  </div>
                  <div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                            {new Date(schedule.latest_check).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              timeZone: 'Asia/Seoul'
                            })} 기준
                          </p>
                          <p className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium">
                            {schedule.rankings[0].page}페이지 {schedule.rankings[0].rank_in_page}번째
                    </p>
                  </div>
                </div>
                <div className="text-right">
                        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-500">
                          {schedule.rankings.length}개 상품 발견
                        </p>
                        <p className="hidden sm:block text-xs text-blue-600 dark:text-blue-400 font-medium">
                          클릭하여 히스토리 보기
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm text-gray-500 dark:text-slate-500">
                      아직 검색 결과가 없습니다
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>

      {/* 상위 설정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          상위 설정
        </h3>
        <div className="space-y-3">
          {stats.topConfigs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">설정이 없습니다.</p>
          ) : (
            stats.topConfigs.map((config, index) => (
              <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{config.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{config.search_query}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{config.run_count}회 실행</p>
                  <p className="text-xs text-green-600 dark:text-green-400">성공률 {config.success_rate}%</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* 최근 활동 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          최근 활동
        </h3>
        <div className="space-y-3">
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">최근 활동이 없습니다.</p>
          ) : (
            <>
              {(showAllActivities ? stats.recentActivity : stats.recentActivity.slice(0,1)).map((activity) => (
                <div key={activity.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' : activity.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}` }>
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : activity.status === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{activity.config_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">"{activity.search_query}"</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(activity.started_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.results_count}개 결과</p>
                      {activity.duration_ms && (<p className="text-xs text-gray-500 dark:text-gray-400">{(activity.duration_ms/1000).toFixed(1)}초</p>)}
                    </div>
                  </div>
                </div>
              ))}
              {stats.recentActivity.length > 1 && (
                <div className="pt-2">
                  <button onClick={() => setShowAllActivities(v=>!v)} className="w-full sm:w-auto px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">{showAllActivities ? '접기' : '더보기'}</button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* 히스토리 모달 - Portal/AnimatePresence 사용 (순위결과 모달 로직 참고) */}
      {typeof window !== 'undefined' ? createPortal(
          <AnimatePresence>
            {selectedSchedule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-0 sm:p-4 z-[99999] backdrop-blur-sm"
              onClick={closeHistoryModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="history-modal-title"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-xl w-[92vw] sm:w-full max-w-lg sm:max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl relative border border-gray-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'relative', zIndex: 10000, maxHeight: '90vh' }}
                ref={modalContainerRef}
              >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 id="history-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedSchedule.config_name} 실행 히스토리
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    검색어: "{selectedSchedule.search_query}"
                    {selectedSchedule.target_product_name && (
                      <span> | 대상 상품: "{selectedSchedule.target_product_name}"</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportToExcel}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  엑셀 내보내기
                </button>
                <button
                  onClick={() => {
                    if (selectedSchedule && selectedSchedule.config_id) {
                      handleDeleteScheduleDataClick(selectedSchedule.config_id, selectedSchedule.config_name || 'Unknown');
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
                <button
                  onClick={closeHistoryModal}
                  className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>


            {/* 히스토리 내용 */}
            <div ref={modalScrollRef} className="px-4 sm:px-6 pb-6 overflow-y-auto max-h-[calc(90vh-200px)] overscroll-contain touch-pan-y">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">히스토리를 불러오는 중...</span>
              </div>
            ) : historyData ? (
              <div className="space-y-6">
                {historyData.history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 dark:text-gray-400">실행 히스토리가 없습니다.</p>
                  </div>
                ) : (
                  historyData.history
                    .map((dayData: any, dayIndex: number) => (
                    <div key={dayIndex} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {new Date(dayData.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                          timeZone: 'Asia/Seoul'
                        })}
                      </h4>
                      
                      <div className="space-y-4">
                        {dayData.executions
                          .map((execution: any, execIndex: number) => (
                          <div key={execIndex} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {(() => {
                                    const firstTime = execution?.results?.[0]?.time;
                                    const d = firstTime ? new Date(firstTime) : null;
                                    return d
                                      ? d.toLocaleString('ko-KR', {
                                          timeZone: 'Asia/Seoul',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit'
                                        })
                                      : `${execution.hour.toString().padStart(2, '0')}:${execution.minute
                                          .toString()
                                          .padStart(2, '0')}:${execution.second.toString().padStart(2, '0')}`;
                                  })()}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {execution.results.length}개 상품 표시
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {execution.results.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                  <p className="text-sm">결과가 없습니다</p>
                                </div>
                              ) : (
                                execution.results.map((result: any, resultIndex: number) => (
                                <div key={resultIndex} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                  <div className="flex items-center justify-between sm:hidden">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {new Date(result.time).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">{result.page}페이지 {result.rank_in_page}번째</span>
                                  </div>
                                  <div className="hidden sm:flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${result.total_rank <= 10 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : result.total_rank <= 50 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{result.total_rank}</div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-medium text-gray-900 dark:text-white truncate">{result.product_title}</p>
                                          {result.is_exact_match && (<span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full font-medium">정확 매칭</span>)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                          <span>{result.mall_name}</span>
                                          {result.brand && <span>브랜드: {result.brand}</span>}
                                          <span>{result.price}원</span>
                                          <span className="text-blue-600">{result.page}페이지 {result.rank_in_page}번째</span>
                                        </div>
                                      </div>
                                    </div>
                                    <a href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(selectedSchedule.search_query)}&start=${(result.page - 1) * 20 + 1}`} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"><ExternalLink className="w-4 h-4" />바로가기</a>
                                  </div>
              </div>
            ))
          )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
                <p className="text-red-500">히스토리를 불러올 수 없습니다.</p>
              </div>
            )}
            </div>
          </motion.div>
        </motion.div>
            )}
      </AnimatePresence>
      , document.body) : null}

      {/* 전체 삭제 확인 다이얼로그 */}
      <ConfirmationDialog
        isOpen={showDeleteAllDialog}
        onClose={() => setShowDeleteAllDialog(false)}
        onConfirm={handleDeleteAllData}
        title="전체 데이터 삭제"
        message="모든 자동검색 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다. (설정은 유지됩니다)"
        confirmText="전체 삭제"
        cancelText="취소"
        type="danger"
      />

      {/* 스케줄 삭제 확인 다이얼로그 */}
      <ConfirmationDialog
        isOpen={showDeleteScheduleDialog}
        onClose={() => {
          console.log('삭제 다이얼로그 닫기');
          setShowDeleteScheduleDialog(false);
          setDeleteTargetSchedule(null);
        }}
        onConfirm={handleDeleteScheduleData}
        title="스케줄 데이터 삭제"
        message={`"${deleteTargetSchedule?.configName || 'Unknown'}" 스케줄의 모든 데이터를 삭제하시겠습니까? 설정은 유지됩니다.`}
        confirmText="예, 삭제합니다"
        cancelText="아니오, 취소"
        type="danger"
      />
    </div>
  );
}
