// Bible text — fully bundled, no API needed
// KJV, WEB, ASV — all public domain
// Data loaded per-book via dynamic import for fast initial load

const bookCache = {}

const COPYRIGHT = {
  KJV: 'King James Version — Public Domain',
  WEB: 'World English Bible — Public Domain',
  ASV: 'American Standard Version — Public Domain',
}

const TRANSLATION_NAMES = {
  KJV: 'King James Version',
  WEB: 'World English Bible',
  ASV: 'American Standard Version',
}

export const AVAILABLE_TRANSLATIONS = ['WEB', 'KJV', 'ASV']

async function loadBook(bookId, translation) {
  const key = `${translation}_${bookId}`
  if (bookCache[key]) return bookCache[key]

  const id = bookId.toLowerCase()
  try {
    let module
    if (translation === 'WEB') {
      module = await import(`../data/bible/web/${id}.json`)
    } else if (translation === 'ASV') {
      module = await import(`../data/bible/asv/${id}.json`)
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

// Search Bible text — handles exact phrases, individual words, and misspellings
export async function searchBible(query, translation = 'WEB', limit = 30) {
  if (!query?.trim()) return { verses: [], total: 0 }

  const { BIBLE_BOOKS } = await import('./bible-books.js')
  const lower = query.toLowerCase().trim()
  const queryWords = lower.split(/\s+/).filter(w => w.length > 1) // skip single letters
  const results = []

  // Load all books in parallel for speed
  const allBooks = await Promise.all(
    BIBLE_BOOKS.map(async (book) => ({
      book,
      data: await loadBook(book.id, translation),
    }))
  )

  for (const { book, data } of allBooks) {
    for (const [ch, verses] of Object.entries(data)) {
      for (const [vs, text] of Object.entries(verses)) {
        const textLower = text.toLowerCase()
        let score = 0

        // 1. Exact phrase match (highest priority)
        if (textLower.includes(lower)) {
          score = 3
        }
        // 2. All words present in verse (any order)
        else if (queryWords.length > 1 && queryWords.every(w => textLower.includes(w))) {
          score = 2
        }
        // 3. Most words present (partial match)
        else if (queryWords.length > 1) {
          const matches = queryWords.filter(w => textLower.includes(w))
          if (matches.length >= Math.ceil(queryWords.length * 0.6)) {
            score = 1 + (matches.length / queryWords.length)
          }
        }
        // 4. Single word — check for word-start match or fuzzy
        else if (queryWords.length === 1) {
          const qw = queryWords[0]
          const textWords = textLower.split(/\s+/)
          if (textWords.some(tw => tw.startsWith(qw))) {
            score = 1.5
          } else if (qw.length >= 4) {
            // Fuzzy — allow 1 char error for words 4+ chars
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
          results.push({
            ref: `${book.id}.${ch}.${vs}`,
            text,
            reference: `${book.name} ${ch}:${vs}`,
            bookId: book.id,
            chapterId: `${book.id}.${ch}`,
            score,
          })
        }
      }
    }
  }

  // Sort by match quality then by Bible order
  results.sort((a, b) => b.score - a.score)

  return { verses: results.slice(0, limit), total: results.length }
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
