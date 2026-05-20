// Build reverse indexes so the search engine can match Greek/Hebrew lemmas.
//
//   lemma-to-strongs.json   word/transliteration → [strongs numbers]
//   strongs-to-verses.json  strongs number       → [verse refs]
//
// Run with: node scripts/build-lemma-index.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseStrongsDefinition } from '../src/lib/strongs.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const strongsDir = join(repoRoot, 'src/data/strongs')
const outDir = join(repoRoot, 'src/data/search')

// Strip common English + KJV-era suffixes so "fornications", "fornicating",
// "fornicateth" all land on the same index key ("fornicat").
function stem(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/(eth|est|ing|edly|edst|ed|es|s)$/, '')
}

// Normalize Latin diacritics: "porneía" → "porneia", "agápē" → "agape"
function deaccent(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function tokenize(phrase) {
  return deaccent(phrase || '')
    .split(/[\s/()+\-×_.,;]+/)
    .map(t => t.replace(/[^a-z]/g, ''))
    .filter(t => t.length > 2)
}

// Words that clutter the index without helping search.
const STOPWORDS = new Set([
  'the','and','for','with','from','this','that','into','unto','upon','their','them',
  'then','than','there','here','what','who','which','whom','whose','when','where',
  'being','been','have','has','had','not','but','one','two','three','both','all',
  'any','some','also','only','very','more','most','own','same','such','thus','else',
  'can','may','must','like','see','use','used','usage','sense','senses','form',
  'thing','things','word','words','case','usually','probably','perhaps','apparent',
  'apparently','meaning','properly','primarily','literally','figuratively','specially',
  'specifically','particular','particularly','mainly','hence','including','compare',
  'implication','extension','origin','uncertain','foreign','primary','primitive',
  'root','strengthened','prolonged','shortened','lengthened','voice','middle',
  'passive','active','plural','dual','feminine','masculine','imperfect','perfect',
  'future','aorist','past','contracted','akin','derivative','reduplication',
  'intensive','reflexive','noun','verb','adjective','adverb','participle','preposition',
  'conjunction','particle','pronoun','hebrew','greek','aramaic','its','his','her',
  'our','your','they','something','someone','figurative','literal',
])

function addTo(map, key, value) {
  if (!key) return
  let set = map.get(key)
  if (!set) { set = new Set(); map.set(key, set) }
  set.add(value)
}

function mapToObject(map) {
  const out = {}
  for (const [k, v] of map) out[k] = [...v]
  return out
}

function indexToken(lemma, token, strongsKey) {
  if (!token || token.length < 3) return
  if (STOPWORDS.has(token)) return
  addTo(lemma, token, strongsKey)
  const st = stem(token)
  if (st && st !== token && st.length >= 3) addTo(lemma, st, strongsKey)
}

function buildLemmaIndex() {
  const greek = JSON.parse(readFileSync(join(strongsDir, 'lexicon-greek.json'), 'utf8'))
  const hebrew = JSON.parse(readFileSync(join(strongsDir, 'lexicon-hebrew.json'), 'utf8'))

  const lemma = new Map()
  let count = 0

  for (const lex of [greek, hebrew]) {
    for (const [strongsNum, entry] of Object.entries(lex)) {
      const def = entry.definition || entry.d || ''
      const key = strongsNum.toUpperCase()
      const parsed = parseStrongsDefinition(def)

      // Transliteration header (parseStrongsDefinition extracts this when the
      // `transliteration` lexicon field is empty, which is most entries).
      const translitSources = [
        (entry.transliteration || entry.t || '').toLowerCase(),
        parsed.transliteration.toLowerCase(),
      ]
      for (const source of translitSources) {
        for (const token of tokenize(source)) indexToken(lemma, token, key)
      }

      // KJV-era glosses — these back the KJV/ASV translations.
      for (const usage of parsed.kjvUsages) {
        for (const token of tokenize(usage)) indexToken(lemma, token, key)
      }

      // Literal + figurative meaning phrases — these usually hold the modern
      // English terms (e.g. "harlotry", "idolatry") that the WEB translation
      // leans on. Indexing them lets "immorality" find G4202 even though KJV
      // calls it "fornication".
      for (const phrase of [parsed.literal, ...parsed.figurative]) {
        for (const token of tokenize(phrase)) indexToken(lemma, token, key)
      }
      count++
    }
  }

  console.log(`  scanned ${count} lexicon entries → ${lemma.size} unique keys`)
  return mapToObject(lemma)
}

function buildStrongsToVerses() {
  const mappingsDir = join(strongsDir, 'mappings')
  const files = readdirSync(mappingsDir).filter(f => f.endsWith('.json'))

  const index = new Map()
  let verseCount = 0

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(mappingsDir, file), 'utf8'))
    for (const [verseRef, words] of Object.entries(data)) {
      verseCount++
      for (const w of words) {
        const strongs = typeof w === 'string' ? w : w.strongs
        if (strongs) addTo(index, strongs.toUpperCase(), verseRef)
      }
    }
  }

  console.log(`  scanned ${verseCount} verses across ${files.length} books → ${index.size} unique Strong's numbers`)
  return mapToObject(index)
}

console.log('[build-lemma-index] building...')
const lemma = buildLemmaIndex()
const s2v = buildStrongsToVerses()

mkdirSync(outDir, { recursive: true })
const lemmaPath = join(outDir, 'lemma-to-strongs.json')
const s2vPath = join(outDir, 'strongs-to-verses.json')
writeFileSync(lemmaPath, JSON.stringify(lemma))
writeFileSync(s2vPath, JSON.stringify(s2v))

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2) + ' MB'
console.log(`\n[build-lemma-index] wrote:`)
console.log(`  ${lemmaPath}  (${mb(lemmaPath)})`)
console.log(`  ${s2vPath}  (${mb(s2vPath)})`)
