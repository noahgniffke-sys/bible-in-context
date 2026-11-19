// Bible text — fully bundled, no API needed.
// The picker offers the five strongest public-domain texts.
// BSB is the default: modern English, accurate, easy to read.
// NIV, NLT, and ESV are copyrighted and are not bundled.
// Data loaded per-book via dynamic import for fast initial load

import { parseReadingQuery, getBookById } from './bible-books.js'

const DEFAULT_TRANSLATION = 'BSB'

const bookCache = {}
let lemmaIndexCache = null
let strongsToVersesCache = null

const COPYRIGHT = {
  BSB: 'Berean Standard Bible — Public Domain',
  KJV: 'King James Version — Public Domain',
  WEB: 'World English Bible — Public Domain',
  ASV: 'American Standard Version — Public Domain',
  YLT: "Young's Literal Translation (1898) — Public Domain",
  AKJV: 'American King James Version — Public Domain',
  NHEB: 'New Heart English Bible — Public Domain',
  DBY: 'Darby Translation (1889) — Public Domain',
  GNV: 'Geneva Bible (1599) — Public Domain',
}

const TRANSLATION_NAMES = {
  BSB: 'Berean Standard Bible',
  KJV: 'King James Version',
  WEB: 'World English Bible',
  ASV: 'American Standard Version',
  YLT: "Young's Literal Translation",
  AKJV: 'American King James Version',
  NHEB: 'New Heart English Bible',
  DBY: 'Darby Translation',
  GNV: 'Geneva Bible',
}

// One-line descriptors shown in the translation picker to help users choose.
const TRANSLATION_DESC = {
  BSB: 'Modern & accurate · Recommended',
  WEB: 'Modern, readable',
  KJV: 'Classic, 1611',
  ASV: 'Formal, 1901',
  YLT: 'Ultra-literal, 1898',
  AKJV: 'KJV in modern spelling',
  NHEB: 'Modern, readable',
  DBY: 'Literal, 1889',
  GNV: 'Reformation classic, 1599',
}

export const AVAILABLE_TRANSLATIONS = ['BSB', 'WEB', 'KJV', 'ASV', 'YLT']

async function loadBook(bookId, translation) {
  const key = `${translation}_${bookId}`
  if (bookCache[key]) return bookCache[key]

  const id = bookId.toLowerCase()
  try {
    let module
    if (translation === 'BSB') {
      module = await import(`../data/bible/bsb/${id}.json`)
    } else if (translation === 'WEB') {
      module = await import(`../data/bible/web/${id}.json`)
    } else if (translation === 'ASV') {
      module = await import(`../data/bible/asv/${id}.json`)
    } else if (translation === 'YLT') {
      module = await import(`../data/bible/ylt/${id}.json`)
    } else if (translation === 'AKJV') {
      module = await import(`../data/bible/akjv/${id}.json`)
    } else if (translation === 'NHEB') {
      module = await import(`../data/bible/nheb/${id}.json`)
    } else if (translation === 'DBY') {
      module = await import(`../data/bible/dby/${id}.json`)
    } else if (translation === 'GNV') {
      module = await import(`../data/bible/gnv/${id}.json`)
    } else {
      module = await import(`../data/bible/kjv/${id}.json`)
    }
    bookCache[key] = module.default || module
    return bookCache[key]
  } catch {
    return {}
  }
}

// Fetch a chapter's verses as an array of { number, text, ref }
export async function getChapter(bookId, chapter, translation = DEFAULT_TRANSLATION) {
  const bookData = await loadBook(bookId, translation)
  const chapterData = bookData[String(chapter)]
  if (!chapterData) {
    return { id: `${bookId}.${chapter}`, bookId, chapter, translation, verses: [], verseCount: 0, copyright: '' }
  }

  const verses = Object.entries(chapterData)
    .map(([verseNum, text]) => ({
      number: parseInt(verseNum),
      text,
      ref: `${bookId}.${chapter}.${verseNum}`,
    }))
    .sort((a, b) => a.number - b.number)

  return {
    id: `${bookId}.${chapter}`,
    bookId,
    chapter,
    translation,
    verses,
    verseCount: verses.length,
    copyright: COPYRIGHT[translation] || '',
  }
}

// Fetch a single verse
export async function getVerse(bookId, chapter, verse, translation = DEFAULT_TRANSLATION) {
  const bookData = await loadBook(bookId, translation)
  const text = bookData?.[String(chapter)]?.[String(verse)]
  if (!text) return null

  return {
    number: verse,
    text,
    ref: `${bookId}.${chapter}.${verse}`,
  }
}

