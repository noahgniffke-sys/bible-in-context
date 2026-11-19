// Strong's Concordance — Greek/Hebrew word lookup
// Strong's numbers are public domain.
// Greek: G1-G5624 (New Testament)
// Hebrew: H1-H8674 (Old Testament)

import { isNarrativeHistoricalPresent } from './passage-style'

let greekLexicon = null
let hebrewLexicon = null
const mappingCache = {}

async function loadGreekLexicon() {
  if (greekLexicon) return greekLexicon
  try {
    const module = await import('../data/strongs/lexicon-greek.json')
    greekLexicon = module.default || module
  } catch {
    greekLexicon = {}
  }
  return greekLexicon
}

async function loadHebrewLexicon() {
  if (hebrewLexicon) return hebrewLexicon
  try {
    const module = await import('../data/strongs/lexicon-hebrew.json')
    hebrewLexicon = module.default || module
  } catch {
    hebrewLexicon = {}
  }
  return hebrewLexicon
}

// Look up a Strong's number definition
export async function lookupStrongs(strongsNumber) {
  if (!strongsNumber) return null

  const num = strongsNumber.toUpperCase()
  let entry = null
  if (num.startsWith('G')) {
    const lex = await loadGreekLexicon()
    entry = lex[num] || null
  } else if (num.startsWith('H')) {
    const lex = await loadHebrewLexicon()
    entry = lex[num] || null
  }
  if (!entry) return null

  // Normalize field names (handles both old and new dictionary formats)
  return {
    word: entry.word || entry.w || '',
    transliteration: entry.transliteration || entry.t || '',
    pronunciation: entry.easyPronunciation || entry.pronunciation || entry.p || '',
    partOfSpeech: entry.partOfSpeech || entry.s || '',
    definition: entry.definition || entry.d || '',
  }
}

async function ensureMapping(bookId) {
  const key = String(bookId || '').split('.')[0].toUpperCase()
  if (!mappingCache[key]) {
    try {
      const module = await import(`../data/strongs/mappings/${key.toLowerCase()}.json`)
      mappingCache[key] = module.default || module
    } catch {
      mappingCache[key] = {}
    }
  }
  return mappingCache[key]
}

// Raw Strong's rows for every verse in a chapter, without lexicon lookups.
export async function getRawChapterWords(bookId, chapter) {
  const book = String(bookId || '').toUpperCase()
  const mapping = await ensureMapping(book)
  const prefix = `${book}.${Number(chapter)}.`
  const verses = {}
  for (const [ref, words] of Object.entries(mapping)) {
    if (!ref.startsWith(prefix)) continue
    const n = Number(ref.slice(prefix.length))
    if (!Number.isInteger(n)) continue
    verses[n] = words
  }
  return verses
}

// Get Strong's numbers for a specific verse
export async function getStrongsForVerse(verseRef) {
  const bookId = verseRef.split('.')[0]
  const mapping = await ensureMapping(bookId)
  const normalizedRef = `${bookId.toUpperCase()}${verseRef.slice(bookId.length)}`
  const numbers = mapping[normalizedRef] || mapping[verseRef] || []

  // Get a clean simple definition from the full scholarly one
  function getSimpleDefinition(definition) {
    if (!definition) return ''
    // The definition format: "OriginalWord transliteration, pron; meaning1, meaning2. :—KJV usage"
    // Extract the KJV usage list after :— if present
    const kjvMatch = definition.match(/:—(.+)$/)
    if (kjvMatch) {
      // Clean up the KJV usage list — take first few words
      const usages = kjvMatch[1].trim().split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 4)
      return usages.join(', ')
    }
    // Otherwise find English meaning after the last semicolon
    const parts = definition.split(';')
    if (parts.length > 1) {
      const meaning = parts[parts.length - 1]
        .replace(/^\s*(i\.e\.?|that is|namely)\s*/i, '')
        .split(/[,.]/)[0]
        .trim()
      if (meaning.length > 2 && meaning.length < 50) return meaning
    }
    return ''
  }

  // Look up each number's definition
  const words = await Promise.all(
    numbers.map(async (entry) => {
      const num = typeof entry === 'string' ? entry : entry.strongs
      const originalWord = typeof entry === 'string' ? null : entry.word
      const englishFromData = typeof entry === 'string' ? '' : (entry.english || '')
      const morphCode = typeof entry === 'string' ? '' : (entry.morph || '')
      const def = await lookupStrongs(num)
      const simpleDefinition = getSimpleDefinition(def?.definition || '')
      return {
        strongs: num,
        originalWord: def?.word || originalWord || '',
        englishWord: englishFromData,
        simpleDefinition,
        morph: morphCode,
        morphDescription: parseMorphology(morphCode),
        transliteration: def?.transliteration || '',
        pronunciation: def?.pronunciation || '',
        partOfSpeech: def?.partOfSpeech || '',
        definition: def?.definition || '',
        language: num.startsWith('G') ? 'Greek' : 'Hebrew',
      }
    })
  )

  return words
}

