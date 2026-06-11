// Reader font size — persisted index into VERSE_FONT_SIZES, applied as a
// CSS variable so .verse-text scales everywhere (ChapterView, VerseContext).
export const VERSE_FONT_SIZES = ['0.9em', '1.05em', '1.2em', '1.35em', '1.5em']
export const DEFAULT_FONT_SIZE_INDEX = 1

export function clampFontSizeIndex(idx) {
  return Math.min(Math.max(Number.isInteger(idx) ? idx : DEFAULT_FONT_SIZE_INDEX, 0), VERSE_FONT_SIZES.length - 1)
}

export function applyVerseFontSize(idx) {
  const clamped = clampFontSizeIndex(idx)
  document.documentElement.style.setProperty('--verse-font-size', VERSE_FONT_SIZES[clamped])
}

export function getSavedFontSizeIndex() {
  try {
    return clampFontSizeIndex(JSON.parse(localStorage.getItem('bic_font_size')))
  } catch {
    return DEFAULT_FONT_SIZE_INDEX
  }
}
