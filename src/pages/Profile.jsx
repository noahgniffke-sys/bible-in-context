import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { getTranslation, setTranslation, getTranslationName, AVAILABLE_TRANSLATIONS } from '../lib/bible-api'
import { supabase, updateProfile } from '../lib/supabase'
import { validateUsername, validateDisplayName } from '../lib/moderation'
import ToggleSwitch from '../components/ToggleSwitch'
import VerifiedBadge from '../components/VerifiedBadge'
import { useConfirm } from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const [currentTranslation, setCurrentTranslation] = useState(getTranslation())
  const [showTranslationPicker, setShowTranslationPicker] = useState(false)
  const [editing, setEditing] = useState(null) // 'username' | 'display_name' | null
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState(null)
  const [editSaving, setEditSaving] = useState(false)

  function openEdit(field) {
    setEditing(field)
    setEditValue(profile?.[field] || '')
    setEditError(null)
    triggerHaptic(HapticStyle.LIGHT)
  }

  async function saveEdit() {
    if (!user || !editing) return
    const value = editValue.trim()
    const check = editing === 'username'
      ? validateUsername(value)
      : validateDisplayName(value)
    if (!check.valid) { setEditError(check.error); return }

    setEditSaving(true)
    setEditError(null)

    try {
      const payload = editing === 'username'
        ? { p_username: value.toLowerCase() }
        : { p_display_name: value }

      const { error } = await supabase.rpc('update_my_profile', payload)
      if (error) {
        if (error.code === '23505') throw new Error('That username is already taken')
        throw error
      }

      triggerHaptic(HapticStyle.SUCCESS)
      toast.success(editing === 'username' ? 'Username updated' : 'Display name updated')
      refreshProfile().catch(() => {})
      setEditing(null)
    } catch (err) {
      setEditError(err.message || 'Failed to save')
      triggerHaptic(HapticStyle.ERROR)
    } finally {
      setEditSaving(false)
    }
  }

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

  const initial = (profile?.display_name || profile?.username || '?')[0].toUpperCase()

  return (
    <div className="pb-4">
      {/* Profile hero */}
      <div
        className="relative px-5 pt-10 pb-6 mb-4 overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklab, var(--accent-primary) 18%, transparent) 0%, color-mix(in oklab, var(--accent-primary) 6%, transparent) 60%, transparent 100%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {user ? (
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.display_name || 'avatar'}
                  className="w-24 h-24 rounded-full object-cover"
                  style={{
                    border: '3px solid var(--bg-card)',
                    boxShadow: '0 8px 24px -8px var(--accent-glow)',
                  }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    border: '3px solid var(--bg-card)',
                    boxShadow: '0 8px 24px -8px var(--accent-glow)',
                  }}
                >
                  {initial}
                </div>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)] inline-flex items-center justify-center gap-2">
              {profile?.display_name || 'User'}
              <VerifiedBadge username={profile?.username} size={16} />
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              @{profile?.username || 'unknown'}
            </p>

            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {profile?.followers_count || 0}
                </p>
                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Followers
                </p>
              </div>
              <div
                className="w-px h-8"
                style={{ background: 'var(--border-primary)' }}
              />
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {profile?.following_count || 0}
                </p>
                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Following
                </p>
              </div>
            </div>

            {profile?.username && (
              <button
                onClick={() => {
                  triggerHaptic(HapticStyle.LIGHT)
                  navigate(`/u/${profile.username}`)
                }}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium active:scale-95"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                View public profile
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path
                    d="M9 5L16 12L9 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
              style={{
                background: 'var(--bg-card)',
                border: '2px dashed var(--border-primary)',
                color: 'var(--text-muted)',
              }}
            >
              ✞
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
              Your Profile
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
              Sign in to sync your notes, highlights, and prayers across devices.
            </p>
            <button
              onClick={() => { triggerHaptic(HapticStyle.MEDIUM); navigate('/login') }}
              className="mt-5 px-8 py-3 rounded-full bg-[var(--accent-secondary)] text-white font-medium active:scale-95"
              style={{ boxShadow: '0 8px 24px -8px var(--accent-glow)' }}
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      <div className="px-4">

      {/* Edit profile */}
      {user && (
        <>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold mb-2 px-1">
            Profile
          </p>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden mb-4">
            {/* Username row */}
            {editing === 'username' ? (
              <div className="p-4">
                <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  maxLength={20}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-secondary)] mb-2"
                />
                {editError && <p className="text-xs text-[var(--accent-error)] mb-2">{editError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={editSaving || !editValue.trim()}
                    className="flex-1 py-2 rounded-lg bg-[var(--accent-secondary)] text-white text-sm font-medium disabled:opacity-50 active:scale-95"
                  >
                    {editSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditing(null); triggerHaptic(HapticStyle.LIGHT) }}
                    className="py-2 px-4 rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openEdit('username')}
                className="w-full flex items-center justify-between px-4 py-4 active:bg-[var(--bg-surface)]"
              >
                <div className="text-left">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Username</p>
                  <p className="text-sm text-[var(--text-primary)]">@{profile?.username || '...'}</p>
                </div>
                <span className="text-xs text-[var(--accent-secondary)]">Edit</span>
              </button>
            )}

            <div className="border-t border-[var(--border-subtle)]" />

            {/* Display name row */}
            {editing === 'display_name' ? (
              <div className="p-4">
                <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  maxLength={50}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-secondary)] mb-2"
                />
                {editError && <p className="text-xs text-[var(--accent-error)] mb-2">{editError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={editSaving || !editValue.trim()}
                    className="flex-1 py-2 rounded-lg bg-[var(--accent-secondary)] text-white text-sm font-medium disabled:opacity-50 active:scale-95"
                  >
                    {editSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditing(null); triggerHaptic(HapticStyle.LIGHT) }}
                    className="py-2 px-4 rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openEdit('display_name')}
                className="w-full flex items-center justify-between px-4 py-4 active:bg-[var(--bg-surface)]"
              >
                <div className="text-left">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Display Name</p>
                  <p className="text-sm text-[var(--text-primary)]">{profile?.display_name || '...'}</p>
                </div>
                <span className="text-xs text-[var(--accent-secondary)]">Edit</span>
              </button>
            )}
          </div>
        </>
      )}

      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold mb-2 px-1">
        Settings
      </p>

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
        <>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold mb-2 mt-6 px-1">
            Discover
          </p>
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
        </>
      )}

      {/* Danger zone */}
      {user && (
        <>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold mb-2 mt-6 px-1">
            Account
          </p>
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
        </>
      )}

      <p className="text-xs text-[var(--text-muted)] text-center mt-6">
        Bible in Context v{__APP_VERSION__}
      </p>
      </div>
    </div>
  )
}

export default Profile
