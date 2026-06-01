import { useState, useRef } from 'react'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

// Swipe-to-delete with clear progress feedback.
// - At rest: card sits flat; a small chevron + "Swipe" hint pokes out the right edge
// - While dragging: red panel grows behind the card, showing 🗑️ Delete
// - Past threshold (60% of width): red goes solid, label becomes "Release to delete", haptic ticks
// - Release past threshold: card flies off and deletes
// - Release before threshold: snaps back
function SwipeToDelete({ children, onDelete, className = '' }) {
  const [dragX, setDragX] = useState(0)
  const [width, setWidth] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const dragXRef = useRef(0)
  const containerRef = useRef(null)
  const armedRef = useRef(false)
  const [armed, setArmed] = useState(false)

  const threshold = -width * 0.6

  function onTouchStart(e) {
    setWidth(containerRef.current?.offsetWidth || 0)
    startXRef.current = e.touches[0].clientX
    dragXRef.current = 0
    armedRef.current = false
    setArmed(false)
    setDragging(true)
  }

  function onTouchMove(e) {
    if (!dragging) return
    let delta = e.touches[0].clientX - startXRef.current
    if (delta > 0) delta = 0
    if (delta < -width) delta = -width
    dragXRef.current = delta
    setDragX(delta)
    const nowArmed = delta < threshold
    if (nowArmed !== armedRef.current) {
      armedRef.current = nowArmed
      setArmed(nowArmed)
      triggerHaptic(HapticStyle.LIGHT) // tick when crossing the line, either direction
    }
  }

  function onTouchEnd() {
    if (!dragging) return
    setDragging(false)
    if (armedRef.current) {
      triggerHaptic(HapticStyle.ERROR)
      setDragX(-width)
      setTimeout(() => onDelete(), 200)
    } else {
      setDragX(0)
    }
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Red panel behind the card. Hidden at rest so it doesn't bleed through
          translucent highlight backgrounds. Reveals only while the card is moving. */}
      {dragX < 0 && (
        <div
          className="absolute inset-0 flex items-center justify-end pr-4 rounded-xl"
          style={{
            backgroundColor: armed ? '#dc2626' : '#7f1d1d',
            transition: dragging ? 'background-color 100ms linear' : 'background-color 200ms ease-out',
          }}
        >
          <div className="flex items-center gap-1.5 text-white">
            <span style={{ fontSize: 14 }}>🗑️</span>
            <span className="text-xs font-semibold uppercase tracking-wider">
              {armed ? 'Release to delete' : 'Swipe to delete'}
            </span>
          </div>
        </div>
      )}

      {/* Faint at-rest chevron hint on the right edge of the card itself */}
      {/* Sliding card */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {children}
        {/* Tiny chevron hint at rest — barely visible, fades out the moment they start dragging */}
        <span
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 right-2 text-[var(--text-muted)] pointer-events-none select-none"
          style={{
            fontSize: 18,
            opacity: dragging || dragX !== 0 ? 0 : 0.35,
            transition: 'opacity 150ms ease-out',
          }}
        >
          ‹
        </span>
      </div>
    </div>
  )
}

export default SwipeToDelete
