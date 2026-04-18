#!/usr/bin/env node

/**
 * Downloads complete KJV and WEB Bible text and saves as per-book JSON files.
 * Both translations are public domain — no API key or license needed.
 *
 * Sources:
 *   KJV: scrollmapper/bible_databases (single file, clean structure)
 *   WEB: TehShrike/world-english-bible (per-book files)
 *
 * Output: src/data/bible/kjv/{book}.json and src/data/bible/web/{book}.json
 * Each file: { "1": { "1": "verse text", "2": "verse text" }, "2": { ... } }
 *
 * Usage: node scripts/download-bibles.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const KJV_DIR = path.resolve(__dirname, '../src/data/bible/kjv')
const WEB_DIR = path.resolve(__dirname, '../src/data/bible/web')

// Mapping of book ID to the WEB repo filename (TehShrike/world-english-bible)
const BOOKS = [
  { id: 'GEN', name: 'Genesis', webFile: 'genesis' },
  { id: 'EXO', name: 'Exodus', webFile: 'exodus' },
  { id: 'LEV', name: 'Leviticus', webFile: 'leviticus' },
  { id: 'NUM', name: 'Numbers', webFile: 'numbers' },
  { id: 'DEU', name: 'Deuteronomy', webFile: 'deuteronomy' },
  { id: 'JOS', name: 'Joshua', webFile: 'joshua' },
  { id: 'JDG', name: 'Judges', webFile: 'judges' },
  { id: 'RUT', name: 'Ruth', webFile: 'ruth' },
  { id: '1SA', name: '1 Samuel', webFile: '1samuel' },
  { id: '2SA', name: '2 Samuel', webFile: '2samuel' },
  { id: '1KI', name: '1 Kings', webFile: '1kings' },
  { id: '2KI', name: '2 Kings', webFile: '2kings' },
  { id: '1CH', name: '1 Chronicles', webFile: '1chronicles' },
  { id: '2CH', name: '2 Chronicles', webFile: '2chronicles' },
  { id: 'EZR', name: 'Ezra', webFile: 'ezra' },
  { id: 'NEH', name: 'Nehemiah', webFile: 'nehemiah' },
  { id: 'EST', name: 'Esther', webFile: 'esther' },
  { id: 'JOB', name: 'Job', webFile: 'job' },
  { id: 'PSA', name: 'Psalms', webFile: 'psalms' },
  { id: 'PRO', name: 'Proverbs', webFile: 'proverbs' },
  { id: 'ECC', name: 'Ecclesiastes', webFile: 'ecclesiastes' },
  { id: 'SNG', name: 'Song of Solomon', webFile: 'songofsolomon' },
  { id: 'ISA', name: 'Isaiah', webFile: 'isaiah' },
  { id: 'JER', name: 'Jeremiah', webFile: 'jeremiah' },
  { id: 'LAM', name: 'Lamentations', webFile: 'lamentations' },
  { id: 'EZK', name: 'Ezekiel', webFile: 'ezekiel' },
  { id: 'DAN', name: 'Daniel', webFile: 'daniel' },
  { id: 'HOS', name: 'Hosea', webFile: 'hosea' },
  { id: 'JOL', name: 'Joel', webFile: 'joel' },
  { id: 'AMO', name: 'Amos', webFile: 'amos' },
  { id: 'OBA', name: 'Obadiah', webFile: 'obadiah' },
  { id: 'JON', name: 'Jonah', webFile: 'jonah' },
  { id: 'MIC', name: 'Micah', webFile: 'micah' },
  { id: 'NAM', name: 'Nahum', webFile: 'nahum' },
  { id: 'HAB', name: 'Habakkuk', webFile: 'habakkuk' },
  { id: 'ZEP', name: 'Zephaniah', webFile: 'zephaniah' },
  { id: 'HAG', name: 'Haggai', webFile: 'haggai' },
  { id: 'ZEC', name: 'Zechariah', webFile: 'zechariah' },
  { id: 'MAL', name: 'Malachi', webFile: 'malachi' },
  { id: 'MAT', name: 'Matthew', webFile: 'matthew' },
  { id: 'MRK', name: 'Mark', webFile: 'mark' },
  { id: 'LUK', name: 'Luke', webFile: 'luke' },
  { id: 'JHN', name: 'John', webFile: 'john' },
  { id: 'ACT', name: 'Acts', webFile: 'acts' },
  { id: 'ROM', name: 'Romans', webFile: 'romans' },
  { id: '1CO', name: '1 Corinthians', webFile: '1corinthians' },
  { id: '2CO', name: '2 Corinthians', webFile: '2corinthians' },
  { id: 'GAL', name: 'Galatians', webFile: 'galatians' },
  { id: 'EPH', name: 'Ephesians', webFile: 'ephesians' },
  { id: 'PHP', name: 'Philippians', webFile: 'philippians' },
  { id: 'COL', name: 'Colossians', webFile: 'colossians' },
  { id: '1TH', name: '1 Thessalonians', webFile: '1thessalonians' },
  { id: '2TH', name: '2 Thessalonians', webFile: '2thessalonians' },
  { id: '1TI', name: '1 Timothy', webFile: '1timothy' },
  { id: '2TI', name: '2 Timothy', webFile: '2timothy' },
  { id: 'TIT', name: 'Titus', webFile: 'titus' },
  { id: 'PHM', name: 'Philemon', webFile: 'philemon' },
  { id: 'HEB', name: 'Hebrews', webFile: 'hebrews' },
  { id: 'JAS', name: 'James', webFile: 'james' },
  { id: '1PE', name: '1 Peter', webFile: '1peter' },
  { id: '2PE', name: '2 Peter', webFile: '2peter' },
  { id: '1JN', name: '1 John', webFile: '1john' },
  { id: '2JN', name: '2 John', webFile: '2john' },
  { id: '3JN', name: '3 John', webFile: '3john' },
  { id: 'JUD', name: 'Jude', webFile: 'jude' },
  { id: 'REV', name: 'Revelation', webFile: 'revelation' },
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// ─── KJV ────────────────────────────────────────────────────────
// Source: scrollmapper/bible_databases — single file with all 66 books
// Structure: { books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }

async function downloadKJV() {
  console.log('\n📖 Downloading KJV (King James Version)...')
  ensureDir(KJV_DIR)

  const url = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json'
  console.log(`  Fetching: ${url}`)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()

  const kjvBooks = data.books || []
  console.log(`  Found ${kjvBooks.length} books`)

  for (let i = 0; i < kjvBooks.length; i++) {
    const kjvBook = kjvBooks[i]
    const bookDef = BOOKS[i]
    if (!bookDef) continue

    // Convert to our format: { "1": { "1": "text", ... }, "2": { ... } }
    const bookData = {}
    for (const chapter of (kjvBook.chapters || [])) {
      const chNum = String(chapter.chapter)
      bookData[chNum] = {}
      for (const verse of (chapter.verses || [])) {
        bookData[chNum][String(verse.verse)] = verse.text
      }
    }

    const filePath = path.join(KJV_DIR, `${bookDef.id.toLowerCase()}.json`)
    fs.writeFileSync(filePath, JSON.stringify(bookData))

    const chapterCount = Object.keys(bookData).length
    const verseCount = Object.values(bookData).reduce((sum, ch) => sum + Object.keys(ch).length, 0)
    console.log(`  ✓ ${bookDef.id} (${bookDef.name}): ${chapterCount} chapters, ${verseCount} verses`)
  }
}

// ─── WEB ────────────────────────────────────────────────────────
// Source: TehShrike/world-english-bible — per-book JSON files
// Structure: array of objects with type, chapterNumber, verseNumber, value
// Need to extract "paragraph text" and "line text" entries

async function downloadWEB() {
  console.log('\n📖 Downloading WEB (World English Bible)...')
  ensureDir(WEB_DIR)

  const baseUrl = 'https://raw.githubusercontent.com/TehShrike/world-english-bible/master/json'
  let downloaded = 0
  let failed = 0

  for (const book of BOOKS) {
    const filePath = path.join(WEB_DIR, `${book.id.toLowerCase()}.json`)

    // Skip if already downloaded with content
    if (fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        if (Object.keys(existing).length > 0) {
          downloaded++
          continue
        }
      } catch {}
    }

    try {
      const url = `${baseUrl}/${book.webFile}.json`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const entries = await res.json()

      // Extract verse text from the formatting array
      // Types with text: "paragraph text", "line text"
      const bookData = {}
      for (const entry of entries) {
        if ((entry.type === 'paragraph text' || entry.type === 'line text') && entry.value) {
          const ch = String(entry.chapterNumber)
          const vs = String(entry.verseNumber)
          if (!bookData[ch]) bookData[ch] = {}

          // Some verses span multiple entries (poetry lines) — concatenate them
          if (bookData[ch][vs]) {
            bookData[ch][vs] += ' ' + entry.value
          } else {
            bookData[ch][vs] = entry.value
          }
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(bookData))
      downloaded++

      const chapterCount = Object.keys(bookData).length
      const verseCount = Object.values(bookData).reduce((sum, ch) => sum + Object.keys(ch).length, 0)
      console.log(`  ✓ ${book.id} (${book.name}): ${chapterCount} chapters, ${verseCount} verses`)

      // Small delay to be polite to GitHub
      await new Promise(r => setTimeout(r, 50))
    } catch (err) {
      console.log(`  ✗ ${book.id}: ${err.message}`)
      failed++
      fs.writeFileSync(filePath, '{}')
    }
  }

  console.log(`  WEB: ${downloaded} downloaded, ${failed} failed`)
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('Bible in Context — Bible Text Download')
  console.log('======================================')
  console.log('Downloading KJV and WEB (both public domain)\n')

  await downloadKJV()
  await downloadWEB()

  // Calculate total size
  let totalSize = 0
  for (const dir of [KJV_DIR, WEB_DIR]) {
    const files = fs.readdirSync(dir)
    for (const f of files) {
      totalSize += fs.statSync(path.join(dir, f)).size
    }
  }

  console.log(`\n✅ Download complete!`)
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
