'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'warning'
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // 포커스 관리 및 키보드 네비게이션
  useEffect(() => {
    if (isOpen) {
      // 다이얼로그가 열릴 때 취소 버튼에 포커스
      setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // ESC 키로 닫기 및 스크롤 방지
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
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
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
          border: 'border-red-200 dark:border-red-800',
          iconBg: 'bg-red-50 dark:bg-red-900/20'
        }
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
          border: 'border-blue-200 dark:border-blue-800',
          iconBg: 'bg-blue-50 dark:bg-blue-900/20'
        }
      default: // warning
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          confirmButton: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
          border: 'border-amber-200 dark:border-amber-800',
          iconBg: 'bg-amber-50 dark:bg-amber-900/20'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with better blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100000]"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Dialog Container */}
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: "spring", 
                duration: 0.4,
                damping: 25,
                stiffness: 300
              }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
              style={{ 
                maxHeight: '90vh',
                overflow: 'hidden'
              }}
            >
              {/* Header with improved icon design */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${styles.iconBg}`}>
                    {styles.icon}
                  </div>
                  <h3 
                    id="dialog-title" 
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p 
                  id="dialog-description" 
                  className="text-gray-600 dark:text-gray-300 leading-relaxed"
                >
                  {message}
                </p>
              </div>

              {/* Actions with improved focus management */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  ref={cancelButtonRef}
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                >
                  {cancelText}
                </button>
                <button
                  ref={confirmButtonRef}
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${styles.confirmButton}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
