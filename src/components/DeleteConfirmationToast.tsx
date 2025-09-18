'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, AlertTriangle } from 'lucide-react'

interface DeleteConfirmationToastProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning'
}

export default function DeleteConfirmationToast({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '예, 삭제합니다',
  cancelText = '아니오, 취소',
  type = 'danger'
}: DeleteConfirmationToastProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // 포커스 관리
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 300) // 애니메이션 완료 후 포커스
    }
  }, [isOpen])

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

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      // Tab 순환: 취소 -> 확인 -> 취소
      if (e.shiftKey && document.activeElement === cancelButtonRef.current) {
        e.preventDefault()
        confirmButtonRef.current?.focus()
      } else if (!e.shiftKey && document.activeElement === confirmButtonRef.current) {
        e.preventDefault()
        cancelButtonRef.current?.focus()
      }
    } else if (e.key === 'Enter' && document.activeElement === confirmButtonRef.current) {
      handleConfirm()
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          iconBg: 'bg-amber-50 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
          headerBorder: 'border-amber-100 dark:border-amber-900/50'
        }
      default: // danger
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          iconBg: 'bg-red-50 dark:bg-red-900/30',
          border: 'border-red-200 dark:border-red-800',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          headerBorder: 'border-red-100 dark:border-red-900/50'
        }
    }
  }

  const styles = getTypeStyles()

  // Portal을 사용해서 document.body에 직접 렌더링
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            duration: 0.5,
            damping: 25,
            stiffness: 400
          }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[99999] w-full max-w-md px-4"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 99999,
            pointerEvents: 'auto'
          }}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-toast-title"
          aria-describedby="delete-toast-description"
        >
          <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border ${styles.border} overflow-hidden backdrop-blur-sm`}>
            {/* 위험 표시 스트라이프 */}
            <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />
            
            {/* 헤더 */}
            <motion.div 
              className={`flex items-center justify-between p-4 border-b ${styles.headerBorder}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className={`p-2 rounded-full ${styles.iconBg}`}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 300 }}
                >
                  {styles.icon}
                </motion.div>
                <div>
                  <h3 
                    id="delete-toast-title" 
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    이 작업은 되돌릴 수 없습니다
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                aria-label="닫기"
              >
                <X className="w-4 h-4 text-gray-500" />
              </motion.button>
            </motion.div>

            {/* 내용 */}
            <div className="p-4">
              <p 
                id="delete-toast-description" 
                className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-sm"
              >
                {message}
              </p>

              {/* 액션 버튼들 */}
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <motion.button
                  ref={cancelButtonRef}
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  {cancelText}
                </motion.button>
                <motion.button
                  ref={confirmButtonRef}
                  onClick={handleConfirm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-2.5 ${styles.confirmButton} text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2 text-sm`}
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmText}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}