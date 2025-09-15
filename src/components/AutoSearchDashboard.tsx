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
  Target
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
    config_name: string;
    status: string;
    started_at: string;
    completed_at?: string;
    results_count: number;
    duration_ms?: number;
  }>;
  topConfigs: Array<{
    id: number;
    name: string;
    search_query: string;
    run_count: number;
    success_count: number;
    success_rate: number;
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

      {/* 상위 설정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
