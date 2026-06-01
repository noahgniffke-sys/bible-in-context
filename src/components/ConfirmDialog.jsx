import { createContext, useContext, useState, useCallback } from 'react'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const ConfirmContext = createContext(null)

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be inside ConfirmProvider')
  return ctx
}

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const confirm = useCallback(({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false }) => {
    triggerHaptic(destructive ? HapticStyle.WARNING : HapticStyle.LIGHT)
    return new Promise((resolve) => {
      setDialog({ title, message, confirmLabel, cancelLabel, destructive, resolve })
    })
  }, [])

  const handleConfirm = () => {
    triggerHaptic(dialog?.destructive ? HapticStyle.HEAVY : HapticStyle.MEDIUM)
    dialog?.resolve(true)
    setDialog(null)
  }

  const handleCancel = () => {
    triggerHaptic(HapticStyle.LIGHT)
    dialog?.resolve(false)
    setDialog(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99998] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          onClick={handleCancel}
        >
          <div
            className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              {dialog.title && (
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{dialog.title}</h3>
              )}
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{dialog.message}</p>
            </div>
            <div className="border-t border-[var(--border-primary)] flex">
              <button
                onClick={handleCancel}
                className="flex-1 py-4 text-[var(--text-secondary)] font-medium text-base border-r border-[var(--border-primary)] active:bg-[var(--bg-surface)] transition-colors"
              >
                {dialog.cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-4 font-semibold text-base active:bg-[var(--bg-surface)] transition-colors ${
                  dialog.destructive ? 'text-[var(--accent-error)]' : 'text-[var(--gold-accent)]'
                }`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