// Parse morphology codes into human-readable descriptions
function parseMorphology(morph) {
  if (!morph) return ''

  // Greek Robinson's morph format uses dashes (e.g. "V-IXI-3S", "N-DSF", "PREP").
  // Hebrew uses colon-separated tags (e.g. "Qal:Perfect"). Detect which we have.
  const isGreekCode = !morph.includes(':') &&
    (/^[A-Z]+-/.test(morph) || /^(PREP|CONJ|ADV|INJ|COND|PRT|HEB|ARAM)$/.test(morph))
  if (isGreekCode) return parseGreekMorph(morph)

  const parts = morph.split(':').map(s => s.trim()).filter(Boolean)
  const descriptions = []

  for (const part of parts) {
    // Hebrew verb stems
    if (/^qal$/i.test(part)) descriptions.push('Qal (simple active)')
    else if (/^niphal$/i.test(part)) descriptions.push('Niphal (simple passive)')
    else if (/^piel$/i.test(part)) descriptions.push('Piel (intensive active)')
    else if (/^pual$/i.test(part)) descriptions.push('Pual (intensive passive)')
    else if (/^hiphil$/i.test(part)) descriptions.push('Hiphil (causative active)')
    else if (/^hophal$/i.test(part)) descriptions.push('Hophal (causative passive)')
    else if (/^hithpael$/i.test(part)) descriptions.push('Hithpael (reflexive)')
    // Verb tenses/aspects
    else if (/^perfect$/i.test(part)) descriptions.push('Perfect tense (completed action)')
    else if (/^imperfect$/i.test(part)) descriptions.push('Imperfect tense (ongoing/incomplete action)')
    else if (/^imperative$/i.test(part)) descriptions.push('Imperative (a command)')
    else if (/^infinitive/i.test(part)) descriptions.push('Infinitive form')
    else if (/^participle$/i.test(part)) descriptions.push('Participle (describing an ongoing action)')
    else if (/^aorist$/i.test(part)) descriptions.push('Aorist tense (a single, complete action)')
    else if (/^present$/i.test(part)) descriptions.push('Present tense (ongoing action)')
    else if (/^future$/i.test(part)) descriptions.push('Future tense')
    // Voice
    else if (/^active$/i.test(part)) descriptions.push('Active voice (subject does the action)')
    else if (/^passive$/i.test(part)) descriptions.push('Passive voice (subject receives the action)')
    else if (/^middle$/i.test(part)) descriptions.push('Middle voice (subject acts on/for itself)')
    // Mood
    else if (/^indicative$/i.test(part)) descriptions.push('Indicative mood (stating a fact)')
    else if (/^subjunctive$/i.test(part)) descriptions.push('Subjunctive mood (possibility or purpose)')
    else if (/^optative$/i.test(part)) descriptions.push('Optative mood (a wish or desire)')
    // Gender
    else if (/^masculine$/i.test(part)) descriptions.push('Masculine')
    else if (/^feminine$/i.test(part)) descriptions.push('Feminine')
    else if (/^neuter$/i.test(part)) descriptions.push('Neuter')
    // Number
    else if (/^singular$/i.test(part)) descriptions.push('Singular')
    else if (/^plural$/i.test(part)) descriptions.push('Plural')
    // Case (Greek)
    else if (/^nominative$/i.test(part)) descriptions.push('Nominative case (subject)')
    else if (/^genitive$/i.test(part)) descriptions.push('Genitive case (possession/source)')
    else if (/^dative$/i.test(part)) descriptions.push('Dative case (indirect object)')
    else if (/^accusative$/i.test(part)) descriptions.push('Accusative case (direct object)')
    else if (/^vocative$/i.test(part)) descriptions.push('Vocative case (direct address)')
    // Person
    else if (/^1st$/i.test(part) || /^first$/i.test(part)) descriptions.push('1st person (I/we)')
    else if (/^2nd$/i.test(part) || /^second$/i.test(part)) descriptions.push('2nd person (you)')
    else if (/^3rd$/i.test(part) || /^third$/i.test(part)) descriptions.push('3rd person (he/she/it/they)')
    // Construct state (Hebrew)
    else if (/^construct$/i.test(part)) descriptions.push('Construct state (connected to following word)')
    else if (/^absolute$/i.test(part)) descriptions.push('Absolute state')
    else if (part.length > 1) descriptions.push(part)
  }

  return descriptions.join(', ')
}

// Generate a grammatical context paragraph for a verse based on its word data
export function generateGrammaticalContext(words, language) {
  if (!words || words.length === 0) return ''

  const insights = []
  const isNT = language === 'Greek'

  for (const w of words) {
    if (!w.morph && !w.morphDescription) continue
    const desc = w.morphDescription || parseMorphology(w.morph)
    if (!desc) continue

    const englishLabel = w.englishWord ? `"${w.englishWord}"` : ''
    const wordLabel = w.transliteration || w.originalWord
    if (!wordLabel) continue

    insights.push(`The word ${wordLabel} ${englishLabel} (${w.strongs}) is ${desc.toLowerCase()}.`)
  }

  if (insights.length === 0) {
    // No morphology data — generate a basic note from word types
    const nouns = words.filter(w => w.partOfSpeech && /noun/i.test(w.partOfSpeech))
    const verbs = words.filter(w => w.partOfSpeech && /verb/i.test(w.partOfSpeech))

    const parts = []
    if (verbs.length > 0) {
      const verbList = verbs.slice(0, 3).map(v => `${v.transliteration || v.originalWord} ("${v.englishWord || v.simpleDefinition}")`).join(', ')
      parts.push(`The key ${isNT ? 'Greek' : 'Hebrew'} verb${verbs.length > 1 ? 's' : ''} in this verse: ${verbList}.`)
    }
    if (nouns.length > 0) {
      const nounList = nouns.slice(0, 3).map(n => `${n.transliteration || n.originalWord} ("${n.englishWord || n.simpleDefinition}")`).join(', ')
      parts.push(`Key noun${nouns.length > 1 ? 's' : ''}: ${nounList}.`)
    }
    if (parts.length > 0) {
      parts.push(`Understanding the original ${isNT ? 'Greek' : 'Hebrew'} words helps reveal the depth of meaning that may not be fully captured in English translation.`)
      return parts.join(' ')
    }

    return `This verse uses ${words.length} ${isNT ? 'Greek' : 'Hebrew'} words. Studying the original language reveals nuances in meaning that English translations may not fully capture.`
  }

  // Build a readable paragraph from insights
  const paragraph = insights.slice(0, 5).join(' ')
  const closing = isNT
    ? ' These grammatical details help us understand the precise meaning the original Greek conveys.'
    : ' These grammatical details help us understand the precise meaning the original Hebrew conveys.'

  return paragraph + closing
}

