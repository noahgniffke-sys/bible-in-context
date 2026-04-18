import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { getTranslation, setTranslation, getTranslationName, AVAILABLE_TRANSLATIONS } from '../lib/bible-api'
import { supabase } from '../lib/supabase'
import ToggleSwitch from '../components/ToggleSwitch'
import { useConfirm } from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function Profile() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const confirm = useConfirm()
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

  async function handleDeleteAccount() {
    const first = await confirm({
      title: 'Delete Account',
      message: 'This will permanently delete your account and all your data. This cannot be undone.',
      confirmLabel: 'Continue',
      destructive: true,
    })
    if (!first) return

    const second = await confirm({
      title: 'Are you sure?',
      message: 'All your notes, highlights, prayers, and plans will be permanently deleted.',
      confirmLabel: 'Delete Everything',
      destructive: true,
    })
    if (!second) return

    triggerHaptic(HapticStyle.ERROR)

    try {
      // Delete profile data (cascading deletes handle related tables)
      await supabase.from('profiles').delete().eq('id', user.id)

      // Sign out
      await signOut()

      // Clear local data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('bic_')) keysToRemove.push(key)
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))

      toast.info('Account deleted')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error('Failed to delete account: ' + err.message)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Settings</h2>

      {/* Account info */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mb-4">
        {user ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-secondary)] flex items-center justify-center text-white text-xl font-bold">
                {(profile?.display_name || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)]">
                  {profile?.display_name || 'User'}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  @{profile?.username || 'unknown'}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
              <span>{profile?.followers_count || 0} followers</span>
              <span>{profile?.following_count || 0} following</span>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-medium text-[var(--text-primary)] mb-1">Not signed in</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Sign in to sync your notes, highlights, and prayers across devices.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-lg bg-[var(--accent-secondary)] text-white font-medium active:scale-95"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Theme */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mb-4">
        <ToggleSwitch
          label={theme === 'dark' ? 'Noah Theme (Dark)' : 'Allie Theme (Light)'}
          description="Switch between dark and light mode"
          value={theme === 'light'}
          onChange={toggleTheme}
        />
      </div>

      {/* Translation */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden mb-4">
        <div
          role="button"
          onClick={() => { setShowTranslationPicker(!showTranslationPicker); triggerHaptic(HapticStyle.LIGHT) }}
          className="flex items-center justify-between px-4 py-4 cursor-pointer"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          <div>
            <p className="font-medium text-[var(--text-primary)]">Translation</p>
            <p className="text-sm text-[var(--text-muted)]">{currentTranslation} — {getTranslationName(currentTranslation)}</p>
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

      {/* Social */}
      {user && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mb-4 space-y-3">
          <button
            onClick={() => { navigate('/feed'); triggerHaptic(HapticStyle.LIGHT) }}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="text-[var(--text-primary)] font-medium">Feed</span>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[var(--text-muted)]">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => { navigate('/plans'); triggerHaptic(HapticStyle.LIGHT) }}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="text-[var(--text-primary)] font-medium">Bible Plans</span>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[var(--text-muted)]">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Danger zone */}
      {user && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mb-4 space-y-3">
          <button
            onClick={async () => {
              triggerHaptic(HapticStyle.LIGHT)
              await signOut()
              toast.info('Signed out')
            }}
            className="w-full py-3 rounded-lg border border-[var(--text-muted)] text-[var(--text-secondary)] font-medium active:scale-95"
          >
            Sign Out
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full py-3 rounded-lg border border-[var(--accent-error)] text-[var(--accent-error)] font-medium active:scale-95"
          >
            Delete Account
          </button>
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] text-center mt-4">
        Bible in Context v1.0
      </p>
    </div>
  )
}

export default Profile
