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
  FileSpreadsheet
} from 'lucide-react';

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

  // 통계 데이터 조회
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/auto-search/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('통계 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 전체 데이터 삭제
  const handleDeleteAllData = async () => {
    if (!confirm('정말로 모든 자동검색 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/auto-search/delete-all', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('모든 데이터가 삭제되었습니다.');
        await fetchStats();
      } else {
        alert('오류가 발생했습니다: ' + data.error);
      }
    } catch (error) {
      console.error('데이터 삭제 오류:', error);
      alert('데이터를 삭제할 수 없습니다.');
    }
  };

  // 스케줄별 데이터 삭제
  const handleDeleteScheduleData = async (configId: number, configName: string) => {
    if (!confirm(`"${configName}" 스케줄의 모든 데이터를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/auto-search/delete-schedule/${configId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('스케줄 데이터가 삭제되었습니다.');
        await fetchStats();
      } else {
        alert('오류가 발생했습니다: ' + data.error);
      }
    } catch (error) {
      console.error('스케줄 데이터 삭제 오류:', error);
      alert('데이터를 삭제할 수 없습니다.');
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
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      alert('엑셀 파일을 생성할 수 없습니다.');
    }
  };

  useEffect(() => {
    fetchStats();
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
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            엑셀 내보내기
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
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 설정</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalConfigs}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">
              {stats.activeConfigs}개 활성
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 실행</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRuns}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">
              성공률 {successRate}%
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">성공 실행</p>
              <p className="text-2xl font-bold text-green-600">{stats.successRuns}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              {stats.errorRuns}개 실패
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 결과</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalResults.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
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
            <p className="text-gray-500 text-center py-4">순위 결과가 없습니다.</p>
          ) : (
            stats.scheduleRankings.map((schedule) => (
              <div key={schedule.config_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {schedule.config_name}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        schedule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.is_active ? '활성' : '비활성'}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      검색어: <span className="font-medium">"{schedule.search_query}"</span>
                    </p>
                    {schedule.target_product_name && (
                      <p className="text-sm text-gray-600">
                        대상 상품: <span className="font-medium">"{schedule.target_product_name}"</span>
                      </p>
                    )}
                    {schedule.target_mall_name && (
                      <p className="text-sm text-gray-600">
                        대상 쇼핑몰: <span className="font-medium">"{schedule.target_mall_name}"</span>
                      </p>
                    )}
                    {schedule.target_brand && (
                      <p className="text-sm text-gray-600">
                        대상 브랜드: <span className="font-medium">"{schedule.target_brand}"</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        마지막 체크: {new Date(schedule.latest_check).toLocaleString('ko-KR')}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        {schedule.rankings.length}개 상품 발견
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteScheduleData(schedule.config_id, schedule.config_name)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </div>
                
                {schedule.rankings.length > 0 ? (
                  <div className="space-y-2">
                    {schedule.rankings.slice(0, 5).map((ranking, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            ranking.total_rank <= 10 ? 'bg-red-100 text-red-600' :
                            ranking.total_rank <= 50 ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {ranking.total_rank}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900 truncate">
                                {ranking.product_title}
                              </p>
                              {ranking.is_exact_match && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                  정확 매칭
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{ranking.mall_name}</span>
                              {ranking.brand && <span>브랜드: {ranking.brand}</span>}
                              <span>{ranking.price}원</span>
                              {ranking.match_confidence < 1.00 && (
                                <span className="text-orange-600">
                                  신뢰도: {(ranking.match_confidence * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {ranking.page}페이지 {ranking.rank_in_page}번째
                          </p>
                          <p className="text-xs text-gray-500">
                            {ranking.check_date}
                          </p>
                          <a 
                            href={ranking.product_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            상품 보기 →
                          </a>
                        </div>
                      </div>
                    ))}
                    {schedule.rankings.length > 5 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        ... 외 {schedule.rankings.length - 5}개 상품 더
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">매칭된 상품이 없습니다.</p>
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
    </div>
  );
}
