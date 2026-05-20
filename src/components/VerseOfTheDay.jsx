import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVerseOfTheDay, msUntilNextPSTMidnight } from '../lib/verse-of-day'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function VerseOfTheDay() {
  const navigate = useNavigate()
  const [verse, setVerse] = useState(() => getVerseOfTheDay())
  const [showStudy, setShowStudy] = useState(false)

  // Refresh at PST midnight, and also when the tab becomes visible again.
  useEffect(() => {
    let timeoutId
    function scheduleRefresh() {
      const ms = msUntilNextPSTMidnight()
      timeoutId = setTimeout(() => {
        setVerse(getVerseOfTheDay())
        scheduleRefresh()
      }, ms)
    }
    scheduleRefresh()

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        const fresh = getVerseOfTheDay()
        if (fresh && fresh.dateKey !== verse?.dateKey) setVerse(fresh)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [verse?.dateKey])

  if (!verse) return null

  function openInBible() {
    triggerHaptic(HapticStyle.LIGHT)
    navigate(`/bible/${verse.bookId}/${verse.chapter}/${verse.verse}`)
  }

  function toggleStudy() {
    triggerHaptic(HapticStyle.LIGHT)
    setShowStudy(s => !s)
  }

  return (
    <div
      className="rounded-2xl mb-6 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in oklab, var(--accent-primary) 22%, var(--bg-card)) 0%, var(--bg-card) 60%, color-mix(in oklab, var(--gold-accent) 12%, var(--bg-card)) 100%)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 8px 28px -16px var(--accent-glow)',
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[10px] uppercase tracking-[0.3em] font-bold"
            style={{ color: 'var(--gold-accent)' }}
          >
            Verse of the Day
          </p>
          <span className="text-xs text-[var(--text-muted)]">{verse.ref}</span>
        </div>

        <button
          onClick={openInBible}
          className="text-left w-full active:scale-[0.99] transition-transform"
        >
          <p
            className="text-lg leading-relaxed text-[var(--text-primary)] mb-1"
            style={{ fontFamily: 'Georgia, "Cormorant Garamond", serif' }}
          >
            "{verse.text}"
          </p>
          <p className="text-xs text-[var(--accent-secondary)] font-medium mt-2">
            Open in Bible →
          </p>
        </button>

        <div
          className="mt-4 pt-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Context
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {verse.explanation}
          </p>
        </div>

        <button
          onClick={toggleStudy}
          className="mt-4 w-full flex items-center justify-between py-2 px-3 rounded-lg active:scale-[0.99] transition-transform"
          style={{
            background: 'color-mix(in oklab, var(--bg-elevated) 60%, transparent)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {showStudy ? 'Hide study questions' : 'Study this verse'}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showStudy ? 'rotate-180' : ''}`}
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {showStudy && (
          <ol className="mt-3 space-y-2 list-none">
            {verse.questions.map((q, i) => (
              <li
                key={i}
                className="text-sm text-[var(--text-secondary)] leading-relaxed flex gap-3"
              >
                <span
                  className="shrink-0 font-bold"
                  style={{ color: 'var(--gold-accent)' }}
                >
                  {i + 1}.
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export default VerseOfTheDay
