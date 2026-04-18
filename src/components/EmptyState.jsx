import { Link } from 'react-router-dom'

function EmptyState({ emoji, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="text-center py-12">
      {emoji && <div className="text-6xl mb-4">{emoji}</div>}
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-[var(--text-secondary)] text-sm mb-4">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-block px-6 py-3 bg-[var(--accent-secondary)] text-white font-bold rounded-lg active:scale-95"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-[var(--accent-secondary)] text-white font-bold rounded-lg active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