// Parse a Greek Robinson's morph code like "V-IXI-3S" or "N-DSF" into prose.
function parseGreekMorph(code) {
  const standalone = {
    PREP: 'preposition',
    CONJ: 'conjunction',
    ADV: 'adverb',
    INJ: 'interjection',
    COND: 'conditional particle',
    PRT: 'particle',
    HEB: 'Hebrew transliteration',
    ARAM: 'Aramaic transliteration',
  }
  if (standalone[code]) return standalone[code]

  const parts = code.split('-')
  const type = parts[0]

  const tense = { P:'present', I:'imperfect', F:'future', A:'aorist', X:'perfect', Y:'pluperfect', '2':'second aorist' }
  const voice = { A:'active', M:'middle', P:'passive', E:'middle/passive', D:'middle deponent', O:'passive deponent', N:'middle/passive deponent', Q:'impersonal active', X:'no voice' }
  const mood  = { I:'indicative', S:'subjunctive', O:'optative', M:'imperative', N:'infinitive', P:'participle', R:'imperative' }
  const cases = { N:'nominative', G:'genitive', D:'dative', A:'accusative', V:'vocative' }
  const nums  = { S:'singular', P:'plural' }
  const gens  = { M:'masculine', F:'feminine', N:'neuter' }

  if (type === 'V') {
    const tvm = parts[1] || ''
    const png = parts[2] || ''
    const out = ['Verb']
    if (tvm.length >= 1 && tense[tvm[0]]) out.push(`${tense[tvm[0]]} tense`)
    if (tvm.length >= 2 && voice[tvm[1]] && voice[tvm[1]] !== 'no voice') out.push(`${voice[tvm[1]]} voice`)
    if (tvm.length >= 3 && mood[tvm[2]]) out.push(`${mood[tvm[2]]} mood`)
    if (png) {
      if (/^[123]/.test(png)) {
        const p = png[0], n = png[1]
        if (p === '1') out.push('1st person')
        else if (p === '2') out.push('2nd person')
        else if (p === '3') out.push('3rd person')
        if (nums[n]) out.push(nums[n])
      } else if (png.length >= 3) {
        if (cases[png[0]]) out.push(cases[png[0]])
        if (nums[png[1]]) out.push(nums[png[1]])
        if (gens[png[2]]) out.push(gens[png[2]])
      }
    }
    return out.join(', ')
  }

  const typeNames = {
    N: 'noun', A: 'adjective', T: 'definite article',
    D: 'demonstrative pronoun', P: 'personal pronoun', R: 'relative pronoun',
    Q: 'interrogative pronoun', F: 'reflexive pronoun', K: 'correlative pronoun',
    I: 'indefinite pronoun', S: 'possessive pronoun', X: 'indefinite pronoun',
  }
  const name = typeNames[type]
  if (!name) return ''

  const cng = parts[1] || ''
  const out = [name]
  if (cng.length >= 3) {
    if (cases[cng[0]]) out.push(cases[cng[0]])
    if (nums[cng[1]]) out.push(nums[cng[1]])
    if (gens[cng[2]]) out.push(gens[cng[2]])
  }
  const suffix = parts[2] || ''
  if (suffix === 'PRI') out.push('proper name, indeclinable')
  else if (suffix === 'NUI') out.push('numeral, indeclinable')
  else if (suffix === 'LI') out.push('indeclinable')

  return out.join(', ')
}

// Parse a raw Strong's definition string into structured layers.
// Handles two Strong's formats:
//   1. Full: "ORIGINAL translit, pronunciation; etymology; literal; by implication, figurative; ... :— kjv usages"
//   2. Short: "meaning sentence. kjv-style usages."  (no header, no `:—`)
const ETYMOLOGY_RE = /^(from\s|of\s+(uncertain|foreign|the\s+same|(Aramaic|Hebrew|Greek)\s+origin)|a\s+primary\b|a\s+primitive\b|primitive\s+root|a\s+strengthened\b|a\s+prolonged\b|a\s+shortened\b|a\s+lengthened\b|(middle|passive|active)\s+voice\s+of\b|(apparent(ly)?|perhaps|probably)\b|(plural|dual|feminine|masculine|imperfect|perfect|future|aorist|past|contracted|akin|derivative|shortened|lengthened|reduplication|intensive|reflexive)\s+(of|from|to|for)\b|or\s+[\u0370-\u03FF\u0590-\u05FF\u1F00-\u1FFF]|\(including\b|compare\b)/i

const FIGURATIVE_RE = /^(by\s+implication|by\s+extension|figuratively|specially|specifically|also\b|hence\b|thus\b|in\s+particular|properly\b|in\s+a\s+good)/i

function parseKjvList(tail) {
  return tail
    .split(/[,;]/)
    .map(x => x.replace(/[×()+]/g, '').replace(/\s+/g, ' ').trim())
    .filter(x => x && x.length > 1 && !/^-/.test(x))
    .slice(0, 8)
}

export function parseStrongsDefinition(rawDef) {
  if (!rawDef) return { transliteration: '', etymology: '', literal: '', figurative: [], kjvUsages: [] }

  let s = rawDef.replace(/\s+/g, ' ').trim()

  let kjvUsages = []
  const kjvIdx = s.indexOf(':—')
  if (kjvIdx >= 0) {
    kjvUsages = parseKjvList(s.slice(kjvIdx + 2))
    s = s.slice(0, kjvIdx)
  }

  const sections = s.split(/\s*;\s*/).map(x => x.trim()).filter(Boolean)

  // Detect header: first section starts with Hebrew (U+0590-05FF), Greek (U+0370-03FF),
  // or Greek Extended / polytonic (U+1F00-1FFF). Some entries prefix the original word
  // with a dagger "†" or asterisk "*" marker — strip those before checking.
  let transliteration = ''
  let startIdx = 0
  if (sections.length > 0) {
    const stripped = sections[0].replace(/^[†*\s]+/, '')
    if (/^[\u0370-\u03FF\u0590-\u05FF\u1F00-\u1FFF]/.test(stripped)) {
      const commaIdx = stripped.indexOf(',')
      const headerMain = commaIdx >= 0 ? stripped.slice(0, commaIdx) : stripped
      const tokens = headerMain.trim().split(/\s+/)
      if (tokens.length >= 2) transliteration = tokens.slice(1).join(' ')
      startIdx = 1
    }
  }

  let etymology = ''
  let literal = ''
  const figurative = []

  for (let i = startIdx; i < sections.length; i++) {
    const sec = sections[i]
    if (!sec) continue
    if (ETYMOLOGY_RE.test(sec)) {
      if (!etymology) etymology = sec
      continue
    }
    if (FIGURATIVE_RE.test(sec)) {
      figurative.push(sec)
      continue
    }
    if (!literal) literal = sec
    else figurative.push(sec)
  }

  // Fallback: short-format entries (H7225 etc.) lack a header and `:—`.
  // The meaning sits in sentence 1; KJV-style usages in sentence 2+.
  if (!literal && sections.length > startIdx) {
    const rest = sections.slice(startIdx).join(' ')
    const sentences = rest.split(/\.\s+/)
    for (const sent of sentences) {
      if (!sent) continue
      if (ETYMOLOGY_RE.test(sent)) continue
      if (sent.length < 140) { literal = sent; break }
    }
    if (kjvUsages.length === 0 && sentences.length > 1) {
      kjvUsages = parseKjvList(sentences.slice(1).join(' '))
    }
  }

  return { transliteration, etymology, literal, figurative, kjvUsages }
}

// Clean a raw meaning fragment into a short, readable phrase.
function cleanMeaning(s) {
  if (!s) return ''
  let out = s
    .replace(/\([^)]*\)/g, ' ')
    .replace(/^\s*(i\.e\.?|that is|namely|properly|hence|specifically|specially|figuratively|by implication|by extension|also)\s*,?\s*/i, '')
    .replace(/[""]/g, '')
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[;,.\s]+$/, '')
    .trim()
  // Cap absurdly long literals at the first comma or semicolon.
  if (out.length > 90) {
    const cut = out.search(/,\s/)
    if (cut > 20 && cut < 90) out = out.slice(0, cut)
  }
  return out
}

