import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { validateUsername, validateDisplayName } from '../lib/moderation'
import ErrorBanner from '../components/ErrorBanner'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function CompleteProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [username, setUsername] = useState(profile?.username || '')
  const [displayName, setDisplayName] = useState(profile?.display_name || '')

  // Sync inputs when profile loads asynchronously
  useEffect(() => {
    if (profile?.username && !username) setUsername(profile.username)
    if (profile?.display_name && !displayName) setDisplayName(profile.display_name)
  }, [profile])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const usernameCheck = validateUsername(username)
    if (!usernameCheck.valid) { setError(usernameCheck.error); return }

    const nameCheck = validateDisplayName(displayName)
    if (!nameCheck.valid) { setError(nameCheck.error); return }

    setLoading(true)
    triggerHaptic(HapticStyle.MEDIUM)

    try {
      const { error: rpcError } = await supabase.rpc('update_my_profile', {
        p_username: username.toLowerCase(),
        p_display_name: displayName,
        p_setup_complete: true,
      })
      if (rpcError) {
        if (rpcError.code === '23505') throw new Error('That username is already taken')
        throw rpcError
      }

      refreshProfile().catch(() => {})
      triggerHaptic(HapticStyle.SUCCESS)
      toast.success('Profile set up!')
      window.location.replace('/')
    } catch (err) {
      setError(err.message)
      triggerHaptic(HapticStyle.ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{'✞'}</div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Complete Your Profile
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Choose a username to share your studies with others.
          </p>
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="your_username"
              maxLength={20}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-secondary)]"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              maxLength={50}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-secondary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !displayName}
            className="w-full py-3 bg-[var(--accent-secondary)] text-white rounded-xl font-bold disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile
