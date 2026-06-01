import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import RouteErrorBoundary from './components/RouteErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import Layout from './components/Layout'
import UpdateAvailableModal, { wasDismissed } from './components/UpdateAvailableModal'
import { checkForUpdate } from './lib/versionCheck'

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
import Lexicon from './pages/Lexicon'

function UpdatePrompt() {
  const [update, setUpdate] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const result = await checkForUpdate()
      if (cancelled) return
      if (result?.available && !wasDismissed(result.storeVersion)) {
        setUpdate(result)
      }
    }

    run()

    const sub = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) run()
    })

    return () => {
      cancelled = true
      sub?.then?.((s) => s.remove?.())
    }
  }, [])

  if (!update) return null
  return (
    <UpdateAvailableModal
      storeVersion={update.storeVersion}
      releaseNotes={update.releaseNotes}
      url={update.url}
      onClose={() => setUpdate(null)}
    />
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <UpdatePrompt />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Auth + standalone routes (no layout) */}
              <Route path="/login" element={<RouteErrorBoundary><Login /></RouteErrorBoundary>} />
              <Route path="/auth/callback" element={<RouteErrorBoundary><AuthCallback /></RouteErrorBoundary>} />
              <Route path="/complete-profile" element={<RouteErrorBoundary><CompleteProfile /></RouteErrorBoundary>} />
              <Route path="/privacy" element={<RouteErrorBoundary><Privacy /></RouteErrorBoundary>} />
              <Route path="/support" element={<RouteErrorBoundary><Support /></RouteErrorBoundary>} />

              {/* Main app routes (with layout) — all accessible without auth */}
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
                <Route path="u/:username" element={<RouteErrorBoundary><PublicProfile /></RouteErrorBoundary>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
