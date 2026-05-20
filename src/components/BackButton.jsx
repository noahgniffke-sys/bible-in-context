import { useNavigate } from 'react-router-dom'

// Smart back button: prefer browser history (the page the user just came from)
// over an explicit `to` target. `to` is now a deep-link fallback used only when
// there's no history within the current React Router session (e.g., user
// loaded the page directly from a URL or share link).
function BackButton({ label, to, fallback = '/' }) {
  const navigate = useNavigate()

  function handleClick() {
    // React Router stores its own idx on history.state. idx > 0 means we have
    // app-internal history we can pop. Otherwise we're at the entry point.
    const idx = window.history.state?.idx ?? 0
    if (idx > 0) {
      navigate(-1)
    } else if (to) {
      navigate(to)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[44px] active:scale-95"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label && <span className="text-sm">{label}</span>}
    </button>
  )
}

export default BackButton
