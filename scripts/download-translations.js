#!/usr/bin/env node

/**
 * Downloads additional public-domain Bible translations and saves them as
 * per-book JSON files, matching the format used by download-bibles.js.
 *
 * Source: scrollmapper/bible_databases (same repo as the bundled KJV).
 * Structure: { books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
 *
 * Translations (all public domain, 66-book Protestant canon):
 *   DBY  — Darby Translation (1889)
 *   AKJV — American King James Version (KJV with modernized spelling)
 *   NHEB — New Heart English Bible (standard edition)
 *   GNV  — Geneva Bible (1599)
 *
 * (BBE was evaluated and rejected: it renders Isaiah 7:14 as "young woman"
 *  rather than "virgin", failing the KJV-alignment bar for this app.)
 *
 * Output: src/data/bible/{dby,akjv,nheb,gnv}/{book}.json
 * Each file: { "1": { "1": "verse text", "2": "verse text" }, "2": { ... } }
 *
 * Usage: node scripts/download-translations.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TRANSLATIONS = [
  {
    code: 'DBY', dir: 'dby', file: 'Darby.json', name: 'Darby Translation',
    // The source stripped Darby's *God* (Elohim) marker, leaving "theGod",
    // "ofGod", etc. Only "God"/"Godhead" are affected — verified across all
    // 31k verses — so reinserting the space is safe.
    fixText: (t) => t.replace(/([a-z])(God(?:head)?\b)/g, '$1 $2'),
  },
  { code: 'AKJV', dir: 'akjv', file: 'AKJV.json', name: 'American King James Version' },
  { code: 'NHEB', dir: 'nheb', file: 'NHEB.json', name: 'New Heart English Bible' },
  { code: 'GNV', dir: 'gnv', file: 'Geneva1599.json', name: 'Geneva Bible 1599' },
]

// Canonical 66-book order with the names scrollmapper uses.
const BOOKS = [
  { id: 'GEN', name: 'Genesis' }, { id: 'EXO', name: 'Exodus' }, { id: 'LEV', name: 'Leviticus' },
  { id: 'NUM', name: 'Numbers' }, { id: 'DEU', name: 'Deuteronomy' }, { id: 'JOS', name: 'Joshua' },
  { id: 'JDG', name: 'Judges' }, { id: 'RUT', name: 'Ruth' }, { id: '1SA', name: '1 Samuel' },
  { id: '2SA', name: '2 Samuel' }, { id: '1KI', name: '1 Kings' }, { id: '2KI', name: '2 Kings' },
  { id: '1CH', name: '1 Chronicles' }, { id: '2CH', name: '2 Chronicles' }, { id: 'EZR', name: 'Ezra' },
  { id: 'NEH', name: 'Nehemiah' }, { id: 'EST', name: 'Esther' }, { id: 'JOB', name: 'Job' },
  { id: 'PSA', name: 'Psalms' }, { id: 'PRO', name: 'Proverbs' }, { id: 'ECC', name: 'Ecclesiastes' },
  { id: 'SNG', name: 'Song of Solomon' }, { id: 'ISA', name: 'Isaiah' }, { id: 'JER', name: 'Jeremiah' },
  { id: 'LAM', name: 'Lamentations' }, { id: 'EZK', name: 'Ezekiel' }, { id: 'DAN', name: 'Daniel' },
  { id: 'HOS', name: 'Hosea' }, { id: 'JOL', name: 'Joel' }, { id: 'AMO', name: 'Amos' },
  { id: 'OBA', name: 'Obadiah' }, { id: 'JON', name: 'Jonah' }, { id: 'MIC', name: 'Micah' },
  { id: 'NAM', name: 'Nahum' }, { id: 'HAB', name: 'Habakkuk' }, { id: 'ZEP', name: 'Zephaniah' },
  { id: 'HAG', name: 'Haggai' }, { id: 'ZEC', name: 'Zechariah' }, { id: 'MAL', name: 'Malachi' },
  { id: 'MAT', name: 'Matthew' }, { id: 'MRK', name: 'Mark' }, { id: 'LUK', name: 'Luke' },
  { id: 'JHN', name: 'John' }, { id: 'ACT', name: 'Acts' }, { id: 'ROM', name: 'Romans' },
  { id: '1CO', name: '1 Corinthians' }, { id: '2CO', name: '2 Corinthians' }, { id: 'GAL', name: 'Galatians' },
  { id: 'EPH', name: 'Ephesians' }, { id: 'PHP', name: 'Philippians' }, { id: 'COL', name: 'Colossians' },
  { id: '1TH', name: '1 Thessalonians' }, { id: '2TH', name: '2 Thessalonians' }, { id: '1TI', name: '1 Timothy' },
  { id: '2TI', name: '2 Timothy' }, { id: 'TIT', name: 'Titus' }, { id: 'PHM', name: 'Philemon' },
  { id: 'HEB', name: 'Hebrews' }, { id: 'JAS', name: 'James' }, { id: '1PE', name: '1 Peter' },
  { id: '2PE', name: '2 Peter' }, { id: '1JN', name: '1 John' }, { id: '2JN', name: '2 John' },
  { id: '3JN', name: '3 John' }, { id: 'JUD', name: 'Jude' }, { id: 'REV', name: 'Revelation' },
]

// Name variants that differ between sources.
const NAME_ALIASES = {
  'song of songs': 'song of solomon',
  'canticles': 'song of solomon',
  'revelation of john': 'revelation',
  'the revelation': 'revelation',
}

function normalizeName(name) {
  let n = String(name || '').trim().toLowerCase()
  // Roman-numeral book prefixes ("I Samuel", "III John") → arabic ("1 samuel")
  n = n.replace(/^(iii|ii|i)\s+/, (m, r) => `${{ i: 1, ii: 2, iii: 3 }[r]} `)
  return NAME_ALIASES[n] || n
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function downloadTranslation({ code, dir, file, name, fixText }) {
  console.log(`\n📖 Downloading ${code} (${name})...`)
  const outDir = path.resolve(__dirname, `../src/data/bible/${dir}`)
  ensureDir(outDir)

  const url = `https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/${file}`
  console.log(`  Fetching: ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const data = await res.json()

  const sourceBooks = data.books || []
  console.log(`  Source has ${sourceBooks.length} books`)

  // Match by normalized name (robust against extra/missing books), not index.
  const byName = new Map()
  for (const b of sourceBooks) byName.set(normalizeName(b.name), b)

  let written = 0
  const missing = []
  for (const bookDef of BOOKS) {
    const sourceBook = byName.get(normalizeName(bookDef.name))
    if (!sourceBook) {
      missing.push(bookDef.id)
      continue
    }

    const bookData = {}
    for (const chapter of (sourceBook.chapters || [])) {
      const chNum = String(chapter.chapter)
      bookData[chNum] = {}
      for (const verse of (chapter.verses || [])) {
        let text = String(verse.text || '').trim()
        if (fixText) text = fixText(text)
        if (text) bookData[chNum][String(verse.verse)] = text
      }
    }

    fs.writeFileSync(path.join(outDir, `${bookDef.id.toLowerCase()}.json`), JSON.stringify(bookData))
    written++
  }

  console.log(`  ✓ Wrote ${written}/66 books`)
  if (missing.length) console.warn(`  ⚠ MISSING books: ${missing.join(', ')}`)
  return { code, written, missing }
}

async function main() {
  const results = []
  for (const t of TRANSLATIONS) {
    results.push(await downloadTranslation(t))
  }

  console.log('\n──────── Summary ────────')
  let ok = true
  for (const r of results) {
    const status = r.written === 66 ? '✓' : '✗'
    if (r.written !== 66) ok = false
    console.log(`${status} ${r.code}: ${r.written}/66 books${r.missing.length ? ` (missing: ${r.missing.join(', ')})` : ''}`)
  }
  if (!ok) process.exitCode = 1
}

main().catch((err) => {
  console.error('Download failed:', err)
  process.exitCode = 1
})
