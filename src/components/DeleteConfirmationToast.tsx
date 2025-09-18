'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, AlertTriangle, Shield } from 'lucide-react'

interface DeleteConfirmationToastProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning'
  showBackdrop?: boolean
  position?: 'center' | 'viewport-center' | 'near-trigger'
  triggerElement?: HTMLElement | null
}

export default function DeleteConfirmationToast({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '예, 삭제합니다',
  cancelText = '아니오, 취소',
  type = 'danger',
  showBackdrop = true,
  position = 'center',
  triggerElement = null
}: DeleteConfirmationToastProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 포커스 관리 및 키보드 네비게이션
  useEffect(() => {
    if (isOpen) {
      // 토스트가 열릴 때 취소 버튼에 포커스
      setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 150)
      
      // 스크롤 방지 (중요한 확인 작업이므로)
      if (showBackdrop) {
        document.body.style.overflow = 'hidden'
      }
    }

    return () => {
      if (showBackdrop) {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, showBackdrop])

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // 포커스 트랩
  useEffect(() => {
    if (!isOpen) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          iconBg: 'bg-amber-50 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
          headerBorder: 'border-amber-100 dark:border-amber-900/50',
          stripe: 'from-amber-500 via-amber-600 to-amber-500'
        }
      default: // danger
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-50 dark:bg-red-900/30',
          border: 'border-red-200 dark:border-red-800',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          headerBorder: 'border-red-100 dark:border-red-900/50',
          stripe: 'from-red-500 via-red-600 to-red-500'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 (선택적) */}
          {showBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000]"
              onClick={handleBackdropClick}
              aria-hidden="true"
            />
          )}
          
          {/* 메인 컨테이너 - 중앙 배치 */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[100000] pointer-events-none">
            <motion.div
              ref={containerRef}
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 50,
                rotateX: 15
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                rotateX: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                y: 50,
                rotateX: -15
              }}
              transition={{
                type: "spring",
                duration: 0.4,
                damping: 25,
                stiffness: 300
              }}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border ${styles.border} overflow-hidden backdrop-blur-sm bg-opacity-95 w-full max-w-md mx-auto pointer-events-auto`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-toast-title"
              aria-describedby="delete-toast-description"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* 위험 표시 스트라이프 */}
              <div className={`h-1 bg-gradient-to-r ${styles.stripe} animate-pulse`} />
              
              {/* 헤더 */}
              <motion.div 
                className={`flex items-center justify-between p-6 border-b ${styles.headerBorder}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className={`p-3 rounded-full ${styles.iconBg}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 300 }}
                  >
                    {styles.icon}
                  </motion.div>
                  <div>
                    <h3 
                      id="delete-toast-title" 
                      className="text-xl font-bold text-gray-900 dark:text-white"
                    >
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      이 작업은 되돌릴 수 없습니다
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </motion.div>

              {/* 내용 */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-6">
                  <Shield className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p 
                    id="delete-toast-description" 
                    className="text-gray-600 dark:text-gray-300 leading-relaxed"
                  >
                    {message}
                  </p>
                </div>

                {/* 경고 메시지 */}
                <motion.div 
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">주의: 삭제된 데이터는 복구할 수 없습니다</span>
                  </div>
                </motion.div>

                {/* 액션 버튼들 */}
                <motion.div 
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <motion.button
                    ref={cancelButtonRef}
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    {cancelText}
                  </motion.button>
                  <motion.button
                    ref={confirmButtonRef}
                    onClick={handleConfirm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 px-6 py-3 ${styles.confirmButton} text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {confirmText}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}