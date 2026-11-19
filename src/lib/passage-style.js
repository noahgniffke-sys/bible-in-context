// Passage-level writing patterns, read from the Strong's word lists already
// bundled with each verse. A pattern is shown only when those words support it.
// Hebrew "and" is detected from the English gloss: the vav is usually stored
// on the verb, not as its own token.

const NARRATIVE_NT = new Set(['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'REV'])
const STORY_NT = new Set(['MAT', 'MRK', 'LUK', 'JHN', 'ACT'])
const NARRATIVE_OT = new Set([
  'GEN', 'EXO', 'NUM', 'JOS', 'JDG', 'RUT',
  '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JON',
])

const PRIORITY = [
  'connective',
  'hebrew-and',
  'immediately',
  'historical-present',
  'amen-amen',
  'behold',
  'men-de',
  'ou-me',
  'oun',
  'gar',
  'alla',
  'hina',
]

const DROP_GLOSS = /^(and|but|also|even|then|now|for|therefore|so|that|the|a|an)$/i
const LEADING_PRONOUN = /^(he|him|they|them|ye|thee|thou|you|it|as he|unto him|unto them|unto thee)$/i
const HP_GLOSS = /\b(came|come|comes|cometh|said|saith|says|say|went|go|goes|goeth|answered|found|finds|findeth|took|take|takes|gave|give|stood|cried|called|call|calls)\b/i

function bookOf(bookId) {
  return String(bookId || '').toUpperCase()
}

function gloss(word) {
  return String(word?.english || word?.englishWord || '').trim()
}

function cleanGloss(word, keepLeadIn = false) {
  let eng = gloss(word).replace(/[.,;:]+$/g, '').trim()
  if (!keepLeadIn) eng = eng.replace(/^(and|but|then|now)\s+/i, '').trim()
  if (!eng || DROP_GLOSS.test(eng)) return ''
  const morph = word?.morph || ''
  const original = word?.word || ''
  const first = original.charAt(0)
  const capitalGreek = first !== '' && first !== first.toLowerCase() && first === first.toUpperCase()
  const proper = morph.includes('PRI') || (morph.startsWith('N-') && capitalGreek)
  if (proper) {
    eng = eng.replace(/(^|\s)([a-z])/g, (_, sp, c) => sp + c.toUpperCase())
  }
  eng = eng.replace(/\bgod\b/g, 'God').replace(/\blord\b/g, 'Lord')
  return eng
}

function actionLine(words) {
  const bits = []
  for (const word of words || []) {
    const eng = cleanGloss(word, bits.length > 0)
    if (!eng) continue
    if (LEADING_PRONOUN.test(eng) && bits.length === 0) continue
    bits.push(eng)
    if (bits.length >= 3 || bits.join(' ').length >= 42) break
  }
  if (bits.length === 0) return ''
  const text = bits.join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function findRun(verseMap, verse, pred) {
  const here = verseMap[verse]
  if (!here || !pred(here)) return null
  let lo = verse
  let hi = verse
  while (verseMap[lo - 1] && pred(verseMap[lo - 1])) lo -= 1
  while (verseMap[hi + 1] && pred(verseMap[hi + 1])) hi += 1
  const full = hi - lo + 1
  if (full < 3) return null
  let start = lo
  let end = hi
  let trimmed = false
  if (full > 8) {
    trimmed = true
    start = Math.max(lo, verse - 3)
    end = Math.min(hi, start + 7)
    if (verse > end) {
      end = Math.min(hi, verse + 3)
      start = Math.max(lo, end - 7)
    }
  }
  return { start, end, trimmed, full }
}

function actionsFor(verseMap, start, end) {
  const lines = []
  for (let v = start; v <= end; v += 1) {
    const text = actionLine(verseMap[v])
    if (text) lines.push({ verse: v, text })
  }
  return lines
}

function rangeLabel(start, end) {
  return start === end ? String(start) : `${start}–${end}`
}

function countOpeners(verseMap, start, end, strongs) {
  let n = 0
  for (let v = start; v <= end; v += 1) {
    if (verseMap[v]?.[0]?.strongs === strongs) n += 1
  }
  return n
}

function greekConnective(verseMap, verse, book, bookName, chapter) {
  if (!NARRATIVE_NT.has(book)) return null
  const run = findRun(verseMap, verse, (words) => {
    const id = words?.[0]?.strongs
    return id === 'G2532' || id === 'G1161'
  })
  if (!run) return null

  const kai = countOpeners(verseMap, run.start, run.end, 'G2532')
  const de = countOpeners(verseMap, run.start, run.end, 'G1161')
  const span = `${bookName} ${chapter}:${rangeLabel(run.start, run.end)}`
  let link = ''
  if (kai > 0 && de > 0) {
    link = `${kai} ${kai === 1 ? 'verse opens' : 'verses open'} with καί (kai), which means and, and ${de} ${de === 1 ? 'verse opens' : 'verses open'} with δέ (de), which means and or but.`
  } else if (kai > 0) {
    link = `these verses open with καί (kai), which means and.`
  } else {
    link = `these verses open with δέ (de), which means and or but.`
  }

  const joiner = kai > 0 && de > 0 ? 'These words join' : 'The word joins'
  let body = `In ${span}, ${link} ${joiner} the clauses. That link does not decide which action matters more. A translation may start a new English sentence and leave it out.`
  if (book === 'MRK') {
    body += ' Mark writes this way through the whole Gospel, often adding “immediately,” so the story keeps moving.'
  } else if (book === 'REV') {
    body += ' Revelation uses the chain to move from one picture to the next.'
  } else {
    body += ' In a narrative, the effect is one action after another.'
  }
  if (run.trimmed) {
    body += ' The same linking continues past this group. These are the lines around this verse.'
  }

  return {
    id: 'connective',
    title: 'These lines are joined with “and”',
    body,
    verses: actionsFor(verseMap, run.start, run.end),
  }
}

function sequenceKind(lines) {
  const text = lines.map(l => l.text).join(' ').toLowerCase()
  const future = (text.match(/\b(shall|will|shalt)\b/g) || []).length
  const past = (text.match(/\b(said|came|went|took|gave|made|called|brought|saw|heard|rose|spoke|spake)\b/g) || []).length
  if (future > past) return 'instruction'
  if (past > 0) return 'narrative'
  return 'sequence'
}

function hebrewAnd(verseMap, verse, book, bookName, chapter) {
  if (!NARRATIVE_OT.has(book)) return null
  const run = findRun(verseMap, verse, (words) => /^and\b/i.test(gloss(words?.[0])))
  if (!run) return null
  const verses = actionsFor(verseMap, run.start, run.end)
  const kind = sequenceKind(verses)
  const span = `${bookName} ${chapter}:${rangeLabel(run.start, run.end)}`
  let body = `In ${span}, the lines are linked with and. Hebrew does this with the letter vav. A translation may start a new sentence and drop the word. The actions are still one sequence.`
  if (kind === 'instruction') {
    body += ' Here the and marks the next step in the instructions.'
  }
  if (run.trimmed) {
    body += ' The same pattern continues past this group. These are the lines around this verse.'
  }
  return {
    id: 'hebrew-and',
    title: 'These lines move by “and”',
    body,
    verses,
  }
}

function nearbySpan(verseMap, verse, run) {
  if (run) return [run.start, run.end]
  const nums = Object.keys(verseMap).map(Number).filter(n => !Number.isNaN(n))
  if (nums.length === 0) return [verse, verse]
  const lo = Math.max(Math.min(...nums), verse - 3)
  const hi = Math.min(Math.max(...nums), verse + 3)
  return [lo, hi]
}

function immediatePattern(verseMap, verse, book, run) {
  const [from, to] = nearbySpan(verseMap, verse, run)
  const hits = []
  for (let v = from; v <= to; v += 1) {
    for (const word of verseMap[v] || []) {
      if (word.strongs === 'G2112' || word.strongs === 'G2117') {
        hits.push({ verse: v, word: word.word || (word.strongs === 'G2117' ? 'εὐθύς' : 'εὐθέως') })
      }
    }
  }
  if (hits.length === 0) return null
  const forms = [...new Set(hits.map(h => h.word))].join(' and ')
  const verseNums = [...new Set(hits.map(h => h.verse))]
  let where = 'This verse uses'
  if (!verseNums.includes(verse)) {
    where = verseNums.length === 1
      ? `Verse ${verseNums[0]} uses`
      : `Verses ${verseNums.join(' and ')} use`
  }
  let body = `${where} ${forms}, meaning immediately. It tells you the next action happened at once.`
  if (book === 'MRK') {
    body += ' Mark uses this word more than the other Gospels, so the story barely pauses.'
  }
  return { id: 'immediately', title: '“Immediately”', body }
}

export function looksLikeHistoricalPresent(word) {
  const morph = word?.morph || ''
  // Third person only. "I say" is someone speaking, not a past scene told in the present.
  if (!/^V-P[A-Z]I-3/.test(morph)) return false
  return HP_GLOSS.test(gloss(word))
}

function verseHasStoryTense(words) {
  return (words || []).some(w => /^V-(?:2)?[AI]/.test(w.morph || ''))
}

// A present-tense Greek verb used to narrate one past moment.
export function isNarrativeHistoricalPresent(word, words, bookId) {
  if (!word) return false
  if (!STORY_NT.has(bookOf(bookId))) return false
  if (!looksLikeHistoricalPresent(word)) return false
  return verseHasStoryTense(words)
}

function historicalPresentPattern(verseMap, verse, book) {
  const words = verseMap[verse] || []
  const found = []
  const seen = new Set()
  for (const word of words) {
    if (!isNarrativeHistoricalPresent(word, words, book)) continue
    const key = word.word || gloss(word)
    if (seen.has(key)) continue
    seen.add(key)
    const eng = cleanGloss(word) || gloss(word)
    found.push({ greek: word.word, english: eng })
  }
  if (found.length === 0) return null
  const listed = found.slice(0, 3).map(item => item.greek).join(', ')
  const readings = found.slice(0, 3).map(item => item.english).filter(Boolean)
  const reading = readings.length ? ` The translation reads “${readings.join(', ')}.”` : ''
  const verb = found.length > 1 ? 'are present-tense verbs' : 'is a present-tense verb'
  return {
    id: 'historical-present',
    title: 'A past moment told in the present',
    body: `${listed} ${verb} in a past scene.${reading} Greek narrative does this so that one moment feels immediate. It does not mean the action keeps repeating.`,
  }
}

function hasDouble(words, id) {
  for (let i = 0; i < (words || []).length - 1; i += 1) {
    if (words[i].strongs === id && words[i + 1].strongs === id) return true
  }
  return false
}

function hasStrongs(words, id) {
  return (words || []).some(w => w.strongs === id)
}

function hasOrderedPair(words, a, b) {
  for (let i = 0; i < (words || []).length - 1; i += 1) {
    if (words[i].strongs === a && words[i + 1].strongs === b) return true
  }
  return false
}

function currentWordPatterns(words) {
  const out = []
  if (hasDouble(words, 'G281')) {
    out.push({
      id: 'amen-amen',
      title: '“Truly, truly”',
      body: 'ἀμήν ἀμήν (amen amen) doubles the word on purpose. John uses it to mark a solemn saying. English often reads “Truly, truly.”',
    })
  }
  if (hasStrongs(words, 'G2400')) {
    out.push({
      id: 'behold',
      title: '“Look”',
      body: 'ἰδού (idou) means look or behold. The writer stops and points at what comes next.',
    })
  } else if (hasStrongs(words, 'H2009')) {
    out.push({
      id: 'behold',
      title: '“Look”',
      body: 'הִנֵּה (hinneh) means look or behold. It stops the line and points at what comes next.',
    })
  }
  if (hasStrongs(words, 'G3303') && hasStrongs(words, 'G1161')) {
    out.push({
      id: 'men-de',
      title: 'Two sides of one point',
      body: 'μέν (men) and δέ (de) set two parts side by side in this verse: one side, then the other.',
    })
  }
  const emphaticNot = hasOrderedPair(words, 'G3756', 'G3361') || hasStrongs(words, 'G3364')
    || (words || []).some(w => w.strongs === 'G3756' && /no wise|by no means|by any means/i.test(gloss(w)))
  if (emphaticNot) {
    out.push({
      id: 'ou-me',
      title: 'A stronger “not”',
      body: 'οὐ μή (ou me) is stronger than a plain not. It means this will certainly not happen.',
    })
  }
  if (hasStrongs(words, 'G3767')) {
    out.push({
      id: 'oun',
      title: '“Therefore”',
      body: 'οὖν (oun) means therefore or so. This verse follows from what was just said, as a conclusion or as the next thing that happened because of it.',
    })
  }
  if (hasStrongs(words, 'G1063')) {
    out.push({
      id: 'gar',
      title: '“For” — a reason',
      body: 'γάρ (gar) means for. It gives the reason for the line before it.',
    })
  }
  if (hasStrongs(words, 'G235')) {
    out.push({
      id: 'alla',
      title: 'A strong “but”',
      body: 'ἀλλά (alla) means but, and it is a firm one. It sets this statement against what came before.',
    })
  }
  if (hasStrongs(words, 'G2443')) {
    out.push({
      id: 'hina',
      title: '“So that”',
      body: 'ἵνα (hina) means so that or in order that. It marks the purpose of the action.',
    })
  }
  return out
}

export function detectPassageStyle({ bookId, chapter, verse, verses, bookName }) {
  const book = bookOf(bookId)
  const verseMap = {}
  for (const [key, words] of Object.entries(verses || {})) {
    const n = Number(key)
    if (Number.isInteger(n) && Array.isArray(words) && words.length > 0) verseMap[n] = words
  }
  if (!verseMap[verse]) return { patterns: [] }

  const connectiveRun = NARRATIVE_NT.has(book)
    ? findRun(verseMap, verse, (words) => {
      const id = words?.[0]?.strongs
      return id === 'G2532' || id === 'G1161'
    })
    : null

  const patterns = []
  const connective = greekConnective(verseMap, verse, book, bookName || book, chapter)
  if (connective) patterns.push(connective)
  const hebrew = hebrewAnd(verseMap, verse, book, bookName || book, chapter)
  if (hebrew) patterns.push(hebrew)
  const immediately = immediatePattern(verseMap, verse, book, connectiveRun && connectiveRun.full >= 3 ? connectiveRun : null)
  if (immediately) patterns.push(immediately)
  const present = historicalPresentPattern(verseMap, verse, book)
  if (present) patterns.push(present)
  patterns.push(...currentWordPatterns(verseMap[verse]))

  patterns.sort((a, b) => PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id))
  return { patterns: patterns.slice(0, 4) }
}
