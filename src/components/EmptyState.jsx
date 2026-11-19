import { Link } from 'react-router-dom'

function Mark({ emoji }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  const paths = {
    '📖': <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" {...common} /><path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20" {...common} /></>,
    '🔍': <><circle cx="11" cy="11" r="6" {...common} /><path d="M20 20l-3.5-3.5" {...common} /></>,
    '📝': <><path d="M5 19.5V6.5A2 2 0 0 1 7 4.5h8l4 4V19.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" {...common} /><path d="M15 4.5v4h4M8 13h8M8 16.5h5" {...common} /></>,
    '🙏': <><path d="M12 20c4-2.5 6-5.2 6-8.2 0-1.6-1-2.8-2.4-2.8-1 0-1.8.5-2.3 1.3L12 12l-1.3-1.7C10.2 9.5 9.4 9 8.4 9 7 9 6 10.2 6 11.8 6 14.8 8 17.5 12 20z" {...common} /></>,
    '✅': <><circle cx="12" cy="12" r="8" {...common} /><path d="M8.5 12.2l2.2 2.2 4.8-5" {...common} /></>,
    '👥': <><path d="M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" {...common} /><path d="M4 19c.4-2.4 2.4-4 5-4s4.6 1.6 5 4M14 15c1.8 0 3.4.9 4 2.5" {...common} /></>,
    '🎨': <><path d="M12 4a8 8 0 1 0 0 16h1.2a2 2 0 0 0 1.6-3.2 1.5 1.5 0 0 1 1.2-2.4H17a3 3 0 0 0 3-3.2A8 8 0 0 0 12 4z" {...common} /><circle cx="8" cy="10" r="0.8" fill="currentColor" /><circle cx="12" cy="8" r="0.8" fill="currentColor" /><circle cx="16" cy="10" r="0.8" fill="currentColor" /></>,
    '🔖': <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1z" {...common} />,
    '📚': <><path d="M5 5.5h6.5v13H6.2A1.7 1.7 0 0 1 5 16.8zM19 5.5h-6.5v13h5.3a1.7 1.7 0 0 0 1.2-1.7z" {...common} /></>,
    '⚠️': <path d="M12 4.5l8 14H4l8-14zM12 10v4M12 16.5h.01" {...common} />,
  }
  const icon = paths[emoji]
  if (!icon) return null
  return (
    <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto text-[var(--gold-accent)]" aria-hidden="true">
      {icon}
    </svg>
  )
}

function EmptyState({ emoji, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="text-center py-12">
      {emoji && <div className="mb-4"><Mark emoji={emoji} /></div>}
      <h3 className="display text-xl text-[var(--text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-[var(--text-secondary)] text-sm mb-4 italic" style={{ fontFamily: 'var(--font-body)' }}>{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="themed-btn-primary inline-block px-6 py-3">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button onClick={onAction} className="themed-btn-primary px-6 py-3">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
