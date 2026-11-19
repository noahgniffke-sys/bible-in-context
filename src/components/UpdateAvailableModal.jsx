import { Browser } from '@capacitor/browser'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const DISMISS_KEY = 'bic_update_dismissed_v'

function UpdateAvailableModal({ storeVersion, releaseNotes, url, onClose }) {
  function remember() {
    try {
      localStorage.setItem(`${DISMISS_KEY}${storeVersion}`, 'seen')
    } catch {}
  }

  async function handleUpdate() {
    triggerHaptic(HapticStyle.SUCCESS)
    remember()
    try {
      await Browser.open({ url })
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    onClose?.()
  }

  function handleLater() {
    triggerHaptic(HapticStyle.LIGHT)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[99997] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--gold-accent)]/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--gold-accent)] flex items-center justify-center mb-4">
            <span className="text-2xl text-[var(--on-gold)]">⟳</span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Update Available</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            A new version of Bible in Context (<span className="text-[var(--text-primary)] font-mono">{storeVersion}</span>) is ready.
          </p>
          {releaseNotes && (
            <div className="w-full max-h-32 overflow-auto bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg p-3 mb-5 text-left">
              <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                {releaseNotes.trim()}
              </p>
            </div>
          )}

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleUpdate}
              className="w-full py-3 rounded-xl font-bold bg-[var(--gold-accent)] text-[var(--on-gold)] hover:opacity-90 active:scale-95 transition-all"
            >
              Update Now
            </button>
            <button
              onClick={handleLater}
              className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function wasDismissed(storeVersion) {
  try {
    return localStorage.getItem(`${DISMISS_KEY}${storeVersion}`) === 'seen'
  } catch {
    return false
  }
}

export default UpdateAvailableModal
