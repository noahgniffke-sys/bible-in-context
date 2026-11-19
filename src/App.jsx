import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import RouteErrorBoundary from './components/RouteErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import Layout from './components/Layout'
import UpdateAvailableModal, { wasDismissed } from './components/UpdateAvailableModal'
import { checkForUpdate } from './lib/versionCheck'
import { hasStoredSession } from './lib/supabase'
import { ensureDailyVerseNotification } from './lib/daily-verse-notification'
import { applyVerseFontSize, getSavedFontSizeIndex } from './lib/fontSize'

const RELEASE = '1.4.4'
const SEEN_RELEASE_KEY = 'bic_seen_release'

// Apply the saved reader font size before first paint
applyVerseFontSize(getSavedFontSizeIndex())

// Pages
import Home from './pages/Home'
import BibleIndex from './pages/BibleIndex'
import ChapterView from './pages/ChapterView'
import VerseContext from './pages/VerseContext'
import Search from './pages/Search'
import Notes from './pages/Notes'
import PrayerJournal from './pages/PrayerJournal'
import Profile from './pages/Profile'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import CompleteProfile from './pages/CompleteProfile'
import Privacy from './pages/Privacy'
import Support from './pages/Support'
import Plans from './pages/Plans'
import PlanDetail from './pages/PlanDetail'
import BuiltInPlan from './pages/BuiltInPlan'
import CreatePlan from './pages/CreatePlan'
import Feed from './pages/Feed'
import PublicProfile from './pages/PublicProfile'
import FollowList from './pages/FollowList'
import Lexicon from './pages/Lexicon'

function ReleaseNote({ onClose }) {
  return (
    <div className="fixed inset-0 z-[99996] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--gold-accent)] font-semibold mb-2">What's new</p>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Bible in Context {RELEASE}</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-2 mb-5 leading-relaxed">
          <li>Six color themes, including Nathan. Swipe the color wheel on Home or Profile.</li>
          <li>Ten reading fonts. The one you pick is still there the next time you open the app.</li>
          <li>A passage can show how it is written, including why lines start with and.</li>
          <li>Tap a Greek or Hebrew word for the longer note from Thayer or Brown-Driver-Briggs.</li>
        </ul>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold bg-[var(--gold-accent)] text-[var(--on-gold)] active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function UpdatePrompt() {
  const [update, setUpdate] = useState(null)
  const [showRelease, setShowRelease] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const result = await checkForUpdate()
      if (cancelled) return
      if (result?.available && !wasDismissed(result.storeVersion)) {
        setUpdate(result)
        setShowRelease(false)
        return
      }
      setUpdate(null)
      try {
        setShowRelease(localStorage.getItem(SEEN_RELEASE_KEY) !== RELEASE)
      } catch {
        setShowRelease(false)
      }
    }

    run()
    ensureDailyVerseNotification().catch(() => {})

    const sub = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        run()
        ensureDailyVerseNotification().catch(() => {})
      }
    })

    return () => {
      cancelled = true
      sub?.then?.((s) => s.remove?.())
    }
  }, [])

  function dismissRelease() {
    try { localStorage.setItem(SEEN_RELEASE_KEY, RELEASE) } catch {}
    setShowRelease(false)
  }

  if (update) {
    return (
      <UpdateAvailableModal
        storeVersion={update.storeVersion}
        releaseNotes={update.releaseNotes}
        url={update.url}
        onClose={() => setUpdate(null)}
      />
    )
  }
  if (!showRelease) return null
  return <ReleaseNote onClose={dismissRelease} />
}

function NotificationRouter() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined
    let handle
    let cancelled = false
    import('@capacitor/local-notifications').then(async ({ LocalNotifications }) => {
      handle = await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
        const extra = event?.notification?.extra
        if (!extra?.bookId) return
        navigate(`/bible/${extra.bookId}/${extra.chapter}/${extra.verse}`)
      })
      if (cancelled) handle.remove()
    }).catch(() => {})
    return () => {
      cancelled = true
      handle?.remove?.()
    }
  }, [navigate])

  return null
}

function AuthGate() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  const finishingSignIn = pathname === '/auth/callback'
  const readingPolicy = pathname === '/privacy' || pathname === '/support'
  // A saved session opens the app immediately. The sign-in screen is only for
  // someone with no session, including after they sign out.
  const signedIn = Boolean(user) || (loading && hasStoredSession())

  if (!signedIn && !finishingSignIn && !readingPolicy) return <Login required />

  return (
    <>
      {user && <UpdatePrompt />}
      <ScrollToTop />
      <NotificationRouter />
      <Routes>
              {/* Auth + standalone routes (no layout) */}
              <Route path="/login" element={<RouteErrorBoundary><Login /></RouteErrorBoundary>} />
              <Route path="/auth/callback" element={<RouteErrorBoundary><AuthCallback /></RouteErrorBoundary>} />
              <Route path="/complete-profile" element={<RouteErrorBoundary><CompleteProfile /></RouteErrorBoundary>} />
              <Route path="/privacy" element={<RouteErrorBoundary><Privacy /></RouteErrorBoundary>} />
              <Route path="/support" element={<RouteErrorBoundary><Support /></RouteErrorBoundary>} />

              {/* Main app routes. The sign-in gate sits in front of these. */}
              <Route path="/" element={<Layout />}>
                <Route index element={<RouteErrorBoundary><Home /></RouteErrorBoundary>} />
                <Route path="bible" element={<RouteErrorBoundary><BibleIndex /></RouteErrorBoundary>} />
                <Route path="bible/:bookId/:chapter" element={<RouteErrorBoundary><ChapterView /></RouteErrorBoundary>} />
                <Route path="bible/:bookId/:chapter/:verse" element={<RouteErrorBoundary><VerseContext /></RouteErrorBoundary>} />
                <Route path="search" element={<RouteErrorBoundary><Search /></RouteErrorBoundary>} />
                <Route path="lexicon" element={<RouteErrorBoundary><Lexicon /></RouteErrorBoundary>} />
                <Route path="lexicon/:strongs" element={<RouteErrorBoundary><Lexicon /></RouteErrorBoundary>} />
                <Route path="notes" element={<RouteErrorBoundary><Notes /></RouteErrorBoundary>} />
                <Route path="prayers" element={<RouteErrorBoundary><PrayerJournal /></RouteErrorBoundary>} />
                <Route path="plans" element={<RouteErrorBoundary><Plans /></RouteErrorBoundary>} />
                <Route path="plans/create" element={<RouteErrorBoundary><CreatePlan /></RouteErrorBoundary>} />
                <Route path="plans/built/:slug" element={<RouteErrorBoundary><BuiltInPlan /></RouteErrorBoundary>} />
                <Route path="plans/:planId" element={<RouteErrorBoundary><PlanDetail /></RouteErrorBoundary>} />
                <Route path="feed" element={<RouteErrorBoundary><Feed /></RouteErrorBoundary>} />
                <Route path="profile" element={<RouteErrorBoundary><Profile /></RouteErrorBoundary>} />
                <Route path="u/:username/followers" element={<RouteErrorBoundary><FollowList /></RouteErrorBoundary>} />
                <Route path="u/:username/following" element={<RouteErrorBoundary><FollowList /></RouteErrorBoundary>} />
                <Route path="u/:username" element={<RouteErrorBoundary><PublicProfile /></RouteErrorBoundary>} />
              </Route>
            </Routes>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AuthGate />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
