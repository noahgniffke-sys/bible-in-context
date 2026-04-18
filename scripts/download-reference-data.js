#!/usr/bin/env node

/**
 * Downloads complete Bible reference data:
 * 1. Cross-references (OpenBible.info via scrollmapper — 344,800 entries)
 * 2. Strong's interlinear data (jburson/bible-data — 32,429 verses)
 * 3. Strong's dictionary (jburson/bible-data — 9,980 definitions)
 * 4. Commentary (HelloAO API — John Gill, all 66 books)
 *
 * All sources are public domain or CC-licensed.
 * Usage: node scripts/download-reference-data.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../src/data')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// TSV book abbreviations -> our 3-letter IDs
const BOOK_ABBR_MAP = {
  'Gen': 'GEN', 'Exod': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deut': 'DEU',
  'Josh': 'JOS', 'Judg': 'JDG', 'Ruth': 'RUT', '1Sam': '1SA', '2Sam': '2SA',
  '1Kgs': '1KI', '2Kgs': '2KI', '1Chr': '1CH', '2Chr': '2CH', 'Ezra': 'EZR',
  'Neh': 'NEH', 'Esth': 'EST', 'Job': 'JOB', 'Ps': 'PSA', 'Prov': 'PRO',
  'Eccl': 'ECC', 'Song': 'SNG', 'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM',
  'Ezek': 'EZK', 'Dan': 'DAN', 'Hos': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO',
  'Obad': 'OBA', 'Jonah': 'JON', 'Mic': 'MIC', 'Nah': 'NAM', 'Hab': 'HAB',
  'Zeph': 'ZEP', 'Hag': 'HAG', 'Zech': 'ZEC', 'Mal': 'MAL',
  'Matt': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
  'Rom': 'ROM', '1Cor': '1CO', '2Cor': '2CO', 'Gal': 'GAL', 'Eph': 'EPH',
  'Phil': 'PHP', 'Col': 'COL', '1Thess': '1TH', '2Thess': '2TH',
  '1Tim': '1TI', '2Tim': '2TI', 'Titus': 'TIT', 'Phlm': 'PHM', 'Heb': 'HEB',
  'Jas': 'JAS', '1Pet': '1PE', '2Pet': '2PE', '1John': '1JN', '2John': '2JN',
  '3John': '3JN', 'Jude': 'JUD', 'Rev': 'REV',
}

// Interlinear ref book names -> our IDs
const INTERLINEAR_BOOK_MAP = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
  'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
  '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
  '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR', 'Nehemiah': 'NEH',
  'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Psalm': 'PSA', 'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA', 'Jeremiah': 'JER',
  'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS',
  'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC',
  'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
  'Zechariah': 'ZEC', 'Malachi': 'MAL', 'Matthew': 'MAT', 'Mark': 'MRK',
  'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
  'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
  '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI',
  '2 Timothy': '2TI', 'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB',
  'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN',
  '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV',
}

const ALL_BOOK_IDS = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA',
  '1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO',
  'ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO',
  'OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
  'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH',
  'PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS',
  '1PE','2PE','1JN','2JN','3JN','JUD','REV'
]

const CHAPTER_COUNTS = {
  GEN:50,EXO:40,LEV:27,NUM:36,DEU:34,JOS:24,JDG:21,RUT:4,'1SA':31,'2SA':24,
  '1KI':22,'2KI':25,'1CH':29,'2CH':36,EZR:10,NEH:13,EST:10,JOB:42,PSA:150,PRO:31,
  ECC:12,SNG:8,ISA:66,JER:52,LAM:5,EZK:48,DAN:12,HOS:14,JOL:3,AMO:9,OBA:1,JON:4,
  MIC:7,NAM:3,HAB:3,ZEP:3,HAG:2,ZEC:14,MAL:4,MAT:28,MRK:16,LUK:24,JHN:21,ACT:28,
  ROM:16,'1CO':16,'2CO':13,GAL:6,EPH:6,PHP:4,COL:4,'1TH':5,'2TH':3,'1TI':6,'2TI':4,
  TIT:3,PHM:1,HEB:13,JAS:5,'1PE':5,'2PE':3,'1JN':5,'2JN':1,'3JN':1,JUD:1,REV:22
}

function convertTsvRef(ref) {
  // Convert "Gen.1.1" or "Prov.8.22" to "GEN.1.1" or "PRO.8.22"
  const parts = ref.split('.')
  if (parts.length < 3) return null
  const bookAbbr = parts[0]
  const bookId = BOOK_ABBR_MAP[bookAbbr]
  if (!bookId) return null
  return `${bookId}.${parts[1]}.${parts[2]}`
}

// ─── 1. Cross-References ────────────────────────────────────────

async function downloadCrossRefs() {
  console.log('\n✝️  Downloading cross-references (OpenBible.info)...')
  const tskDir = path.join(DATA_DIR, 'tsk')
  ensureDir(tskDir)

  const url = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/sources/extras/cross_references.txt'
  console.log(`  Fetching TSV: ${url}`)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()

  const lines = text.trim().split('\n')
  console.log(`  Parsing ${lines.length} lines...`)

  // Build per-book cross-reference maps
  const byBook = {}

  for (const line of lines) {
    if (line.startsWith('From Verse')) continue // header
    const parts = line.split('\t')
    if (parts.length < 2) continue

    const fromRaw = parts[0].trim()
    const toRaw = parts[1].trim()

    const fromRef = convertTsvRef(fromRaw)
    if (!fromRef) continue

    const bookId = fromRef.split('.')[0]
    if (!byBook[bookId]) byBook[bookId] = {}

    // Parse the "to" reference (may be a range like "Prov.8.22-Prov.8.30")
    const toRef = convertTsvRef(toRaw.split('-')[0])
    if (!toRef) continue

    if (!byBook[bookId][fromRef]) byBook[bookId][fromRef] = []
    // Avoid duplicates
    if (!byBook[bookId][fromRef].includes(toRef)) {
      byBook[bookId][fromRef].push(toRef)
    }
  }

  // Write per-book files
  let totalRefs = 0
  for (const bookId of ALL_BOOK_IDS) {
    const data = byBook[bookId] || {}
    const filePath = path.join(tskDir, `${bookId.toLowerCase()}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data))
    const refCount = Object.values(data).reduce((sum, refs) => sum + refs.length, 0)
    totalRefs += refCount
    if (refCount > 0) {
      console.log(`  ✓ ${bookId}: ${Object.keys(data).length} verses, ${refCount} cross-refs`)
    }
  }

  console.log(`  Total: ${totalRefs} cross-references across ${Object.keys(byBook).length} books`)
}

// ─── 2. Strong's Data ───────────────────────────────────────────

async function downloadStrongs() {
  console.log('\n🔤 Downloading Strong\'s concordance data...')
  const strongsDir = path.join(DATA_DIR, 'strongs')
  const mappingsDir = path.join(strongsDir, 'mappings')
  ensureDir(strongsDir)
  ensureDir(mappingsDir)

  // 2a. Download Strong's dictionary
  console.log('  Fetching Strong\'s dictionary...')
  const dictUrl = 'https://raw.githubusercontent.com/jburson/bible-data/master/data/interlinear/strongs.json'
  const dictRes = await fetch(dictUrl)
  if (!dictRes.ok) throw new Error(`HTTP ${dictRes.status} for dictionary`)
  const rawDict = await dictRes.json()

  // Convert to our format: { "H7225": { word, transliteration, ... } }
  const greekLex = {}
  const hebrewLex = {}

  for (const [key, val] of Object.entries(rawDict)) {
    const num = key.toUpperCase()
    const entry = {
      word: val.w || '',
      transliteration: val.t || '',
      pronunciation: val.p || '',
      partOfSpeech: val.s || '',
      definition: val.d || '',
    }
    if (num.startsWith('G')) greekLex[num] = entry
    else if (num.startsWith('H')) hebrewLex[num] = entry
  }

  fs.writeFileSync(path.join(strongsDir, 'lexicon-greek.json'), JSON.stringify(greekLex))
  fs.writeFileSync(path.join(strongsDir, 'lexicon-hebrew.json'), JSON.stringify(hebrewLex))
  console.log(`  ✓ Greek lexicon: ${Object.keys(greekLex).length} entries`)
  console.log(`  ✓ Hebrew lexicon: ${Object.keys(hebrewLex).length} entries`)

  // 2b. Download interlinear verse mappings
  console.log('  Fetching interlinear data (this is ~60 MB, may take a moment)...')
  const intUrl = 'https://raw.githubusercontent.com/jburson/bible-data/master/data/kjv/kjv-interlinear.json'
  const intRes = await fetch(intUrl)
  if (!intRes.ok) throw new Error(`HTTP ${intRes.status} for interlinear`)
  const interlinear = await intRes.json()

  console.log(`  Parsing ${interlinear.length} verse entries...`)

  // Build per-book mapping files
  const byBook = {}

  for (const entry of interlinear) {
    // ref format: "kjv:Genesis:1:1"
    const refParts = entry.r.split(':')
    if (refParts.length < 4) continue

    const bookName = refParts[1]
    const chapter = refParts[2]
    const verse = refParts[3]
    const bookId = INTERLINEAR_BOOK_MAP[bookName]
    if (!bookId) continue

    const verseRef = `${bookId}.${chapter}.${verse}`

    if (!byBook[bookId]) byBook[bookId] = {}

    // Extract Strong's numbers and words
    const words = (entry.d || [])
      .filter(d => d.s)
      .map(d => {
        const textParts = (d.t || '').split('|')
        return {
          strongs: d.s.toUpperCase(),
          word: textParts[1] || textParts[0] || '',
        }
      })

    if (words.length > 0) {
      byBook[bookId][verseRef] = words
    }
  }

  // Write per-book files
  let totalVerses = 0
  for (const bookId of ALL_BOOK_IDS) {
    const data = byBook[bookId] || {}
    const filePath = path.join(mappingsDir, `${bookId.toLowerCase()}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data))
    totalVerses += Object.keys(data).length
  }

  console.log(`  ✓ Strong's mappings: ${totalVerses} verses across ${Object.keys(byBook).length} books`)
}

// ─── 3. Commentary ──────────────────────────────────────────────

async function downloadCommentary() {
  console.log('\n📝 Downloading commentary (John Gill — 28,300 entries)...')
  const commentaryDir = path.join(DATA_DIR, 'commentary')
  ensureDir(commentaryDir)

  const commentator = 'john-gill'
  let totalVerses = 0
  let failedChapters = 0

  for (const bookId of ALL_BOOK_IDS) {
    const chapters = CHAPTER_COUNTS[bookId]
    if (!chapters) continue

    const bookData = {}
    let bookVerses = 0

    for (let ch = 1; ch <= chapters; ch++) {
      try {
        const url = `https://bible.helloao.org/api/c/${commentator}/${bookId}/${ch}.json`
        const res = await fetch(url)
        if (!res.ok) {
          failedChapters++
          continue
        }
        const data = await res.json()

        // Extract verse-level commentary
        const content = data.chapter?.content || []
        for (const item of content) {
          if (item.type === 'verse' && item.number && item.content) {
            const text = item.content
              .filter(c => typeof c === 'string')
              .join(' ')
              .replace(/<[^>]*>/g, '')  // strip HTML tags
              .replace(/\s+/g, ' ')
              .trim()

            if (text) {
              const verseRef = `${bookId}.${ch}.${item.number}`
              bookData[verseRef] = text
              bookVerses++
            }
          }
        }

        // Small delay between API calls
        await new Promise(r => setTimeout(r, 30))
      } catch {
        failedChapters++
      }
    }

    const filePath = path.join(commentaryDir, `${bookId.toLowerCase()}.json`)
    fs.writeFileSync(filePath, JSON.stringify(bookData))
    totalVerses += bookVerses

    if (bookVerses > 0) {
      console.log(`  ✓ ${bookId}: ${bookVerses} verse commentaries`)
    }
  }

  console.log(`  Total: ${totalVerses} verse commentaries (${failedChapters} chapters unavailable)`)
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('Bible in Context — Reference Data Download')
  console.log('==========================================')

  await downloadCrossRefs()
  await downloadStrongs()
  await downloadCommentary()

  // Calculate total size
  let totalSize = 0
  function addDirSize(dir) {
    if (!fs.existsSync(dir)) return
    const files = fs.readdirSync(dir)
    for (const f of files) {
      const fp = path.join(dir, f)
      const stat = fs.statSync(fp)
      if (stat.isFile()) totalSize += stat.size
      else if (stat.isDirectory()) addDirSize(fp)
    }
  }
  addDirSize(path.join(DATA_DIR, 'tsk'))
  addDirSize(path.join(DATA_DIR, 'strongs'))
  addDirSize(path.join(DATA_DIR, 'commentary'))

  console.log(`\n✅ All reference data downloaded!`)
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
