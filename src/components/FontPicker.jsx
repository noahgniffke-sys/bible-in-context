import { useEffect, useRef, useState } from 'react'
import { FONTS, applyFont, getSavedFontId } from '../lib/fonts'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

export default function FontPicker({ className = '' }) {
  const [fontId, setFontId] = useState(getSavedFontId)
  const rowRef = useRef(null)
  const current = FONTS.find((item) => item.id === fontId) || FONTS[0]

  useEffect(() => {
    const row = rowRef.current
    const selected = row?.querySelector('[aria-checked="true"]')
    if (!row || !selected) return
    const left = selected.offsetLeft - (row.clientWidth - selected.offsetWidth) / 2
    row.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [fontId])

  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl px-4 pt-4 pb-3 ${className}`}>
      <p className="font-medium text-[var(--text-primary)]">Reading font</p>
      <div
        ref={rowRef}
        role="radiogroup"
        aria-label="Reading font"
        className="mt-3 flex items-center gap-3 overflow-x-auto snap-x snap-mandatory py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FONTS.map((item) => {
          const selected = item.id === fontId
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={item.name}
              onClick={() => {
                setFontId(applyFont(item.id))
                triggerHaptic(HapticStyle.LIGHT)
              }}
              className={`snap-center shrink-0 rounded-full border active:scale-95 ${
                selected
                  ? 'border-[var(--gold-accent)] bg-[var(--bg-surface)]'
                  : 'border-[var(--border-primary)] bg-[var(--bg-surface)]'
              }`}
              style={{ fontFamily: item.family }}
            >
              <span className="grid h-11 w-11 place-items-center text-[22px] leading-none text-[var(--text-primary)]">
                {item.sample}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-center text-sm font-medium text-[var(--text-primary)]" style={{ fontFamily: current.family }}>
        {current.name}
      </p>
      <p className="text-center text-[10px] tracking-wide text-[var(--text-muted)]">{current.detail}</p>
    </div>
  )
}
