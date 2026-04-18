function ErrorBanner({ message, className = '' }) {
  if (!message) return null
  return (
    <div className={`bg-[var(--accent-error)]/10 border border-[var(--accent-error)]/50 rounded-lg p-3 ${className}`}>
      <p className="text-[var(--accent-error)] text-sm">{message}</p>
    </div>
  )
}

export default ErrorBanner
