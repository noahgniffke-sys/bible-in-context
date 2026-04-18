import { triggerHaptic, HapticStyle } from '../lib/haptics'

function TabBar({ tabs, activeTab, onChange, variant = 'underline' }) {
  function handleChange(key) {
    triggerHaptic(HapticStyle.LIGHT)
    onChange(key)
  }

  if (variant === 'pill') {
    return (
      <div className="flex gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleChange(key)}
            className={`px-3 py-1.5 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 mb-4 border-b border-[var(--border-primary)]">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleChange(key)}
          className={`pb-3 px-2 min-h-[44px] font-medium transition-colors ${
            activeTab === key
              ? 'text-[var(--accent-secondary)] border-b-2 border-[var(--accent-secondary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default TabBar
