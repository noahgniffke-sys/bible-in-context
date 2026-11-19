import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getProfile, createProfile } from '../lib/supabase'
import CrossMark from '../components/CrossMark'

function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    function hardRedirect(path) {
      try { navigate(path, { replace: true }) } catch {}
      // Bulletproof fallback in case React Router state is wedged after OAuth redirect.
      window.location.replace(path)
    }

    async function waitForSession() {
      const existing = (await supabase.auth.getSession()).data.session
      if (existing) return existing

      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
        if (data?.session) return data.session
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          subscription.unsubscribe()
          reject(new Error('Sign-in timed out. Please try again.'))
        }, 10000)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            clearTimeout(timeout)
            subscription.unsubscribe()
            resolve(session)
          }
        })
      })
    }

    ;(async () => {
      try {
        const session = await waitForSession()
        if (cancelled) return

        const userId = session.user.id

        // Ensure profile exists. RLS-safe: only fetches own.
        let { data: profile, error: profileErr } = await getProfile(userId)
        if (profileErr && profileErr.code !== 'PGRST116') {
          console.error('[auth] profile fetch error:', profileErr)
        }

        if (!profile) {
          const meta = session.user.user_metadata || {}
          const email = session.user.email || ''
          const base = (meta.preferred_username || meta.name || email.split('@')[0] || 'user')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .slice(0, 20) || 'user'
          // Auto-generated placeholder; user picks real username on /complete-profile.
          const tempUsername = `${base.slice(0, 14)}_${Date.now().toString(36).slice(-5)}`
          const { data: created, error: createErr } = await createProfile(userId, {
            username: tempUsername,
            display_name: meta.full_name || meta.name || base,
            avatar_url: meta.avatar_url || meta.picture || null,
            profile_setup_complete: false,
          })
          if (createErr) {
            console.error('[auth] profile create error:', createErr)
          } else {
            profile = created
          }
        }

        if (cancelled) return

        if (!profile || !profile.profile_setup_complete) {
          hardRedirect('/complete-profile')
        } else {
          hardRedirect('/')
        }
      } catch (err) {
        console.error('[auth] callback error:', err)
        if (!cancelled) setError(err.message || 'Sign-in failed')
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">{'⚠️'}</div>
          <p className="text-[var(--text-primary)] font-medium mb-2">Sign-in failed</p>
          <p className="text-[var(--text-secondary)] text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.replace('/login')}
            className="px-6 py-2 rounded-lg bg-[var(--accent-secondary)] text-white font-medium active:scale-95"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-flex text-[var(--gold-accent)]">
          <CrossMark size={40} />
        </div>
        <p className="text-[var(--text-secondary)]">Signing you in...</p>
      </div>
    </div>
  )
}

export default AuthCallback
