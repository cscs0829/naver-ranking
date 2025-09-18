'use client'

import React, { useEffect, useRef } from 'react'
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
}

export default function DeleteConfirmationToast({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '예, 삭제합니다',
  cancelText = '아니오, 취소'
}: DeleteConfirmationToastProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // 포커스 관리 및 키보드 네비게이션
  useEffect(() => {
    if (isOpen) {
      // 토스트가 열릴 때 취소 버튼에 포커스
      setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 100)
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            duration: 0.4,
            damping: 25,
            stiffness: 300
          }}
          className="fixed bottom-6 right-6 z-[100000] max-w-md w-full mx-4"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-toast-title"
          aria-describedby="delete-toast-description"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden backdrop-blur-sm bg-opacity-95">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-red-100 dark:border-red-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/30">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 
                  id="delete-toast-title" 
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                aria-label="닫기"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* 내용 */}
            <div className="p-4">
              <p 
                id="delete-toast-description" 
                className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4"
              >
                {message}
              </p>

              {/* 액션 버튼들 */}
              <div className="flex gap-3">
                <button
                  ref={cancelButtonRef}
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {cancelText}
                </button>
                <button
                  ref={confirmButtonRef}
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
