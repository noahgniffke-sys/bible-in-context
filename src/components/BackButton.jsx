import { useNavigate } from 'react-router-dom'

function BackButton({ label, to }) {
  const navigate = useNavigate()

  function handleClick() {
    if (to) navigate(to)
    else navigate(-1)
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