// Build a phrase-by-phrase literal explanation for a verse's Strong's words.
// Returns one row per original-language word with: english, original, transliteration,
// literal root meaning, figurative/extended senses, grammar note, and a plain-English
// sentence that ties it together. The UI renders these as stacked cards.
export function generatePhraseByPhrase(words, language) {
  if (!words || words.length === 0) return []

  const langLabel = language === 'Greek' ? 'Greek' : 'Hebrew'
  const rows = []

  for (const w of words) {
    const parsed = parseStrongsDefinition(w.definition || '')
    const original = w.originalWord || ''
    const transliteration = w.transliteration || parsed.transliteration || ''
    const english = (w.englishWord || '').trim()
    const morphDesc = w.morphDescription || parseMorphology(w.morph)

    let literal = cleanMeaning(parsed.literal)
    if (!literal && parsed.kjvUsages.length > 0) {
      literal = parsed.kjvUsages.slice(0, 4).join(', ')
    }
    if (!literal) literal = cleanMeaning(w.simpleDefinition || '')

    const figurative = parsed.figurative
      .map(cleanMeaning)
      .filter(Boolean)
      .filter(f => f.length < 160)
      .slice(0, 2)

    const plainParts = []
    if (literal) {
      if (transliteration) {
        plainParts.push(`${langLabel} ${transliteration} literally means "${literal}".`)
      } else if (original) {
        plainParts.push(`${langLabel} ${original} literally means "${literal}".`)
      } else {
        plainParts.push(`Literally "${literal}".`)
      }
    }
    if (figurative.length > 0) {
      plainParts.push(`By extension: ${figurative[0]}.`)
    }
    if (morphDesc) {
      plainParts.push(`(${morphDesc})`)
    }

    rows.push({
      strongs: w.strongs,
      english,
      original,
      transliteration,
      pronunciation: w.pronunciation || '',
      partOfSpeech: w.partOfSpeech || '',
      morphDescription: morphDesc,
      literal,
      figurative,
      kjvUsages: parsed.kjvUsages,
      plain: plainParts.join(' '),
      language: langLabel,
    })
  }

  return rows
}

// Detect what kind of verse this is — narrative, command, prophecy, prayer, etc.
// Rule-based, pure function. Used to render the "Verse Type & Context" card.
const PROPHETIC_BOOKS = new Set(['ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL'])
const HISTORICAL_OT   = new Set(['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST'])
const GOSPELS         = new Set(['MAT','MRK','LUK','JHN'])
const EPISTLES        = new Set(['ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD'])

function isImperativeMorph(morph) {
  if (!morph) return false
  if (/imperative/i.test(morph)) return true              // Hebrew tag
  if (!morph.startsWith('V-')) return false
  const tvm = morph.split('-')[1] || ''                    // Greek Robinson's TVM block
  return tvm.length >= 3 && tvm[tvm.length - 1] === 'M'    // last char of TVM = mood
}

// Plain-English sense of the grammatical features so readers see WHY the form matters
const GREEK_TENSE_SENSE = {
  present: 'continuous, ongoing action',
  imperfect: 'continuous action in the past',
  future: 'action yet to happen',
  aorist: 'a single, completed event viewed as a whole',
  perfect: 'a completed action whose results continue into the present',
  pluperfect: 'a past completed action whose results were still in effect at a past point',
}

const HEBREW_ASPECT_SENSE = {
  perfect: 'completed or certain action',
  imperfect: 'ongoing, habitual, or future action',
  imperative: 'a direct command',
  participle: 'ongoing or characteristic action',
  infinitive: 'the verbal idea expressed abstractly',
}

const HEBREW_STEM_SENSE = {
  qal: 'simple active ("he did")',
  niphal: 'simple passive or reflexive ("he was done" / "he did to himself")',
  piel: 'intensive active ("he thoroughly did")',
  pual: 'intensive passive ("he was thoroughly done")',
  hiphil: 'causative active ("he caused someone to do")',
  hophal: 'causative passive ("he was caused to do")',
  hithpael: 'reflexive or reciprocal ("he did to himself")',
}

