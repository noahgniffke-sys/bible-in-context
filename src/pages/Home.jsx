import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import { getTranslation, setTranslation, getTranslationName, AVAILABLE_TRANSLATIONS } from '../lib/bible-api'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function Home() {
  const { theme, toggleTheme } = useTheme()
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          Bible in Context
        </h2>
        <p className="text-[var(--text-secondary)]">
          {user ? 'Welcome back' : 'Explore Scripture with depth and clarity'}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <QuickAction
          emoji="📖"
          label="Continue Reading"
          description="Pick up where you left off"
          to="/bible"
        />
        <QuickAction
          emoji="🔍"
          label="Search"
          description="Find verses and topics"
          to="/search"
        />
        <QuickAction
          emoji="📝"
          label="My Notes"
          description="Personal study notes"
          to="/notes"
        />
        <QuickAction
          emoji="🙏"
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
              📜 Translation
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

      {/* Theme toggle */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              {theme === 'dark' ? '⚔️ Noah Theme' : '🌸 Allie Theme'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {theme === 'dark' ? '(Dark)' : '(Light)'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg bg-[var(--accent-secondary)] text-white text-sm font-medium active:scale-95"
          >
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ emoji, label, description, to }) {
  return (
    <Link
      to={to}
      className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 block active:scale-95 transition-transform"
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="font-medium text-[var(--text-primary)] text-sm">{label}</p>
      <p className="text-xs text-[var(--text-muted)]">{description}</p>
    </Link>
  )
}

export default Home
