import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemePicker from '../components/ThemePicker'
import FontPicker from '../components/FontPicker'
import { useAuth } from '../hooks/useAuth'
import { getTranslation, setTranslation, getTranslationName, AVAILABLE_TRANSLATIONS } from '../lib/bible-api'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'
import VerseOfTheDay from '../components/VerseOfTheDay'

function Home() {
  const { user } = useAuth()
  const toast = useToast()
  const [currentTranslation, setCurrentTranslation] = useState(getTranslation())
  const [showTranslationPicker, setShowTranslationPicker] = useState(false)

  function pickTranslation(code) {
    setTranslation(code)
    setCurrentTranslation(code)
    setShowTranslationPicker(false)
    triggerHaptic(HapticStyle.LIGHT)
    toast.info(`Switched to ${getTranslationName(code)}`)
  }

  return (
    <div className="p-4">
      {/* Welcome section */}
      <div className="mb-6 text-center pt-2">
        <h2 className="display text-3xl text-[var(--text-primary)] mb-1">
          Bible in Context
        </h2>
        <p className="text-[var(--text-secondary)] font-serif text-base italic" style={{ fontFamily: 'var(--font-body)' }}>
          {user ? 'Welcome back' : 'Scripture with depth and clarity'}
        </p>
        <div className="themed-divider mt-4" />
      </div>

      <VerseOfTheDay />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <QuickAction
          mark="Read"
          label="Continue Reading"
          description="Pick up where you left off"
          to="/bible"
        />
        <QuickAction
          mark="Find"
          label="Search"
          description="A verse, a reference, or a few words"
          to="/search"
        />
        <QuickAction
          mark="Notes"
          label="My Notes"
          description="Personal study notes"
          to="/notes"
        />
        <QuickAction
          mark="Pray"
          label="Prayers"
          description="Prayer journal"
          to="/prayers"
        />
      </div>

      {/* Translation picker */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden mb-3">
        <div
          role="button"
          onClick={() => { setShowTranslationPicker(!showTranslationPicker); triggerHaptic(HapticStyle.LIGHT) }}
          className="flex items-center justify-between px-4 py-4 cursor-pointer"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              Translation
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {currentTranslation} — {getTranslationName(currentTranslation)}
            </p>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${showTranslationPicker ? 'rotate-180' : ''}`}
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {showTranslationPicker && (
          <div className="border-t border-[var(--border-primary)] fade-in-up">
            {AVAILABLE_TRANSLATIONS.map(code => (
              <button
                key={code}
                onClick={() => pickTranslation(code)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 active:bg-[var(--bg-surface)] ${
                  currentTranslation === code ? 'bg-[var(--accent-secondary)]/10' : ''
                }`}
              >
                <div>
                  <p className={`text-sm font-bold ${currentTranslation === code ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-primary)]'}`}>
                    {code}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {getTranslationName(code)}
                  </p>
                </div>
                {currentTranslation === code && (
                  <span className="text-[var(--accent-secondary)] text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <ThemePicker />
      <FontPicker className="mt-3" />
    </div>
  )
}

function QuickAction({ mark, label, description, to }) {
  return (
    <Link
      to={to}
      className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 block active:scale-95 transition-transform"
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--gold-accent)] font-semibold mb-2">{mark}</div>
      <p className="font-medium text-[var(--text-primary)] text-sm">{label}</p>
      <p className="text-xs text-[var(--text-muted)]">{description}</p>
    </Link>
  )
}

export default Home
