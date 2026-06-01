// Bible text — fully bundled, no API needed
// BSB, KJV, WEB, ASV, YLT — all public domain
// Data loaded per-book via dynamic import for fast initial load

const bookCache = {}
let lemmaIndexCache = null
let strongsToVersesCache = null

const COPYRIGHT = {
  BSB: 'Berean Standard Bible — Public Domain',
  KJV: 'King James Version — Public Domain',
  WEB: 'World English Bible — Public Domain',
  ASV: 'American Standard Version — Public Domain',
  YLT: "Young's Literal Translation (1898) — Public Domain",
}

const TRANSLATION_NAMES = {
  BSB: 'Berean Standard Bible',
  KJV: 'King James Version',
  WEB: 'World English Bible',
  ASV: 'American Standard Version',
  YLT: "Young's Literal Translation",
}

// One-line descriptors shown in the translation picker to help users choose.
const TRANSLATION_DESC = {
  BSB: 'Modern & accurate · Recommended',
  WEB: 'Modern, readable',
  KJV: 'Classic, 1611',
  ASV: 'Formal, 1901',
  YLT: 'Ultra-literal, 1898',
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
export async function getChapter(bookId, chapter, translation = 'WEB') {
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
export async function getVerse(bookId, chapter, verse, translation = 'WEB') {
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

// Search Bible text — handles exact phrases, individual words, misspellings,
// AND Greek/Hebrew lemmas (so "fornication" finds G4202 verses on WEB).
export async function searchBible(query, translation = 'WEB', limit = 30) {
  if (!query?.trim()) return { verses: [], total: 0 }

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
      data: await loadBook(book.id, translation),
    }))
  )

  const bookNameById = Object.fromEntries(BIBLE_BOOKS.map(b => [b.id, b.name]))
  const bookDataById = Object.fromEntries(allBooks.map(b => [b.book.id, b.data]))

  // --- PASS 1: English-text scan in the current translation ---
  for (const { book, data } of allBooks) {
    for (const [ch, verses] of Object.entries(data)) {
      for (const [vs, text] of Object.entries(verses)) {
        const textLower = text.toLowerCase()
        let score = 0

        if (textLower.includes(lower)) {
          score = 3
        } else if (queryWords.length > 1 && queryWords.every(w => textLower.includes(w))) {
          score = 2
        } else if (queryWords.length > 1) {
          const matches = queryWords.filter(w => textLower.includes(w))
          if (matches.length >= Math.ceil(queryWords.length * 0.6)) {
            score = 1 + (matches.length / queryWords.length)
          }
        } else if (queryWords.length === 1) {
          const qw = queryWords[0]
          const textWords = textLower.split(/\s+/)
          if (textWords.some(tw => tw.startsWith(qw))) {
            score = 1.5
          } else if (qw.length >= 4) {
            const hasFuzzy = textWords.some(tw => {
              if (Math.abs(tw.length - qw.length) > 2) return false
              let diff = 0
              for (let i = 0; i < Math.min(tw.length, qw.length); i++) {
                if (tw[i] !== qw[i]) diff++
                if (diff > 1) return false
              }
              return diff + Math.abs(tw.length - qw.length) <= 1
            })
            if (hasFuzzy) score = 0.5
          }
        }

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

// Get/set translation preference
export function getTranslation() {
  return localStorage.getItem('bic_translation') || 'WEB'
}

export function setTranslation(translation) {
  localStorage.setItem('bic_translation', translation)
}

export function getTranslationName(code) {
  return TRANSLATION_NAMES[code] || code
}

export function getTranslationDescription(code) {
  return TRANSLATION_DESC[code] || ''
}
