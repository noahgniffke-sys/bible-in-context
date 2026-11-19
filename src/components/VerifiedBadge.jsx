import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VERIFIED_MOTTO, VERIFIED_VERSES, isVerified } from '../lib/verified'
import { triggerHaptic, HapticStyle } from '../lib/haptics'
import CrossMark from './CrossMark'

// Small white cross badge shown next to verified usernames.
// Tap opens a modal with the founders' creed and verse references.
function VerifiedBadge({ username, size = 14, inline = true }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (!isVerified(username)) return null

  function openInfo(e) {
    e.preventDefault()
    e.stopPropagation()
    triggerHaptic(HapticStyle.LIGHT)
    setOpen(true)
  }

  function close() {
    setOpen(false)
  }

  function goToVerse(v) {
    triggerHaptic(HapticStyle.LIGHT)
    setOpen(false)
    if (v.verse) navigate(`/bible/${v.bookId}/${v.chapter}/${v.verse}`)
    else navigate(`/bible/${v.bookId}/${v.chapter}`)
  }

  return (
    <>
      <button
        onClick={openInfo}
        aria-label="Verified account"
        title="Verified account"
        className={`${inline ? 'inline-flex' : 'flex'} items-center justify-center rounded-full bg-white text-[var(--accent-secondary)] flex-shrink-0 active:scale-90 transition-transform`}
        style={{ width: size + 6, height: size + 6, minWidth: size + 6, minHeight: size + 6, padding: 0, lineHeight: 1 }}
      >
        <CrossMark size={size} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 scale-in"
          >
            <div className="flex justify-center mb-3">
              <span
                className="inline-flex items-center justify-center rounded-full bg-white text-[var(--accent-secondary)]"
                style={{ width: 40, height: 40 }}
              >
                <CrossMark size={22} />
              </span>
            </div>

            <h3 className="text-center text-lg font-bold text-[var(--text-primary)] mb-5">
              {VERIFIED_MOTTO}
            </h3>

            <div className="flex flex-col gap-2">
              {VERIFIED_VERSES.map((v) => (
                <button
                  key={v.label}
                  onClick={() => goToVerse(v)}
                  className="w-full py-3 px-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] font-medium active:scale-95"
                >
                  {v.label}
                </button>
              ))}
            </div>

            <button
              onClick={close}
              className="w-full mt-5 py-2 rounded-lg text-sm text-[var(--text-muted)] active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default VerifiedBadge
