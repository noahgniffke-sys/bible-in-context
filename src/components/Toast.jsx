import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const toastHaptic = {
  success: HapticStyle.SUCCESS,
  error: HapticStyle.ERROR,
  warning: HapticStyle.WARNING,
  info: HapticStyle.LIGHT,
}

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const show = useCallback((message, type = 'info', duration = 3000) => {
    triggerHaptic(toastHaptic[type] || HapticStyle.LIGHT)
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const success = useCallback((msg, dur) => show(msg, 'success', dur), [show])
  const error = useCallback((msg, dur) => show(msg, 'error', dur || 4000), [show])
  const info = useCallback((msg, dur) => show(msg, 'info', dur), [show])
  const warning = useCallback((msg, dur) => show(msg, 'warning', dur), [show])

  const value = { show, success, error, info, warning }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none flex flex-col items-center pt-[calc(env(safe-area-inset-top,12px)+8px)] gap-2 px-4">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-5 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm animate-slide-in-down max-w-[90vw] text-center ${
              t.type === 'success' ? 'bg-[#00c853]/90 text-white' :
              t.type === 'error' ? 'bg-[var(--accent-error)]/90 text-white' :
              t.type === 'warning' ? 'bg-[var(--accent-warning)]/90 text-black' :
              'bg-[var(--bg-elevated)]/95 text-[var(--text-primary)] border border-[var(--border-primary)]'
            }`}
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
          >
            {t.type === 'success' && '✓ '}{t.type === 'error' && '✕ '}{t.type === 'warning' && '⚠ '}{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
