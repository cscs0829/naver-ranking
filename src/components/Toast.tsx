'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ message: string; variant?: ToastVariant }>
      setToasts(prev => [
        ...prev,
        { id: Date.now() + Math.random(), message: custom.detail.message, variant: custom.detail.variant || 'info' }
      ])
    }
    window.addEventListener('app:toast', handler as EventListener)
    return () => window.removeEventListener('app:toast', handler as EventListener)
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map(t => setTimeout(() => {
      setToasts(prev => prev.filter(p => p.id !== t.id))
    }, 2500))
    return () => timers.forEach(clearTimeout)
  }, [toasts])

  const iconFor = (v: ToastVariant) => 
    v === 'success' ? <CheckCircle className="w-4 h-4" /> : 
    v === 'error' ? <AlertCircle className="w-4 h-4" /> : 
    v === 'warning' ? <AlertTriangle className="w-4 h-4" /> : 
    <Info className="w-4 h-4" />
  
  const clsFor = (v: ToastVariant) => 
    v === 'success' ? 'from-emerald-500 to-teal-500' : 
    v === 'error' ? 'from-rose-500 to-pink-500' : 
    v === 'warning' ? 'from-amber-500 to-orange-500' : 
    'from-blue-500 to-indigo-500'

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white shadow-lg bg-gradient-to-r ${clsFor(t.variant)} will-change-transform animate-fade-in`}>
          {iconFor(t.variant)}
          <span className="text-sm">{t.message}</span>
        </div>
      ))}
    </div>
  )
}


