import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVerseOfTheDay, msUntilNextPSTMidnight } from '../lib/verse-of-day'
import { getTranslation, getVerse } from '../lib/bible-api'
import { ensureDailyVerseNotification } from '../lib/daily-verse-notification'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function VerseOfTheDay() {
  const navigate = useNavigate()
  const [verse, setVerse] = useState(() => getVerseOfTheDay())
  const [showStudy, setShowStudy] = useState(false)

  // The passage is fixed for the day. The wording follows the open translation.
  useEffect(() => {
    let cancelled = false
    async function loadText() {
      const base = getVerseOfTheDay()
      const translation = getTranslation()
      let text = base?.text
      if (base) {
        const loaded = await getVerse(base.bookId, base.chapter, base.verse, translation)
        if (loaded?.text) text = loaded.text
      }
      if (!cancelled && base) setVerse({ ...base, text, translation })
    }
    loadText()

    let timeoutId
    function scheduleRefresh() {
      const ms = msUntilNextPSTMidnight()
      timeoutId = setTimeout(() => {
        loadText()
        ensureDailyVerseNotification().catch(() => {})
        scheduleRefresh()
      }, ms)
    }
    scheduleRefresh()

    function onVisibility() {
      if (document.visibilityState === 'visible') loadText()
    }
    function onTranslation() {
      loadText()
      ensureDailyVerseNotification().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('bic-translation', onTranslation)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('bic-translation', onTranslation)
    }
  }, [])

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
      className="rounded-2xl mb-6 overflow-hidden relative"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in oklab, var(--accent-primary) 22%, var(--bg-card)) 0%, var(--bg-card) 60%, color-mix(in oklab, var(--gold-accent) 12%, var(--bg-card)) 100%)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 8px 28px -16px var(--accent-glow), 0 1px 0 color-mix(in oklab, var(--gold-accent) 40%, transparent) inset',
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[10px] uppercase tracking-[0.3em] font-bold display"
            style={{ color: 'var(--gold-accent)', fontFamily: 'var(--font-display)' }}
          >
            Verse of the Day
          </p>
          <span className="verse-ref text-xs">{verse.ref}{verse.translation ? ` · ${verse.translation}` : ''}</span>
        </div>

        <button
          onClick={openInBible}
          className="text-left w-full active:scale-[0.99] transition-transform"
        >
          <p
            className="text-lg leading-relaxed text-[var(--text-primary)] mb-1 verse-text"
            style={{ fontFamily: 'var(--font-body)', fontSize: '1.15rem', fontStyle: 'italic' }}
          >
            "{verse.text}"
          </p>
          <p className="text-xs text-[var(--accent-light)] font-medium mt-2 tracking-wide">
            Open in Bible
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
