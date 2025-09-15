'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
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

export default function AutoSearchDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 통계 데이터 조회
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auto-search/dashboard?t=${Date.now()}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('통계 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 수동 새로고침
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchStats();
  };

  // 전체 데이터 삭제
  const handleDeleteAllData = async () => {
    // 토스트로 확인 메시지 표시
    toast('모든 자동검색 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다. 페이지를 새로고침하면 다시 확인할 수 있습니다.', 'warning');
    
    try {
      const response = await fetch('/api/auto-search/delete-all', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast('모든 자동검색 데이터가 삭제되었습니다. (설정은 유지됨)', 'success');
        await fetchStats();
      } else {
        toast('오류가 발생했습니다: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('데이터 삭제 오류:', error);
      toast('데이터를 삭제할 수 없습니다.', 'error');
    }
  };

  // 스케줄별 데이터 삭제
  const handleDeleteScheduleData = async (configId: number, configName: string) => {
    // 토스트로 확인 메시지 표시
    toast(`"${configName}" 스케줄의 모든 데이터를 삭제하시겠습니까? 설정은 유지됩니다.`, 'warning');

    try {
      const response = await fetch(`/api/auto-search/delete-schedule/${configId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast('스케줄 데이터가 삭제되었습니다.', 'success');
        await fetchStats();
      } else {
        toast('오류가 발생했습니다: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('스케줄 데이터 삭제 오류:', error);
      toast('데이터를 삭제할 수 없습니다.', 'error');
    }
  };

  // 엑셀 내보내기
  const handleExportToExcel = async () => {
    try {
      const response = await fetch('/api/auto-search/export-excel');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `자동검색_결과_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast('엑셀 파일이 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      toast('엑셀 파일을 생성할 수 없습니다.', 'error');
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

  // 자동 새로고침 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30초마다 새로고침

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">자동 검색 대시보드</h2>
        <p className="text-gray-600">자동 검색 시스템의 전체 현황을 확인하세요</p>
        
        {/* 액션 버튼들 */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            엑셀 내보내기
          </button>
          <button
            onClick={handleDebugInfo}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            디버그 정보
          </button>
          <button
            onClick={handleDeleteAllData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-slate-500">
              검색된 상품 수
            </span>
          </div>
        </motion.div>
      </div>

      {/* 최근 활동 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          최근 활동
        </h3>
        <div className="space-y-3">
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">최근 활동이 없습니다.</p>
          ) : (
            stats.recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-100' : 
                    activity.status === 'error' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : activity.status === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.config_name}</p>
                    <p className="text-sm text-gray-500">
                      "{activity.search_query}"
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.started_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.results_count}개 결과
                  </p>
                  {activity.duration_ms && (
                    <p className="text-xs text-gray-500">
                      {(activity.duration_ms / 1000).toFixed(1)}초
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* 스케줄별 순위 결과 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          스케줄별 순위 결과
        </h3>
        <div className="space-y-6">
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
          ) : (
            stats.scheduleRankings.map((schedule) => (
              <div 
                key={schedule.config_id} 
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800"
                onClick={() => handleScheduleClick(schedule)}
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                      {schedule.config_name}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      schedule.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {schedule.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScheduleData(schedule.config_id, schedule.config_name);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>

                {/* 검색 정보 */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400 w-20">검색어:</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">"{schedule.search_query}"</span>
                  </div>
                  
                  {schedule.target_product_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-slate-400 w-20">대상 상품:</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">"{schedule.target_product_name}"</span>
                    </div>
                  )}
                  
                  {schedule.target_mall_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-slate-400 w-20">대상 쇼핑몰:</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">"{schedule.target_mall_name}"</span>
                    </div>
                  )}
                </div>

                {/* 최신 실행 정보 */}
                {schedule.rankings.length > 0 ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                          schedule.rankings[0].total_rank <= 10 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          schedule.rankings[0].total_rank <= 50 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {schedule.rankings[0].total_rank}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            {new Date(schedule.latest_check).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })} 기준
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {schedule.rankings[0].page}페이지 {schedule.rankings[0].rank_in_page}번째
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-slate-500">
                          {schedule.rankings.length}개 상품 발견
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
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
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* 상위 설정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          상위 설정
        </h3>
        <div className="space-y-3">
          {stats.topConfigs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">설정이 없습니다.</p>
          ) : (
            stats.topConfigs.map((config, index) => (
              <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{config.name}</p>
                    <p className="text-sm text-gray-500">{config.search_query}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {config.run_count}회 실행
                  </p>
                  <p className="text-xs text-green-600">
                    성공률 {config.success_rate}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* 히스토리 모달 */}
      {selectedSchedule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[99999] backdrop-blur-sm"
          onClick={closeHistoryModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
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
              <button
                onClick={closeHistoryModal}
                className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 히스토리 내용 */}
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">히스토리를 불러오는 중...</span>
              </div>
            ) : historyData ? (
              <div className="space-y-6">
                {historyData.history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">실행 히스토리가 없습니다.</p>
                  </div>
                ) : (
                  historyData.history.map((dayData: any, dayIndex: number) => (
                    <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        {new Date(dayData.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </h4>
                      
                      <div className="space-y-4">
                        {dayData.executions.map((execution: any, execIndex: number) => (
                          <div key={execIndex} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  {execution.hour.toString().padStart(2, '0')}:
                                  {execution.minute.toString().padStart(2, '0')}:
                                  {execution.second.toString().padStart(2, '0')}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {execution.results.length}개 상품 발견
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {execution.results.map((result: any, resultIndex: number) => (
                                <div key={resultIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      result.total_rank <= 10 ? 'bg-red-100 text-red-600' :
                                      result.total_rank <= 50 ? 'bg-orange-100 text-orange-600' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {result.total_rank}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-gray-900 truncate">
                                          {result.product_title}
                                        </p>
                                        {result.is_exact_match && (
                                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                            정확 매칭
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{result.mall_name}</span>
                                        {result.brand && <span>브랜드: {result.brand}</span>}
                                        <span>{result.price}원</span>
                                        <span className="text-blue-600">
                                          {result.page}페이지 {result.rank_in_page}번째
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <a 
                                    href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(selectedSchedule.search_query)}&start=${(result.page - 1) * 20 + 1}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    바로가기
                                  </a>
                                </div>
                              ))}
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
