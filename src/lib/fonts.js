// Ten reading fonts. Files live in public/fonts and are SIL Open Font Licensed.
// The choice is stored in localStorage bic_font and restored before paint.

export const FONTS = [
  { id: 'source-serif', name: 'Source Serif', detail: 'Book serif', family: "'Source Serif 4', Georgia, serif", sample: 'Aa' },
  { id: 'literata', name: 'Literata', detail: 'Long reading', family: "'Literata', Georgia, serif", sample: 'Aa' },
  { id: 'lora', name: 'Lora', detail: 'Clear serif', family: "'Lora', Georgia, serif", sample: 'Aa' },
  { id: 'merriweather', name: 'Merriweather', detail: 'Screen serif', family: "'Merriweather', Georgia, serif", sample: 'Aa' },
  { id: 'newsreader', name: 'Newsreader', detail: 'News text', family: "'Newsreader', Georgia, serif", sample: 'Aa' },
  { id: 'libre-baskerville', name: 'Libre Baskerville', detail: 'Small text', family: "'Libre Baskerville', Georgia, serif", sample: 'Aa' },
  { id: 'atkinson', name: 'Atkinson', detail: 'High clarity', family: "'Atkinson Hyperlegible', system-ui, sans-serif", sample: 'Aa' },
  { id: 'lexend', name: 'Lexend', detail: 'Easy reading', family: "'Lexend', system-ui, sans-serif", sample: 'Aa' },
  { id: 'andika', name: 'Andika', detail: 'Simple letters', family: "'Andika', system-ui, sans-serif", sample: 'Aa' },
  { id: 'source-sans', name: 'Source Sans', detail: 'Clean sans', family: "'Source Sans 3', system-ui, sans-serif", sample: 'Aa' },
]

export const FONT_IDS = new Set(FONTS.map((item) => item.id))
export const DEFAULT_FONT_ID = 'source-serif'

export function getSavedFontId() {
  try {
    const saved = localStorage.getItem('bic_font')
    if (FONT_IDS.has(saved)) return saved
  } catch {
    // Private mode can block storage.
  }
  return DEFAULT_FONT_ID
}

export function applyFont(id) {
  const next = FONT_IDS.has(id) ? id : DEFAULT_FONT_ID
  document.documentElement.setAttribute('data-font', next)
  try { localStorage.setItem('bic_font', next) } catch { /* ignore */ }
  return next
}
