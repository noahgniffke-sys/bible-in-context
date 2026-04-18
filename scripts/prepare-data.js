#!/usr/bin/env node

/**
 * Bible Data Preparation Script
 * Downloads and processes public domain Bible reference data:
 * - Treasury of Scripture Knowledge (cross-references)
 * - Strong's Concordance (Greek/Hebrew lexicons)
 * - Matthew Henry's Concise Commentary
 *
 * Usage: node scripts/prepare-data.js
 *
 * Data sources are all public domain.
 * Output goes to src/data/ split by book for lazy loading.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../src/data')

const BOOK_IDS = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA',
  '1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO',
  'ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO',
  'OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
  'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH',
  'PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS',
  '1PE','2PE','1JN','2JN','3JN','JUD','REV'
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function fetchJSON(url) {
  console.log(`  Fetching: ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

// ─── TSK Cross-References ───────────────────────────────────────

async function prepareTSK() {
  console.log('\n📖 Preparing Treasury of Scripture Knowledge...')
  const tskDir = path.join(DATA_DIR, 'tsk')
  ensureDir(tskDir)

  // Try fetching from a known public domain TSK JSON source
  // If unavailable, create empty placeholder files
  try {
    // Example source — replace with actual available TSK JSON repo
    const data = await fetchJSON(
      'https://raw.githubusercontent.com/nicholaskwan/tsk-json/main/tsk.json'
    )

    // Split by book
    const byBook = {}
    for (const [ref, crossRefs] of Object.entries(data)) {
      const bookId = ref.split('.')[0]
      if (!byBook[bookId]) byBook[bookId] = {}
      byBook[bookId][ref] = crossRefs
    }

    for (const [bookId, refs] of Object.entries(byBook)) {
      const filePath = path.join(tskDir, `${bookId.toLowerCase()}.json`)
      fs.writeFileSync(filePath, JSON.stringify(refs, null, 2))
      console.log(`  ✓ ${bookId}: ${Object.keys(refs).length} verses`)
    }
  } catch (err) {
    console.log(`  ⚠ Could not fetch TSK data: ${err.message}`)
    console.log('  Creating empty placeholder files...')
    for (const id of BOOK_IDS) {
      const filePath = path.join(tskDir, `${id.toLowerCase()}.json`)
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}')
      }
    }
  }
}

// ─── Strong's Concordance ───────────────────────────────────────

async function prepareStrongs() {
  console.log('\n🔤 Preparing Strong\'s Concordance...')
  const strongsDir = path.join(DATA_DIR, 'strongs')
  const mappingsDir = path.join(strongsDir, 'mappings')
  ensureDir(strongsDir)
  ensureDir(mappingsDir)

  // Strong's lexicons
  try {
    console.log('  Fetching Greek lexicon...')
    const greek = await fetchJSON(
      'https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.json'
    )
    fs.writeFileSync(
      path.join(strongsDir, 'lexicon-greek.json'),
      JSON.stringify(greek, null, 2)
    )
    console.log(`  ✓ Greek: ${Object.keys(greek).length} entries`)
  } catch (err) {
    console.log(`  ⚠ Could not fetch Greek lexicon: ${err.message}`)
  }

  try {
    console.log('  Fetching Hebrew lexicon...')
    const hebrew = await fetchJSON(
      'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.json'
    )
    fs.writeFileSync(
      path.join(strongsDir, 'lexicon-hebrew.json'),
      JSON.stringify(hebrew, null, 2)
    )
    console.log(`  ✓ Hebrew: ${Object.keys(hebrew).length} entries`)
  } catch (err) {
    console.log(`  ⚠ Could not fetch Hebrew lexicon: ${err.message}`)
  }

  // Create empty mapping placeholders for books without data
  for (const id of BOOK_IDS) {
    const filePath = path.join(mappingsDir, `${id.toLowerCase()}.json`)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}')
    }
  }
}

// ─── Commentary ─────────────────────────────────────────────────

async function prepareCommentary() {
  console.log('\n📝 Preparing Matthew Henry\'s Commentary...')
  const commentaryDir = path.join(DATA_DIR, 'commentary')
  ensureDir(commentaryDir)

  // Create empty placeholder files for books without data
  for (const id of BOOK_IDS) {
    const filePath = path.join(commentaryDir, `${id.toLowerCase()}.json`)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}')
    }
  }

  console.log('  ✓ Placeholder files created for all books')
  console.log('  ℹ Add commentary data manually or from public domain sources')
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('Bible in Context — Data Preparation')
  console.log('====================================')

  ensureDir(DATA_DIR)

  await prepareTSK()
  await prepareStrongs()
  await prepareCommentary()

  console.log('\n✅ Data preparation complete!')
  console.log(`   Files written to: ${DATA_DIR}`)
  console.log('\nNote: Some data sources may require manual setup.')
  console.log('See the README for instructions on populating full datasets.')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
