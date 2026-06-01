#!/usr/bin/env node

/**
 * Builds the Berean Standard Bible (BSB) into per-book JSON files.
 *
 * The BSB has been dedicated to the public domain by bereanbibles.com —
 * free to copy, quote, and bundle with no license, royalty, or permission.
 *
 * Source: scrollmapper/bible_databases (same trusted repo used for KJV).
 *   Structure: { translation, books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
 *   Books are in canonical order, so we map by index onto BIBLE_BOOKS ids.
 *
 * Output: src/data/bible/bsb/{book}.json
 *   Each file: { "1": { "1": "verse text", "2": "verse text" }, "2": { ... } }
 *
 * The 16 critical-text verses BSB omits (Matthew 17:21, Acts 8:37, etc.) are
 * empty in the source; we skip them, leaving an intentional numbering gap —
 * exactly how the BSB is published.
 *
 * Usage: node scripts/build-bsb.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_DIR = path.resolve(__dirname, '../src/data/bible/bsb')
const SOURCE_URL =
  'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/BSB.json'

// Canonical 66-book order — must match src/lib/bible-books.js (BIBLE_BOOKS) exactly.
const BOOK_IDS = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH',
  'EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS',
  'JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
  'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH',
  '1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function main() {
  console.log('\n📖 Building Berean Standard Bible (BSB)...')
  ensureDir(OUT_DIR)

  console.log(`  Fetching: ${SOURCE_URL}`)
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const books = data.books || []

  if (books.length !== 66) throw new Error(`Expected 66 books, got ${books.length}`)

  let totalVerses = 0
  let skipped = 0

  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    const id = BOOK_IDS[i].toLowerCase()
    const out = {}

    for (const ch of book.chapters) {
      const chapKey = String(ch.chapter)
      const verses = {}
      for (const v of ch.verses) {
        const text = (v.text || '').trim()
        if (!text) { skipped++; continue } // omitted critical-text verse
        verses[String(v.verse)] = text
        totalVerses++
      }
      if (Object.keys(verses).length > 0) out[chapKey] = verses
    }

    fs.writeFileSync(path.join(OUT_DIR, `${id}.json`), JSON.stringify(out))
  }

  console.log(`  ✓ Wrote 66 books, ${totalVerses} verses (${skipped} omitted critical-text verses skipped)`)
  console.log(`  Output: ${OUT_DIR}`)
}

main().catch((err) => {
  console.error('✗ Failed:', err.message)
  process.exit(1)
})
