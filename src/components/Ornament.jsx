// Themed ornaments — switch shape based on data-theme attribute via CSS variables.
// Three variants:
//   - <Ornament.Divider /> — horizontal flourish with center symbol
//   - <Ornament.Corner />  — small flourish for card corners
//   - <Ornament.Drop />    — illuminated drop cap accent

function Divider({ width = '60%' }) {
  return <div className="themed-divider" style={{ width }} />
}

function Flourish({ className = '' }) {
  return (
    <svg viewBox="0 0 120 12" className={`block mx-auto ${className}`} fill="none">
      <path
        d="M0 6 L40 6 M50 6 L70 6 M80 6 L120 6"
        stroke="var(--gold-accent)"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <circle cx="45" cy="6" r="1.5" fill="var(--gold-accent)" opacity="0.7" />
      <circle cx="60" cy="6" r="2.5" fill="var(--gold-accent)" opacity="0.85" />
      <circle cx="75" cy="6" r="1.5" fill="var(--gold-accent)" opacity="0.7" />
    </svg>
  )
}

const Ornament = { Divider, Flourish }
export default Ornament
