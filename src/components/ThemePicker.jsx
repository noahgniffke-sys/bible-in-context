import { useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { THEMES } from '../lib/themes'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function wheelBackground(colors) {
  const [a, b, c] = colors
  return `conic-gradient(from -30deg, ${a} 0 120deg, ${b} 120deg 240deg, ${c} 240deg 360deg)`
}

export default function ThemePicker({ className = '' }) {
  const { theme, setTheme } = useTheme()
  const rowRef = useRef(null)
  const current = THEMES.find((item) => item.id === theme) || THEMES[0]

  useEffect(() => {
    const row = rowRef.current
    const selected = row?.querySelector('[aria-checked="true"]')
    if (!row || !selected) return
    const left = selected.offsetLeft - (row.clientWidth - selected.offsetWidth) / 2
    row.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [theme])

  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl px-4 pt-4 pb-3 ${className}`}>
      <p className="font-medium text-[var(--text-primary)]">Theme</p>
      <div
        ref={rowRef}
        role="radiogroup"
        aria-label="Theme"
        className="mt-3 flex items-center gap-3 overflow-x-auto snap-x snap-mandatory py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {THEMES.map((item) => {
          const selected = item.id === theme
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={item.name}
              onClick={() => {
                setTheme(item.id)
                triggerHaptic(HapticStyle.LIGHT)
              }}
              className={`snap-center shrink-0 rounded-full p-[3px] transition-transform active:scale-95 ${
                selected ? 'scale-110 bg-[var(--gold-accent)]' : 'bg-[var(--border-primary)]'
              }`}
            >
              <span
                className="relative grid h-11 w-11 place-items-center rounded-full"
                style={{ background: wheelBackground(item.colors) }}
              >
                <span className="h-3.5 w-3.5 rounded-full bg-[var(--bg-card)]" />
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-center text-sm font-medium text-[var(--text-primary)]">{current.name}</p>
      <p className="text-center text-[10px] tracking-wide text-[var(--text-muted)]">{current.detail}</p>
    </div>
  )
}