// Normalize diacritics so accented transliterations (porneía) match ASCII queries (porneia).
function deaccent(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Same stemmer used at index-build time so lookups hit stemmed keys.
function stemForLookup(word) {
  return word.replace(/(eth|est|ing|edly|edst|ed|es|s)$/, '')
}

async function loadLemmaIndex() {
  if (!lemmaIndexCache) {
    const m = await import('../data/search/lemma-to-strongs.json')
    lemmaIndexCache = m.default || m
  }
  return lemmaIndexCache
}

async function loadStrongsToVerses() {
  if (!strongsToVersesCache) {
    const m = await import('../data/search/strongs-to-verses.json')
    strongsToVersesCache = m.default || m
  }
  return strongsToVersesCache
}

export async function getVersesForStrongs(strongsNumber) {
  if (!strongsNumber) return []
  const s2v = await loadStrongsToVerses()
  return s2v[strongsNumber.toUpperCase()] || []
}

async function collectStrongsForQuery(queryWords) {
  const lemma = await loadLemmaIndex()
  const matched = new Map() // strongs → query-word hit count
  for (const token of queryWords) {
    const norm = deaccent(token).replace(/[^a-z]/g, '')
    if (norm.length < 3) continue
    const fromExact = lemma[norm]
    const fromStem = lemma[stemForLookup(norm)]
    const seenForThisWord = new Set()
    for (const list of [fromExact, fromStem]) {
      if (!list) continue
      for (const s of list) {
        if (seenForThisWord.has(s)) continue
        seenForThisWord.add(s)
        matched.set(s, (matched.get(s) || 0) + 1)
      }
    }
  }
  return matched
}

function verseWords(text) {
  return text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean)
}

function boundedEdit(a, b) {
  if (a === b) return 0
  const la = a.length
  const lb = b.length
  if (Math.abs(la - lb) > 2) return 3
  let prev = Array.from({ length: lb + 1 }, (_, i) => i)
  for (let i = 1; i <= la; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      cur[j] = v
      if (v < rowMin) rowMin = v
    }
    if (rowMin > 2) return 3
    prev = cur
  }
  return prev[lb]
}