const VOICE_SENSE = {
  active: 'the subject performs the action',
  passive: 'the subject receives the action',
  middle: 'the subject acts on or for itself',
}

const MOOD_SENSE = {
  indicative: 'presenting it as a fact',
  subjunctive: 'expressing possibility, purpose, or a conditional idea',
  optative: 'expressing a wish or remote possibility',
  imperative: 'issuing a command',
}

function isVerbWord(w) {
  const morph = (w.morph || '').toLowerCase()
  const pos = (w.partOfSpeech || '').toLowerCase()
  return /^v-/i.test(morph) ||
    /(qal|niphal|piel|pual|hiphil|hophal|hithpael|perfect|imperfect|imperative|participle|infinitive|aorist)/.test(morph) ||
    /verb/.test(pos)
}

const COMMON_SKIP = new Set([
  'the','a','and','of','in','to','for','from','with','by','this','that','these','those',
  'he','she','it','they','we','you','i','but','not','was','is','are','were','be','been','being',
  'shall','will','may','might','have','has','had','do','did','done','there','here','then','now','so','as',
])

function isContentNoun(w) {
  const morph = (w.morph || '').toLowerCase()
  const pos = (w.partOfSpeech || '').toLowerCase()
  const isNoun = /^n-/i.test(morph) || /noun/.test(morph) || /noun/.test(pos)
  if (!isNoun) return false
  const eng = (w.englishWord || '').toLowerCase().trim()
  if (!eng || COMMON_SKIP.has(eng)) return false
  return true
}

function findInDesc(desc, keys) {
  const lower = (desc || '').toLowerCase()
  for (const k of keys) {
    if (new RegExp(`\\b${k}\\b`, 'i').test(lower)) return k
  }
  return null
}

