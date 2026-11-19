import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/bible', label: 'Bible', icon: BookIcon },
  { path: '/search', label: 'Search', icon: SearchIcon },
  { path: '/notes', label: 'Tools', icon: PenIcon },
  { path: '/profile', label: 'Profile', icon: PersonIcon },
]

function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Header — themed wordmark with subtle ornamentation */}
      <header
        className="px-4 py-3 flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, color-mix(in oklab, var(--bg-surface) 92%, var(--accent-primary) 8%) 100%)',
          borderBottom: '1px solid var(--border-primary)',
          boxShadow: '0 1px 0 color-mix(in oklab, var(--gold-accent) 28%, transparent) inset, 0 4px 14px rgba(0,0,0,0.18)',
        }}
      >
        <h1 className="brand-wordmark text-lg">
          Bible in Context
        </h1>
        <svg viewBox="0 0 120 8" className="w-32 h-2 mt-1 opacity-70" fill="none" aria-hidden="true">
          <path d="M0 4 L48 4" stroke="var(--gold-accent)" strokeWidth="0.8" />
          <path d="M72 4 L120 4" stroke="var(--gold-accent)" strokeWidth="0.8" />
          <path d="M60 0 L64 4 L60 8 L56 4 Z" fill="var(--gold-accent)" />
        </svg>
      </header>

      {/* Main content */}
      <main key={location.pathname} className="flex-1 pb-20 page-enter">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border-primary)] flex justify-around items-center px-2 py-2 z-50">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path)

          return (
            <NavLink
              key={path}
              to={path}
              onClick={() => triggerHaptic(HapticStyle.LIGHT)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] min-h-[44px] justify-center"
            >
              <Icon active={isActive} />
              <span className={`text-[10px] font-medium ${
                isActive ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-muted)]'
              }`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'var(--accent-secondary)' : 'none'}
        fillOpacity={active ? 0.2 : 0}
      />
    </svg>
  )
}

function BookIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path
        d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'var(--accent-secondary)' : 'none'}
        fillOpacity={active ? 0.2 : 0}
      />
    </svg>
  )
}

function SearchIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
      />
      <path
        d="M21 21L16.65 16.65"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PenIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path
        d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 2.5C17.8978 2.10217 18.4374 1.87868 19 1.87868C19.5626 1.87868 20.1022 2.10217 20.5 2.5C20.8978 2.89782 21.1213 3.43739 21.1213 4C21.1213 4.56261 20.8978 5.10218 20.5 5.5L12 14L8 15L9 11L17.5 2.5Z"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'var(--accent-secondary)' : 'none'}
        fillOpacity={active ? 0.2 : 0}
      />
    </svg>
  )
}

function PersonIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="7"
        r="4"
        stroke={active ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        strokeWidth="2"
        fill={active ? 'var(--accent-secondary)' : 'none'}
        fillOpacity={active ? 0.2 : 0}
      />
    </svg>
  )
}

export default Layout
