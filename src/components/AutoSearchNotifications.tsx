'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  X,
  Settings
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  config_name?: string;
}

export default function AutoSearchNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // 알림 조회
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/auto-search/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      // AbortError인 경우 조용히 처리
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('알림 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // 30초마다 알림 새로고침
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // 알림 읽음 처리
  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/auto-search/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      // AbortError인 경우 조용히 처리
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('알림 읽음 처리 오류:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      await fetch('/api/auto-search/notifications/read-all', {
        method: 'POST'
      });

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      // AbortError인 경우 조용히 처리
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('모든 알림 읽음 처리 오류:', error);
    }
  };

  // 알림 삭제
  const deleteNotification = async (id: number) => {
    try {
      await fetch(`/api/auto-search/notifications/${id}`, {
        method: 'DELETE'
      });

      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      // AbortError인 경우 조용히 처리
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('알림 삭제 오류:', error);
    }
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  // 알림 타입별 배경색
  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';

    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 w-16 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-8 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* 알림 목록 스켈레톤 */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/2 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/4 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-6 w-16 rounded animate-pulse bg-slate-200 dark:bg-slate-700" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">알림</h2>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              모두 읽음
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-3">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>알림이 없습니다.</p>
            </motion.div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border transition-all duration-200 ${getNotificationBgColor(notification.type, notification.read)
                  } ${!notification.read ? 'shadow-sm' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                          {notification.message}
                        </p>
                        {notification.config_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            설정: {notification.config_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString('ko-KR')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="읽음 처리"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="삭제"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 설정 패널 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <h3 className="font-medium text-gray-900 mb-3">알림 설정</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-700">성공 알림 받기</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-700">오류 알림 받기</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">경고 알림 받기</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">정보 알림 받기</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
