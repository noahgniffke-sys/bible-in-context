import { Link } from 'react-router-dom'

function EmptyState({ emoji, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="text-center py-12">
      {emoji && <div className="text-6xl mb-4">{emoji}</div>}
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
