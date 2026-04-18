function ToggleSwitch({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`w-12 h-7 rounded-full transition-all ${
          value ? 'bg-[var(--accent-secondary)]' : 'bg-[var(--bg-surface)]'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-all ${
            value ? 'ml-6' : 'ml-1'
          }`}
        />
      </button>
    </div>
  )
}

export default ToggleSwitch
