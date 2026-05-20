// Builds YLT per-book JSON files from the scrollmapper YLT dataset.
// Usage: node scripts/build-ylt.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUT_DIR = join(__dirname, '..', 'src', 'data', 'bible', 'ylt')

// Map scrollmapper book names → app book IDs (matches src/lib/bible-books.js)
const NAME_TO_ID = {
  Genesis: 'GEN', Exodus: 'EXO', Leviticus: 'LEV', Numbers: 'NUM', Deuteronomy: 'DEU',
  Joshua: 'JOS', Judges: 'JDG', Ruth: 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
  Ezra: 'EZR', Nehemiah: 'NEH', Esther: 'EST', Job: 'JOB', Psalms: 'PSA', Proverbs: 'PRO',
  Ecclesiastes: 'ECC', 'Song of Solomon': 'SNG', Isaiah: 'ISA', Jeremiah: 'JER',
  Lamentations: 'LAM', Ezekiel: 'EZK', Daniel: 'DAN', Hosea: 'HOS', Joel: 'JOL', Amos: 'AMO',
  Obadiah: 'OBA', Jonah: 'JON', Micah: 'MIC', Nahum: 'NAM', Habakkuk: 'HAB',
  Zephaniah: 'ZEP', Haggai: 'HAG', Zechariah: 'ZEC', Malachi: 'MAL',
  Matthew: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT', Romans: 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', Galatians: 'GAL', Ephesians: 'EPH',
  Philippians: 'PHP', Colossians: 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
  '1 Timothy': '1TI', '2 Timothy': '2TI', Titus: 'TIT', Philemon: 'PHM', Hebrews: 'HEB',
  James: 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN',
  '3 John': '3JN', Jude: 'JUD', Revelation: 'REV', 'Revelation of John': 'REV',
}

function normalizeBookName(name) {
  return name
    .replace(/^III\s/, '3 ')
    .replace(/^II\s/, '2 ')
    .replace(/^I\s/, '1 ')
}

const src = JSON.parse(readFileSync('/tmp/ylt-full.json', 'utf-8'))

mkdirSync(OUT_DIR, { recursive: true })

let totalVerses = 0
let booksWritten = 0
const unmapped = []

for (const book of src.books) {
  const id = NAME_TO_ID[normalizeBookName(book.name)]
  if (!id) {
    unmapped.push(book.name)
    continue
  }
  const out = {}
  for (const ch of book.chapters) {
    const chapter = String(ch.chapter)
    out[chapter] = {}
    for (const v of ch.verses) {
      // Strip italic-supplied-word markers (<FI>...<Fi>) — keep the inner words.
      const cleaned = v.text.replace(/<\/?Fi?>/gi, '').replace(/\s+/g, ' ').trim()
      out[chapter][String(v.verse)] = cleaned
      totalVerses++
    }
  }
  const filename = id.toLowerCase() + '.json'
  writeFileSync(join(OUT_DIR, filename), JSON.stringify(out))
  booksWritten++
}

console.log(`Wrote ${booksWritten} books, ${totalVerses} verses to ${OUT_DIR}`)
if (unmapped.length) console.error('Unmapped books:', unmapped)
