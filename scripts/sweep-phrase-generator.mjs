// Sweep every Strong's-mapped verse in all 66 books through generatePhraseByPhrase
// and report coverage gaps. Exits non-zero if any verse fails to produce a row
// with a usable literal meaning.
import { readdir, readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { generatePhraseByPhrase, parseStrongsDefinition } from '../src/lib/strongs.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MAP_DIR = join(ROOT, 'src/data/strongs/mappings')
const GREEK_LEX = join(ROOT, 'src/data/strongs/lexicon-greek.json')
const HEB_LEX   = join(ROOT, 'src/data/strongs/lexicon-hebrew.json')

const NT = new Set(['MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'])

const greek = JSON.parse(await readFile(GREEK_LEX, 'utf8'))
const heb   = JSON.parse(await readFile(HEB_LEX, 'utf8'))

function expand(entries, lex, lang) {
  return entries.map(e => {
    const def = lex[e.strongs] || {}
    return {
      strongs: e.strongs,
      originalWord: def.word || e.word || '',
      englishWord: e.english || '',
      simpleDefinition: '',
      morph: e.morph || '',
      morphDescription: '',
      transliteration: def.transliteration || '',
      pronunciation: def.easyPronunciation || def.pronunciation || '',
      partOfSpeech: def.partOfSpeech || '',
      definition: def.definition || '',
      language: lang,
    }
  })
}

const files = (await readdir(MAP_DIR)).filter(f => f.endsWith('.json')).sort()

let totalVerses = 0, totalRows = 0
let gapBlankLiteral = 0, gapMissingLex = 0, gapBlankOriginal = 0
const strongsMissing = new Set()
const sampleBlankLiterals = []
const perBookStats = []

for (const file of files) {
  const bookId = file.replace('.json', '').toUpperCase()
  const lang = NT.has(bookId) ? 'Greek' : 'Hebrew'
  const lex  = lang === 'Greek' ? greek : heb
  const mapping = JSON.parse(await readFile(join(MAP_DIR, file), 'utf8'))

  let bookVerses = 0, bookBlank = 0
  for (const [verseRef, entries] of Object.entries(mapping)) {
    if (!Array.isArray(entries) || entries.length === 0) continue
    bookVerses++
    totalVerses++

    for (const e of entries) {
      if (!lex[e.strongs]) {
        gapMissingLex++
        strongsMissing.add(e.strongs)
      }
    }

    const words = expand(entries, lex, lang)
    const rows = generatePhraseByPhrase(words, lang)
    totalRows += rows.length

    for (const r of rows) {
      if (!r.literal) {
        gapBlankLiteral++
        bookBlank++
        if (sampleBlankLiterals.length < 12) {
          sampleBlankLiterals.push({
            ref: verseRef, strongs: r.strongs, english: r.english,
            defSnippet: (lex[r.strongs]?.definition || '').slice(0, 140),
          })
        }
      }
      if (!r.original) gapBlankOriginal++
    }
  }
  perBookStats.push({ bookId, verses: bookVerses, blankLiterals: bookBlank, blankRate: bookVerses ? (bookBlank / bookVerses).toFixed(3) : '0' })
}

console.log('=== PHRASE GENERATOR SWEEP REPORT ===')
console.log(`Books: ${files.length}`)
console.log(`Verses processed: ${totalVerses}`)
console.log(`Phrase rows produced: ${totalRows}`)
console.log(`Phrase rows with blank literal: ${gapBlankLiteral} (${((gapBlankLiteral/totalRows)*100).toFixed(2)}%)`)
console.log(`Phrase rows with blank original word: ${gapBlankOriginal}`)
console.log(`Strong's lookups with no lexicon entry: ${gapMissingLex} (${strongsMissing.size} unique)`)
if (strongsMissing.size > 0) {
  console.log('Sample missing strongs:', [...strongsMissing].slice(0, 8).join(', '))
}
console.log()
console.log('Per-book blank-literal rate (top 10 worst):')
perBookStats.sort((a,b) => parseFloat(b.blankRate) - parseFloat(a.blankRate))
for (const s of perBookStats.slice(0, 10)) {
  console.log(`  ${s.bookId.padEnd(5)} ${s.verses.toString().padStart(5)} verses, ${s.blankLiterals.toString().padStart(4)} blank-literal rows (${s.blankRate})`)
}
console.log()
if (sampleBlankLiterals.length > 0) {
  console.log('Sample blank-literal rows:')
  for (const s of sampleBlankLiterals) {
    console.log(`  ${s.ref} ${s.strongs} "${s.english}"`)
    console.log(`    def: ${s.defSnippet}`)
    const parsed = parseStrongsDefinition(s.defSnippet.endsWith('') ? s.defSnippet : s.defSnippet)
    console.log(`    parsed.literal: "${parsed.literal}"   kjv: [${parsed.kjvUsages.slice(0,3).join(', ')}]`)
  }
}

const rate = gapBlankLiteral / totalRows
console.log()
if (rate > 0.02) {
  console.log(`FAIL: blank-literal rate ${(rate*100).toFixed(2)}% exceeds 2% threshold`)
  process.exit(1)
}
console.log(`PASS: blank-literal rate ${(rate*100).toFixed(2)}% within threshold`)