function wordDistance(queryWord, textWord) {
  const qw = queryWord.replace(/'/g, '')
  const tw = textWord.replace(/'/g, '')
  if (!qw || !tw) return 9
  if (qw === tw) return 0
  if (tw.startsWith(qw) && qw.length >= 3) return 0
  if (qw.length < 4) return 9
  const limit = qw.length >= 8 ? 2 : 1
  const d = boundedEdit(qw, tw)
  return d <= limit ? d : 9
}

// How much of a typed sentence shows up in a verse, allowing typos,
// skipped words, and a few words in the wrong place.
function coverageScore(queryWords, text) {
  const textWords = verseWords(text)
  if (!queryWords.length || !textWords.length) return 0
  let cursor = 0
  let matched = 0
  let exact = 0
  for (const qw of queryWords) {
    let foundAt = -1
    let best = 9
    const windowEnd = Math.min(textWords.length, cursor + 10)
    for (let j = cursor; j < windowEnd; j++) {
      const d = wordDistance(qw, textWords[j])
      if (d < best) {
        best = d
        foundAt = j
      }
      if (d === 0) break
    }
    if (foundAt < 0) {
      for (let j = 0; j < textWords.length; j++) {
        const d = wordDistance(qw, textWords[j])
        if (d < best) {
          best = d
          foundAt = j
        }
        if (d === 0) break
      }
    }
    if (foundAt >= 0 && best < 9) {
      matched++
      if (best === 0) exact++
      cursor = foundAt + 1
    }
  }
  const ratio = matched / queryWords.length
  const need = queryWords.length >= 6 ? 0.55 : queryWords.length >= 3 ? 0.7 : 1
  if (ratio < need) return 0
  return 1.2 + ratio + (exact / queryWords.length) * 0.6
}

function scoreVerseText(text, lower, queryWords) {
  const textLower = text.toLowerCase()
  if (textLower.includes(lower)) return 4
  if (queryWords.length > 1 && queryWords.every(w => textLower.includes(w))) return 3
  if (queryWords.length > 1) {
    const hits = queryWords.filter(w => textLower.includes(w)).length
    if (hits >= Math.ceil(queryWords.length * 0.6)) {
      return 1.4 + hits / queryWords.length
    }
    return coverageScore(queryWords, text)
  }
  if (queryWords.length === 1) {
    const qw = queryWords[0]
    const textWords = verseWords(textLower)
    if (textWords.some(tw => tw.startsWith(qw))) return 1.5
    if (qw.length >= 4 && textWords.some(tw => wordDistance(qw, tw) < 9)) return 0.8
  }
  return 0
}

async function referenceResults(parsed, translation) {
  const book = getBookById(parsed.bookId)
  if (!book || !parsed.chapter) return []
  const data = await getChapter(parsed.bookId, parsed.chapter, translation)
  let rows = data.verses
  if (parsed.verse) {
    const end = parsed.verseEnd || parsed.verse
    rows = rows.filter(v => v.number >= parsed.verse && v.number <= end)
  } else {
    rows = rows.slice(0, 20)
  }
  return rows.map(v => ({
    ref: v.ref,
    text: v.text,
    reference: `${book.name} ${parsed.chapter}:${v.number}`,
    bookId: parsed.bookId,
    chapterId: `${parsed.bookId}.${parsed.chapter}`,
    score: parsed.verse ? 10 : 6,
    matchedVia: 'reference',
  }))
}

// Search Bible text — references, whole verses, typos, missing words,
// and Greek/Hebrew lemmas.
export async function searchBible(query, translation = DEFAULT_TRANSLATION, limit = 30) {
  if (!query?.trim()) return { verses: [], total: 0 }

  const activeTranslation = AVAILABLE_TRANSLATIONS.includes(translation) ? translation : DEFAULT_TRANSLATION
  const reference = parseReadingQuery(query)
  if (reference?.chapter) {
    const direct = await referenceResults(reference, activeTranslation)
    if (direct.length) return { verses: direct.slice(0, limit), total: direct.length }
  }

  const { BIBLE_BOOKS } = await import('./bible-books.js')
  const lower = query.toLowerCase().trim()
  const queryWords = lower.split(/\s+/).filter(w => w.length > 1)
  const resultsByRef = new Map()

  function upsert(ref, entry) {
    const existing = resultsByRef.get(ref)
    if (!existing || entry.score > existing.score) {
      resultsByRef.set(ref, entry)
    }
  }

  // Load all books in parallel for speed
  const allBooks = await Promise.all(
    BIBLE_BOOKS.map(async (book) => ({
      book,
      data: await loadBook(book.id, activeTranslation),
    }))
  )

  const bookNameById = Object.fromEntries(BIBLE_BOOKS.map(b => [b.id, b.name]))
  const bookDataById = Object.fromEntries(allBooks.map(b => [b.book.id, b.data]))

  // --- PASS 1: English-text scan in the current translation ---
  for (const { book, data } of allBooks) {
    for (const [ch, verses] of Object.entries(data)) {
      for (const [vs, text] of Object.entries(verses)) {
        const score = scoreVerseText(text, lower, queryWords)

        if (score > 0) {
          const ref = `${book.id}.${ch}.${vs}`
          upsert(ref, {
            ref,
            text,
            reference: `${book.name} ${ch}:${vs}`,
            bookId: book.id,
            chapterId: `${book.id}.${ch}`,
            score,
            matchedVia: 'text',
          })
        }
      }
    }
  }

  // --- PASS 2: Lemma / Strong's lookup ---
  // Maps query tokens (English or Greek/Hebrew transliteration) to Strong's numbers,
  // then pulls every verse where that Strong's appears — regardless of translation.
  try {
    const strongsMatches = await collectStrongsForQuery(queryWords)
    if (strongsMatches.size > 0) {
      const s2v = await loadStrongsToVerses()
      // Rank verses by how many distinct query words their Strong's numbers covered.
      const verseScore = new Map() // ref → { wordHits, strongsNums[] }
      for (const [strongs, hitCount] of strongsMatches) {
        const verses = s2v[strongs] || []
        for (const ref of verses) {
          let rec = verseScore.get(ref)
          if (!rec) { rec = { wordHits: 0, strongsNums: [] }; verseScore.set(ref, rec) }
          rec.wordHits = Math.max(rec.wordHits, hitCount)
          rec.strongsNums.push(strongs)
        }
      }

      for (const [ref, rec] of verseScore) {
        const [bookId, ch, vs] = ref.split('.')
        const text = bookDataById[bookId]?.[ch]?.[vs]
        if (!text) continue
        // Lemma-match score sits between "all words present" (2) and "exact phrase" (3),
        // bumped by how many query words landed on the same verse.
        const score = 2.2 + Math.min(rec.wordHits - 1, 2) * 0.2
        upsert(ref, {
          ref,
          text,
          reference: `${bookNameById[bookId]} ${ch}:${vs}`,
          bookId,
          chapterId: `${bookId}.${ch}`,
          score,
          matchedVia: 'lemma',
          strongsNums: rec.strongsNums,
        })
      }
    }
  } catch (err) {
    // Lemma path is additive — if the index fails to load, fall through to text results.
    console.warn('[searchBible] lemma lookup failed:', err)
  }

  const merged = [...resultsByRef.values()].sort((a, b) => b.score - a.score)
  return { verses: merged.slice(0, limit), total: merged.length }
}

// Get/set translation preference. Unknown or removed codes fall back to BSB.
export function getTranslation() {
  const saved = localStorage.getItem('bic_translation')
  if (saved && AVAILABLE_TRANSLATIONS.includes(saved)) return saved
  return DEFAULT_TRANSLATION
}

export function setTranslation(translation) {
  const next = AVAILABLE_TRANSLATIONS.includes(translation) ? translation : DEFAULT_TRANSLATION
  localStorage.setItem('bic_translation', next)
  window.dispatchEvent(new CustomEvent('bic-translation', { detail: next }))
}

export function getTranslationName(code) {
  return TRANSLATION_NAMES[code] || code
}

export function getTranslationDescription(code) {
  return TRANSLATION_DESC[code] || ''
}
