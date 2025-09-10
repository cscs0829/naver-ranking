export type ToastVariant = 'success' | 'error' | 'info'

export function toast(message: string, variant: ToastVariant = 'info') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, variant } }))
}