function pickMainVerb(words) {
  const verbs = (words || []).filter(isVerbWord)
  if (verbs.length === 0) return null
  const scored = verbs.map(v => ({
    v,
    score: (v.englishWord ? 3 : 0) +
           (v.morphDescription ? 2 : 0) +
           (v.simpleDefinition ? 1 : 0) +
           ((v.englishWord || '').length > 3 ? 1 : 0),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0].v
}

function pickKeyTerms(words, limit = 2) {
  const nouns = (words || []).filter(isContentNoun)
  if (nouns.length === 0) return []
  // Deduplicate by Strong's number, prefer richer definitions
  const seen = new Map()
  for (const n of nouns) {
    const key = n.strongs || n.transliteration || n.originalWord
    if (!seen.has(key) || (n.simpleDefinition?.length || 0) > (seen.get(key).simpleDefinition?.length || 0)) {
      seen.set(key, n)
    }
  }
  const unique = [...seen.values()]
  unique.sort((a, b) => (b.simpleDefinition?.length || 0) - (a.simpleDefinition?.length || 0))
  return unique.slice(0, limit)
}

function buildVerbAnalysis(verb, isGreek, historicalPresent) {
  if (!verb) return ''
  const desc = (verb.morphDescription || '').toLowerCase()
  const translit = verb.transliteration || verb.originalWord
  if (!translit) return ''
  const english = verb.englishWord ? ` ("${verb.englishWord}")` : ''
  const lang = isGreek ? 'Greek' : 'Hebrew'

  const tenseMap = isGreek ? GREEK_TENSE_SENSE : HEBREW_ASPECT_SENSE
  const tense = findInDesc(desc, Object.keys(tenseMap))
  const voice = findInDesc(desc, Object.keys(VOICE_SENSE))
  const mood = findInDesc(desc, Object.keys(MOOD_SENSE))
  const stem = isGreek ? null : findInDesc(desc, Object.keys(HEBREW_STEM_SENSE))

  const notes = []
  if (stem) notes.push(`${stem} stem (${HEBREW_STEM_SENSE[stem]})`)
  if (tense) {
    const sense = historicalPresent && tense === 'present'
      ? 'a past event told in the present tense, so the moment feels immediate'
      : tenseMap[tense]
    notes.push(`${tense}${isGreek ? ' tense' : ''} — ${sense}`)
  }
  if (voice) notes.push(`${voice} voice (${VOICE_SENSE[voice]})`)
  if (mood && mood !== tense) notes.push(`${mood} mood (${MOOD_SENSE[mood]})`)

  if (notes.length === 0) {
    const gloss = verb.simpleDefinition || verb.englishWord
    if (!gloss) return ''
    return `The main ${lang} verb here is ${translit}${english} — ${gloss}.`
  }
  return `The main ${lang} verb ${translit}${english} is ${notes.join('; ')}.`
}

function buildTermsAnalysis(terms, isGreek) {
  if (!terms || terms.length === 0) return ''
  const lang = isGreek ? 'Greek' : 'Hebrew'
  const pieces = terms.map(t => {
    const translit = t.transliteration || t.originalWord
    const english = t.englishWord ? ` ("${t.englishWord}")` : ''
    const def = t.simpleDefinition || ''
    return def ? `${translit}${english} — ${def}` : `${translit}${english}`
  })
  const joiner = pieces.length > 1 ? '; ' : ''
  if (pieces.length === 1) {
    return `The weight-bearing ${lang} noun in this verse is ${pieces[0]}.`
  }
  return `Key ${lang} nouns here: ${pieces.join(joiner)}.`
}

function generateVerseAnalysis(words, language, bookId) {
  if (!words || words.length === 0) return ''
  const isGreek = language === 'Greek'
  const mainVerb = pickMainVerb(words)
  const keyTerms = pickKeyTerms(words, 2)
  const parts = []
  const historicalPresent = isNarrativeHistoricalPresent(mainVerb, words, bookId)
  const v = buildVerbAnalysis(mainVerb, isGreek, historicalPresent)
  if (v) parts.push(v)
  const t = buildTermsAnalysis(keyTerms, isGreek)
  if (t) parts.push(t)
  return parts.join(' ')
}

function computeVerseType({ words, text, bookId }) {
  const t = (text || '').toString()
  const lower = t.toLowerCase()
  const book = (bookId || '').toUpperCase()

  const hasImperative = (words || []).some(w => isImperativeMorph(w.morph))
  // Hebrew prohibitions: לא + imperfect verb shows up in English as "thou shalt not" / "shall not"
  const hasProhibition = /\b(shalt|shall|you\s+shall|do)\s+not\b/i.test(lower) &&
    (words || []).some(w => /imperfect/i.test(w.morph || ''))

  // 1. Strong specific markers — these always win
  if (/thus\s+(saith|says)\s+the\s+lord|declares?\s+the\s+lord|word\s+of\s+the\s+lord\s+came|saith\s+(the\s+lord|your\s+god|thy\s+god|god|jehovah)/i.test(lower)) {
    return {
      type: 'Prophetic Oracle',
      description: 'A direct word from God delivered through a prophet. "Thus says the LORD" (or "saith your God") introduces divine speech with the full weight of covenant authority.',
    }
  }
  if (/^\s*(blessed|happy)\s+(is|are|be)/i.test(lower) || /\bblessed\s+(art|are)\s+(thou|you)/i.test(lower)) {
    return {
      type: 'Blessing / Beatitude',
      description: 'A pronouncement of God\'s favor on a person or group. Blessings declare a state of flourishing tied to walking in God\'s ways.',
    }
  }
  if (/\bcursed\b/i.test(lower)) {
    return {
      type: 'Curse / Warning',
      description: 'A solemn pronouncement against wrongdoing. In Hebrew thought a curse calls down covenantal consequences on those who break God\'s law.',
    }
  }
  if (/\?\s*$/.test(t)) {
    return {
      type: 'Question',
      description: 'A question — sometimes rhetorical (used to make a point), sometimes a real inquiry. Ask: who is asking, and what answer is the text steering you toward?',
    }
  }
  if (/\b(begat|fathered)\b.*\b(begat|fathered)\b/i.test(lower) || /\bson\s+of\b.*\bson\s+of\b.*\bson\s+of\b/i.test(lower)) {
    return {
      type: 'Genealogy',
      description: 'A family line — Hebrew genealogies establish identity, inheritance, and the unfolding of God\'s covenant promises across generations.',
    }
  }

  // 2. Prayer (psalm or direct address to God + imperative)
  if ((book === 'PSA' || /\b(o\s+lord|o\s+god|o\s+my\s+god)\b/i.test(lower)) && hasImperative) {
    return {
      type: 'Prayer / Lament',
      description: 'A direct address to God — petition, lament, praise, or trust. The imperative verbs ("hear," "save," "remember") are aimed at God Himself.',
    }
  }

  // 3. Wisdom-book genres take priority over generic "command" labeling
  if (book === 'PRO') {
    return {
      type: 'Proverb — Wisdom Saying',
      description: 'A wisdom saying — a general truth about how the world usually works. Proverbs are observations, not iron-clad promises.',
    }
  }
  if (book === 'ECC') {
    return {
      type: 'Ecclesiastes — Reflective Wisdom',
      description: 'Reflective wisdom wrestling with the meaning of life "under the sun." The voice often speaks despair before pivoting back to fear of God.',
    }
  }
  if (book === 'SNG') {
    return {
      type: 'Song of Songs — Love Poetry',
      description: 'Hebrew love poetry, rich in pastoral imagery. Read figuratively — the lovers describe each other in metaphors drawn from nature.',
    }
  }
  if (book === 'JOB') {
    return {
      type: 'Job — Wisdom Dialogue',
      description: 'A dialogue between Job, his friends, and God on suffering. Watch which speaker is talking — only God\'s words at the end carry full divine authority.',
    }
  }
  if (book === 'PSA') {
    return {
      type: 'Psalm — Hebrew Poetry',
      description: 'Hebrew poetry built on parallelism: the second line of a couplet usually echoes, contrasts, or sharpens the first. Read for emotion and imagery, not flat description.',
    }
  }

  // 4. Generic command/prohibition (after wisdom books, before historical genre)
  if (hasImperative || hasProhibition) {
    return {
      type: hasProhibition ? 'Prohibition / Law' : 'Command / Instruction',
      description: hasProhibition
        ? 'A "thou shalt not" — a Hebrew prohibition. The verb is in the imperfect with a negative particle, the standard form for binding moral law.'
        : 'An imperative — a direct command. The original-language verbs are in the imperative mood, the form used to tell the listener to act.',
    }
  }

  // 5. Genre by book (defaults)
  if (PROPHETIC_BOOKS.has(book)) {
    return {
      type: 'Prophetic Book',
      description: 'Prophecy: God speaking judgment, warning, or hope through a chosen messenger. Watch for shifts between God\'s voice (first person) and the prophet\'s narration.',
    }
  }
  if (HISTORICAL_OT.has(book)) {
    return {
      type: 'Historical Narrative',
      description: 'A historical account of God\'s acts among His people. Narrative shows rather than tells — the lessons emerge from what happens, not from what is preached.',
    }
  }
  if (GOSPELS.has(book)) {
    return {
      type: 'Gospel Narrative',
      description: 'An account of Jesus\' life, teaching, death, and resurrection. Each Gospel selects and arranges events to make a particular case about who Jesus is.',
    }
  }
  if (book === 'ACT') {
    return {
      type: 'Acts — Early Church Narrative',
      description: 'A narrative of the early church\'s growth as the Spirit empowers ordinary people to spread the message of Jesus across the Roman world.',
    }
  }
  if (EPISTLES.has(book)) {
    return {
      type: 'Epistle / Letter',
      description: 'A letter to a specific church or person addressing real situations. Read it as a one-sided conversation — the author assumes context the original readers shared.',
    }
  }
  if (book === 'REV') {
    return {
      type: 'Apocalyptic Vision',
      description: 'Apocalyptic literature: heavy symbolism, vivid imagery, cosmic conflict. The pictures reveal spiritual realities rather than decode one-for-one to events.',
    }
  }

  return {
    type: 'Scripture',
    description: 'A passage of Scripture. Read it carefully in context — what comes before and after, who is speaking, and to whom.',
  }
}

// Public entry: genre classification + verse-specific original-language analysis
export function detectVerseType({ words, text, bookId }) {
  const base = computeVerseType({ words, text, bookId })
  const language = getLanguageForBook(bookId)
  const analysis = generateVerseAnalysis(words, language, bookId)
  return { ...base, analysis }
}

// Rewrite a grammatical form into plain-English meaning for someone with no
// Greek/Hebrew background. Returns a single self-contained sentence.
function explainFormInPlainEnglish(word, isGreek, historicalPresent) {
  if (!word) return ''
  const desc = (word.morphDescription || '').toLowerCase()
  const english = word.englishWord || word.simpleDefinition || ''
  const label = english ? `"${english}"` : 'this word'

  if (isGreek && historicalPresent) {
    return `${label} is present tense in a past story. Greek writers do this to make one completed moment feel immediate. It is not an action that keeps repeating.`
  }

  if (isGreek) {
    if (/aorist/.test(desc)) {
      return `${label} is in the aorist form — meaning it points to a single, completed event viewed as a whole. The writer is saying this happened once and decisively, not something that keeps repeating.`
    }
    if (/pluperfect/.test(desc)) {
      return `${label} is in the pluperfect form — an action that was already completed at some point in the past, with its results reaching forward from there.`
    }
    if (/\bperfect\b/.test(desc)) {
      return `${label} is in the perfect form — the action was finished in the past, but the effect of it is still true right now. What was done then is still in force today.`
    }
    if (/\bpresent\b/.test(desc)) {
      return `${label} is in the present form — ongoing, continuous action. Not a one-time event but something that keeps happening.`
    }
    if (/imperfect/.test(desc)) {
      return `${label} is in the imperfect form — continuous action in the past that kept going over time, not a finished event.`
    }
    if (/\bfuture\b/.test(desc)) {
      return `${label} is in the future form — pointing to what will happen, not what has happened yet.`
    }
  } else {
    if (/perfect/.test(desc)) {
      return `${label} is in the perfect aspect — Hebrew uses this form to present an action as complete or certain, already settled in view.`
    }
    if (/imperfect/.test(desc)) {
      return `${label} is in the imperfect aspect — Hebrew uses this form for ongoing, habitual, or yet-to-happen action, not something already finished.`
    }
    if (/hiphil/.test(desc)) {
      return `${label} is a Hiphil (causative) form — the subject is causing someone or something else to do the action, not doing it themselves.`
    }
    if (/piel/.test(desc)) {
      return `${label} is a Piel (intensive) form — the action is emphatic, thorough, or repeated, not just a plain "he did it."`
    }
    if (/niphal/.test(desc)) {
      return `${label} is a Niphal (simple passive/reflexive) form — the subject is receiving the action, or doing it to themselves.`
    }
    if (/hithpael/.test(desc)) {
      return `${label} is a Hithpael (reflexive) form — the subject is doing something to themselves, or doing it back and forth.`
    }
  }
  if (/imperative/.test(desc)) {
    return `${label} is an imperative — a direct command to act. It is not describing something, it is telling the reader to do it.`
  }
  if (/subjunctive/.test(desc)) {
    return `${label} is in the subjunctive — expressing possibility, purpose, or a "so that this happens" kind of idea rather than a plain fact.`
  }
  if (/participle/.test(desc)) {
    return `${label} is a participle — describing someone as continually or characteristically doing this action (the "-ing" idea).`
  }
  return ''
}

// Build a plain-English summary of the verse that a first-time reader
// could read on its own and actually understand.
export function generatePlainEnglish(verseText, words, language, bookId) {
  if (!verseText) return { simplified: '', insights: [] }

  // Step 1 — modernize KJV wording so the verse reads in today's English
  let simplified = verseText
  for (const [archaic, modern] of Object.entries(KJV_TO_MODERN)) {
    const reLower = new RegExp(`\\b${archaic}\\b`, 'g')
    simplified = simplified.replace(reLower, modern)
    const cap = archaic[0].toUpperCase() + archaic.slice(1)
    const modernCap = modern[0].toUpperCase() + modern.slice(1)
    simplified = simplified.replace(new RegExp(`\\b${cap}\\b`, 'g'), modernCap)
  }

  // Step 2 — extract practical, reader-level insights from the original language
  const isGreek = language === 'Greek'
  const mainVerb = pickMainVerb(words)
  const keyTerms = pickKeyTerms(words, 2)

  const insights = []

  const verbInsight = explainFormInPlainEnglish(
    mainVerb,
    isGreek,
    isNarrativeHistoricalPresent(mainVerb, words, bookId),
  )
  if (verbInsight) insights.push(verbInsight)

  for (const term of keyTerms) {
    const eng = term.englishWord
    const translit = term.transliteration || term.originalWord
    const def = term.simpleDefinition
    if (eng && def && translit) {
      insights.push(`"${eng}" in this verse is the ${isGreek ? 'Greek' : 'Hebrew'} word ${translit}, which carries the sense of ${def}.`)
    }
  }

  return { simplified, insights }
}

// Pull etymology references (e.g. "from G575 and G2644") from a Strong's
// definition string and resolve each one to its own word + meaning so
// compound words show their building blocks.
export async function getEtymologyBreakdown(strongsNumber) {
  if (!strongsNumber) return null
  const entry = await lookupStrongs(strongsNumber)
  if (!entry?.definition) return null

  const match = entry.definition.match(/from\s+([^;:]+?)(?:;|:—|$)/i)
  if (!match) return null
  const chunk = match[1]
  const refs = [...chunk.matchAll(/\b[GH]\d+\b/g)].map(m => m[0])
  if (refs.length === 0) return null

  const components = await Promise.all(refs.map(async (ref) => {
    const r = await lookupStrongs(ref)
    if (!r) return { strongs: ref, gloss: '' }
    // Parse out the original word + a short gloss from the definition
    const defStr = r.definition || ''
    // Original word is often the first non-ASCII token
    const wordMatch = defStr.match(/^([^\s]+)/)
    const original = r.word || (wordMatch ? wordMatch[1] : '')
    // Prefer the KJV usage list for a short, reader-friendly gloss
    const kjvMatch = defStr.match(/:—([^.]+)/)
    let gloss = ''
    if (kjvMatch) {
      gloss = kjvMatch[1].trim().split(',').slice(0, 3).map(s => s.trim()).filter(Boolean).join(', ')
    } else {
      // Fall back to the literal sense between semicolons
      const parts = defStr.split(';')
      if (parts.length > 1) gloss = parts[parts.length - 1].trim().split(/[,.]/)[0].trim()
    }
    return {
      strongs: ref,
      originalWord: original,
      transliteration: r.transliteration || '',
      pronunciation: r.pronunciation || '',
      partOfSpeech: r.partOfSpeech || '',
      gloss: gloss.slice(0, 80),
    }
  }))

  return { rawPhrase: chunk.trim(), components }
}

// KJV archaic → modern English mappings for matching across translations
const KJV_TO_MODERN = {
  'saith':'says','hath':'has','doth':'does','shalt':'shall','wilt':'will',
  'art':'are','dost':'do','didst':'did','knoweth':'knows','cometh':'comes',
  'goeth':'goes','maketh':'makes','taketh':'takes','giveth':'gives',
  'liveth':'lives','loveth':'loves','doeth':'does','seeth':'sees',
  'heareth':'hears','speaketh':'speaks','teacheth':'teaches','calleth':'calls',
  'sendeth':'sends','receiveth':'receives','believeth':'believes',
  'followeth':'follows','seeketh':'seeks','findeth':'finds','keepeth':'keeps',
  'bringeth':'brings','worketh':'works','judgeth':'judges','putteth':'puts',
  'standeth':'stands','sitteth':'sits','falleth':'falls','passeth':'passes',
  'abideth':'abides','remaineth':'remains','dwelleth':'dwells',
  'unto':'to','thee':'you','thou':'you','thy':'your','thine':'yours',
  'ye':'you','hast':'have','thereof':'of it','therein':'in it',
  'whereby':'by which','wherefore':'therefore','whosoever':'whoever',
  'whatsoever':'whatever','whoso':'whoever','amongst':'among',
  'spake':'spoke','sware':'swore','brake':'broke','drave':'drove',
  'gat':'got','begat':'fathered','smote':'struck','wrought':'worked',
  'cleft':'split','digged':'dug','holpen':'helped',
  'brethren':'brothers','kine':'cows','raiment':'clothing',
  'shew':'show','shewed':'showed','shewn':'shown',
  'beseech':'beg','nigh':'near','whither':'where',
  'hither':'here','thither':'there','hence':'from here',
  'peradventure':'perhaps','verily':'truly','straightway':'immediately',
  'forthwith':'immediately','notwithstanding':'nevertheless',
  'howbeit':'however','albeit':'although','lo':'look','behold':'look',
  'yea':'yes','nay':'no','amen':'amen',
}

// Rewrite archaic commentary into today's English without changing the meaning.
export function modernizeProse(text) {
  if (!text || typeof text !== 'string') return text
  let out = text
  const entries = Object.entries(KJV_TO_MODERN).sort((a, b) => b[0].length - a[0].length)
  for (const [archaic, modern] of entries) {
    const modernCap = modern[0].toUpperCase() + modern.slice(1)
    const cap = archaic[0].toUpperCase() + archaic.slice(1)
    out = out.replace(new RegExp(`\\b${cap}\\b`, 'g'), modernCap)
    out = out.replace(new RegExp(`\\b${archaic}\\b`, 'g'), modern)
  }
  return out
}

// Match English words from interlinear to the current translation's wording
export function adaptWordsToTranslation(strongsWords, verseText) {
  if (!verseText || !strongsWords) return strongsWords

  const verseLower = verseText.toLowerCase()
  const verseWords = verseLower.split(/\s+/)

  return strongsWords.map(w => {
    const kjvEng = (w.englishWord || '').toLowerCase().trim()
    if (!kjvEng) return w

    // Check if KJV word already exists in current translation
    if (verseLower.includes(kjvEng)) return w

    // Try each word in a multi-word English phrase
    const kjvParts = kjvEng.split(/\s+/)
    const modernParts = kjvParts.map(part => KJV_TO_MODERN[part] || part)
    const modernPhrase = modernParts.join(' ')

    // Check if the modern version exists in the verse
    if (modernPhrase !== kjvEng && verseLower.includes(modernPhrase.split(' ')[0])) {
      return { ...w, englishWord: modernPhrase }
    }

    // Try to find the closest match in the verse text
    for (const vw of verseWords) {
      const cleanVw = vw.replace(/[^a-z]/g, '')
      if (cleanVw.length < 3) continue
      // Check if the verse word starts with the same root
      const kjvRoot = kjvEng.replace(/(eth|est|ed|th|ing|s)$/, '')
      const vwRoot = cleanVw.replace(/(ing|ed|es|s)$/, '')
      if (kjvRoot.length >= 3 && vwRoot.length >= 3 && kjvRoot === vwRoot) {
        return { ...w, englishWord: cleanVw }
      }
    }

    // Fall back to the modern mapping even if not found in verse
    if (modernPhrase !== kjvEng) {
      return { ...w, englishWord: modernPhrase }
    }

    return w
  })
}

// Determine if a book is OT (Hebrew) or NT (Greek)
export function getLanguageForBook(bookId) {
  const ntBooks = ['MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH',
    'PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS',
    '1PE','2PE','1JN','2JN','3JN','JUD','REV']
  return ntBooks.includes(bookId) ? 'Greek' : 'Hebrew'
}
