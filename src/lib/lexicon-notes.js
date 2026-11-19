// Longer public-domain lexicon notes, loaded only when a word is opened.
// Thayer's Greek Lexicon (1889) and Brown-Driver-Briggs (1906).

let thayer = null
let bdb = null

const SOURCES = {
  G: {
    source: 'Thayer',
    title: "Thayer's Greek Lexicon",
    attribution: "Joseph Thayer, 1889. Public domain.",
  },
  H: {
    source: 'BDB',
    title: 'Brown-Driver-Briggs',
    attribution: 'Brown, Driver, and Briggs, 1906. Public domain.',
  },
}

async function loadThayer() {
  if (!thayer) {
    const module = await import('../data/lexicon/thayer.json')
    thayer = module.default || module
  }
  return thayer
}

async function loadBdb() {
  if (!bdb) {
    const module = await import('../data/lexicon/bdb.json')
    bdb = module.default || module
  }
  return bdb
}

export function tidyLexiconText(text) {
  if (!text) return ''
  return text
    .replace(/\[(?:Hebrew|Syriac|Aramaic|Greek|Arabic|Chaldee|Latin|Samaritan)\]/g, '')
    .replace(/\b(?:Arabic|Syriac|Ethiopic|Aramaic|Chaldee)\s*,/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function excerptLexicon(text, max = 360) {
  if (!text || text.length <= max) return text || ''
  const cut = text.slice(0, max)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '))
  if (stop > 140) return cut.slice(0, stop + 1)
  return `${cut.trim()}…`
}

export async function getLexiconNote(strongs) {
  const num = String(strongs || '').toUpperCase()
  const kind = num.startsWith('G') ? 'G' : num.startsWith('H') ? 'H' : ''
  if (!kind) return null
  const book = kind === 'G' ? await loadThayer() : await loadBdb()
  const text = tidyLexiconText(book[num])
  if (!text) return null
  return { strongs: num, text, ...SOURCES[kind] }
}
