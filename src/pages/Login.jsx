import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, getProfile } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'
import ErrorBanner from '../components/ErrorBanner'
import BackButton from '../components/BackButton'
import CrossMark from '../components/CrossMark'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

let socialLoginInitialized = false
async function ensureSocialLoginInitialized() {
  if (socialLoginInitialized) return
  const iosClientId = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID
  const webClientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID
  if (!iosClientId || !webClientId) {
    throw new Error('Google sign-in is missing its client ID. Add the iOS and Web client IDs to the app build.')
  }
  const { SocialLogin } = await import('@capgo/capacitor-social-login')
  await SocialLogin.initialize({
    apple: {
      clientId: 'com.noahgniffke.bibleincontext',
    },
    google: {
      iOSClientId: iosClientId,
      // Supabase checks the token audience against the Web client, not the iOS client.
      iOSServerClientId: webClientId,
      webClientId,
      mode: 'online',
    },
  })
  socialLoginInitialized = true
}

function cancelledSignIn(err) {
  const msg = `${err?.message || ''} ${err?.errorMessage || ''}`.toLowerCase()
  return msg.includes('cancel') || err?.code === 12501 || err?.code === '-5' || err?.code === 1001
}

async function destinationAfterSignIn(user) {
  if (!user?.id) return '/complete-profile'
  let profile = null
  for (let attempt = 0; attempt < 4; attempt++) {
    profile = (await getProfile(user.id)).data
    if (profile) break
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return profile?.profile_setup_complete ? '/' : '/complete-profile'
}

function Login({ required = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const isNative = Capacitor.isNativePlatform()

  async function handleGoogleSignIn() {
    triggerHaptic(HapticStyle.MEDIUM)
    setLoading(true)
    setError(null)

    try {
      if (isNative) {
        await ensureSocialLoginInitialized()
        const { SocialLogin } = await import('@capgo/capacitor-social-login')
        const result = await SocialLogin.login({
          provider: 'google',
          options: {
            scopes: ['email', 'profile'],
          },
        })

        const idToken = result?.result?.idToken || result?.idToken
        if (!idToken) {
          throw new Error('Google did not return a sign-in token. Try again, and confirm the Web client ID in Supabase matches this app.')
        }
        const { data, error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        })
        if (authError) throw authError
        navigate(await destinationAfterSignIn(data?.user))
      } else {
        // Web: redirect to Google OAuth
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: { prompt: 'select_account' },
          },
        })
        if (authError) throw authError
      }
    } catch (err) {
      socialLoginInitialized = false
      if (!cancelledSignIn(err)) setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  async function handleAppleSignIn() {
    triggerHaptic(HapticStyle.MEDIUM)
    setLoading(true)
    setError(null)

    try {
      if (isNative) {
        await ensureSocialLoginInitialized()
        const { SocialLogin } = await import('@capgo/capacitor-social-login')
        const result = await SocialLogin.login({
          provider: 'apple',
          options: {
            scopes: ['email', 'name'],
          },
        })

        const idToken = result?.result?.idToken
        if (!idToken) {
          throw new Error('Apple did not return a sign-in token. Try again.')
        }
        const { data, error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: idToken,
        })
        if (authError) throw authError
        navigate(await destinationAfterSignIn(data?.user))
      } else {
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (authError) throw authError
      }
    } catch (err) {
      socialLoginInitialized = false
      if (!cancelledSignIn(err)) setError(err.message || 'Failed to sign in with Apple')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {!required && <BackButton label="Back" to="/" />}

        {/* Logo + wordmark */}
        <div className="text-center my-8">
          <div
            className="mb-4 inline-flex"
            style={{
              color: 'var(--gold-accent)',
              filter: 'drop-shadow(0 0 24px var(--gold-glow)) drop-shadow(0 4px 8px var(--accent-glow))',
            }}
          >
            <CrossMark size={64} />
          </div>
          <h1 className="brand-wordmark text-2xl mb-2">
            Bible in Context
          </h1>
          <div className="themed-divider my-3" style={{ width: '40%' }} />
          <p className="text-[var(--text-secondary)] text-sm italic" style={{ fontFamily: 'var(--font-body)' }}>
            Sign in with Google or Apple.
          </p>
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        {/* OAuth buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="themed-btn w-full flex items-center justify-center gap-3 py-3.5 px-4 text-sm disabled:opacity-50"
            style={{ background: '#ffffff', color: '#1f1f1f', border: '1px solid #d6d6d6' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={loading}
            className="themed-btn w-full flex items-center justify-center gap-3 py-3.5 px-4 text-sm disabled:opacity-50"
            style={{ background: '#0a0a0a', color: '#ffffff', border: '1px solid #2a2a2a' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center mt-6">
          <Link to="/privacy" className="underline">Privacy Policy</Link>
          <span className="mx-2">·</span>
          <Link to="/support" className="underline">Support</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
