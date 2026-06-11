import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { checkUsernameAvailable, updateProfile } from '../lib/supabase'
import { validateUsername } from '../lib/moderation'
import ErrorBanner from '../components/ErrorBanner'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function CompleteProfile() {
  const { user, refreshProfile } = useAuth()
  const toast = useToast()

  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [usernameStatus, setUsernameStatus] = useState(null) // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [submitting, setSubmitting] = useState(false)

  // Real-time username availability check
  useEffect(() => {
    if (!username) { setUsernameStatus(null); return }

    const v = validateUsername(username)
    if (!v.valid) { setUsernameStatus('invalid'); return }

    setUsernameStatus('checking')
    const timeout = setTimeout(async () => {
      const { available } = await checkUsernameAvailable(username.toLowerCase(), user?.id)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 400)

    return () => clearTimeout(timeout)
  }, [username])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const trimmed = username.trim().toLowerCase()
    const check = validateUsername(trimmed)
    if (!check.valid) { setError(check.error); return }
    if (usernameStatus === 'taken') { setError('That username is already taken'); return }

    setSubmitting(true)
    triggerHaptic(HapticStyle.MEDIUM)

    try {
      const { available } = await checkUsernameAvailable(trimmed)
      if (!available) {
        setUsernameStatus('taken')
        setError('That username is already taken')
        setSubmitting(false)
        return
      }

      const { error: updateError } = await updateProfile(user.id, {
        username: trimmed,
        display_name: trimmed,
        profile_setup_complete: true,
      })

      if (updateError) {
        if (updateError.code === '23505') {
          setUsernameStatus('taken')
          setError('That username is already taken')
        } else {
          throw updateError
        }
        setSubmitting(false)
        return
      }

      refreshProfile().catch(() => {})
      triggerHaptic(HapticStyle.SUCCESS)
      toast.success('Profile set up!')
      window.location.replace('/')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
      triggerHaptic(HapticStyle.ERROR)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" style={{ color: 'var(--gold-accent)', textShadow: '0 0 22px var(--gold-glow)' }}>
            {'✞'}
          </div>
          <h1 className="brand-wordmark text-2xl mb-2">Choose Your Username</h1>
          <div className="themed-divider my-3" style={{ width: '40%' }} />
          <p className="text-[var(--text-secondary)] text-sm italic" style={{ fontFamily: 'var(--font-body)' }}>
            This is how others will find you.
          </p>
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
                placeholder="your_username"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full pl-8 pr-10 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-secondary)]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <svg className="w-5 h-5 text-[var(--text-secondary)] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {usernameStatus === 'available' && (
                  <svg className="w-5 h-5" style={{ color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {usernameStatus === 'taken' && (
                  <svg className="w-5 h-5" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
            {usernameStatus === 'taken' && <p className="text-xs mt-1" style={{ color: '#f87171' }}>That username is already taken</p>}
            {usernameStatus === 'invalid' && username.length > 0 && (
              <p className="text-xs mt-1" style={{ color: '#facc15' }}>
                {username.length < 3 ? 'Must be at least 3 characters' : 'Letters, numbers, and underscores only'}
              </p>
            )}
            {usernameStatus === 'available' && <p className="text-xs mt-1" style={{ color: '#4ade80' }}>Username is available</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || !username || usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'checking'}
            className="themed-btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile
