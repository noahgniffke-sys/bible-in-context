// All 66 books of the Bible with accurate chapter counts
// Book IDs follow API.Bible standard abbreviations

export const BIBLE_BOOKS = [
  // ── Old Testament (39 books) ──
  { id: 'GEN', name: 'Genesis', abbr: 'Gen', chapters: 50, testament: 'OT' },
  { id: 'EXO', name: 'Exodus', abbr: 'Exod', chapters: 40, testament: 'OT' },
  { id: 'LEV', name: 'Leviticus', abbr: 'Lev', chapters: 27, testament: 'OT' },
  { id: 'NUM', name: 'Numbers', abbr: 'Num', chapters: 36, testament: 'OT' },
  { id: 'DEU', name: 'Deuteronomy', abbr: 'Deut', chapters: 34, testament: 'OT' },
  { id: 'JOS', name: 'Joshua', abbr: 'Josh', chapters: 24, testament: 'OT' },
  { id: 'JDG', name: 'Judges', abbr: 'Judg', chapters: 21, testament: 'OT' },
  { id: 'RUT', name: 'Ruth', abbr: 'Ruth', chapters: 4, testament: 'OT' },
  { id: '1SA', name: '1 Samuel', abbr: '1 Sam', chapters: 31, testament: 'OT' },
  { id: '2SA', name: '2 Samuel', abbr: '2 Sam', chapters: 24, testament: 'OT' },
  { id: '1KI', name: '1 Kings', abbr: '1 Kgs', chapters: 22, testament: 'OT' },
  { id: '2KI', name: '2 Kings', abbr: '2 Kgs', chapters: 25, testament: 'OT' },
  { id: '1CH', name: '1 Chronicles', abbr: '1 Chr', chapters: 29, testament: 'OT' },
  { id: '2CH', name: '2 Chronicles', abbr: '2 Chr', chapters: 36, testament: 'OT' },
  { id: 'EZR', name: 'Ezra', abbr: 'Ezra', chapters: 10, testament: 'OT' },
  { id: 'NEH', name: 'Nehemiah', abbr: 'Neh', chapters: 13, testament: 'OT' },
  { id: 'EST', name: 'Esther', abbr: 'Esth', chapters: 10, testament: 'OT' },
  { id: 'JOB', name: 'Job', abbr: 'Job', chapters: 42, testament: 'OT' },
  { id: 'PSA', name: 'Psalms', abbr: 'Ps', chapters: 150, testament: 'OT' },
  { id: 'PRO', name: 'Proverbs', abbr: 'Prov', chapters: 31, testament: 'OT' },
  { id: 'ECC', name: 'Ecclesiastes', abbr: 'Eccl', chapters: 12, testament: 'OT' },
  { id: 'SNG', name: 'Song of Solomon', abbr: 'Song', chapters: 8, testament: 'OT' },
  { id: 'ISA', name: 'Isaiah', abbr: 'Isa', chapters: 66, testament: 'OT' },
  { id: 'JER', name: 'Jeremiah', abbr: 'Jer', chapters: 52, testament: 'OT' },
  { id: 'LAM', name: 'Lamentations', abbr: 'Lam', chapters: 5, testament: 'OT' },
  { id: 'EZK', name: 'Ezekiel', abbr: 'Ezek', chapters: 48, testament: 'OT' },
  { id: 'DAN', name: 'Daniel', abbr: 'Dan', chapters: 12, testament: 'OT' },
  { id: 'HOS', name: 'Hosea', abbr: 'Hos', chapters: 14, testament: 'OT' },
  { id: 'JOL', name: 'Joel', abbr: 'Joel', chapters: 3, testament: 'OT' },
  { id: 'AMO', name: 'Amos', abbr: 'Amos', chapters: 9, testament: 'OT' },
  { id: 'OBA', name: 'Obadiah', abbr: 'Obad', chapters: 1, testament: 'OT' },
  { id: 'JON', name: 'Jonah', abbr: 'Jonah', chapters: 4, testament: 'OT' },
  { id: 'MIC', name: 'Micah', abbr: 'Mic', chapters: 7, testament: 'OT' },
  { id: 'NAM', name: 'Nahum', abbr: 'Nah', chapters: 3, testament: 'OT' },
  { id: 'HAB', name: 'Habakkuk', abbr: 'Hab', chapters: 3, testament: 'OT' },
  { id: 'ZEP', name: 'Zephaniah', abbr: 'Zeph', chapters: 3, testament: 'OT' },
  { id: 'HAG', name: 'Haggai', abbr: 'Hag', chapters: 2, testament: 'OT' },
  { id: 'ZEC', name: 'Zechariah', abbr: 'Zech', chapters: 14, testament: 'OT' },
  { id: 'MAL', name: 'Malachi', abbr: 'Mal', chapters: 4, testament: 'OT' },

  // ── New Testament (27 books) ──
  { id: 'MAT', name: 'Matthew', abbr: 'Matt', chapters: 28, testament: 'NT' },
  { id: 'MRK', name: 'Mark', abbr: 'Mark', chapters: 16, testament: 'NT' },
  { id: 'LUK', name: 'Luke', abbr: 'Luke', chapters: 24, testament: 'NT' },
  { id: 'JHN', name: 'John', abbr: 'John', chapters: 21, testament: 'NT' },
  { id: 'ACT', name: 'Acts', abbr: 'Acts', chapters: 28, testament: 'NT' },
  { id: 'ROM', name: 'Romans', abbr: 'Rom', chapters: 16, testament: 'NT' },
  { id: '1CO', name: '1 Corinthians', abbr: '1 Cor', chapters: 16, testament: 'NT' },
  { id: '2CO', name: '2 Corinthians', abbr: '2 Cor', chapters: 13, testament: 'NT' },
  { id: 'GAL', name: 'Galatians', abbr: 'Gal', chapters: 6, testament: 'NT' },
  { id: 'EPH', name: 'Ephesians', abbr: 'Eph', chapters: 6, testament: 'NT' },
  { id: 'PHP', name: 'Philippians', abbr: 'Phil', chapters: 4, testament: 'NT' },
  { id: 'COL', name: 'Colossians', abbr: 'Col', chapters: 4, testament: 'NT' },
  { id: '1TH', name: '1 Thessalonians', abbr: '1 Thess', chapters: 5, testament: 'NT' },
  { id: '2TH', name: '2 Thessalonians', abbr: '2 Thess', chapters: 3, testament: 'NT' },
  { id: '1TI', name: '1 Timothy', abbr: '1 Tim', chapters: 6, testament: 'NT' },
  { id: '2TI', name: '2 Timothy', abbr: '2 Tim', chapters: 4, testament: 'NT' },
  { id: 'TIT', name: 'Titus', abbr: 'Titus', chapters: 3, testament: 'NT' },
  { id: 'PHM', name: 'Philemon', abbr: 'Phlm', chapters: 1, testament: 'NT' },
  { id: 'HEB', name: 'Hebrews', abbr: 'Heb', chapters: 13, testament: 'NT' },
  { id: 'JAS', name: 'James', abbr: 'Jas', chapters: 5, testament: 'NT' },
  { id: '1PE', name: '1 Peter', abbr: '1 Pet', chapters: 5, testament: 'NT' },
  { id: '2PE', name: '2 Peter', abbr: '2 Pet', chapters: 3, testament: 'NT' },
  { id: '1JN', name: '1 John', abbr: '1 John', chapters: 5, testament: 'NT' },
  { id: '2JN', name: '2 John', abbr: '2 John', chapters: 1, testament: 'NT' },
  { id: '3JN', name: '3 John', abbr: '3 John', chapters: 1, testament: 'NT' },
  { id: 'JUD', name: 'Jude', abbr: 'Jude', chapters: 1, testament: 'NT' },
  { id: 'REV', name: 'Revelation', abbr: 'Rev', chapters: 22, testament: 'NT' },
]

export const OT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'OT')
export const NT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'NT')

export function getBookById(bookId) {
  return BIBLE_BOOKS.find(b => b.id === bookId)
}

export function getBookByName(name) {
  const lower = name.toLowerCase()
  return BIBLE_BOOKS.find(b =>
    b.name.toLowerCase() === lower ||
    b.abbr.toLowerCase() === lower ||
    b.id.toLowerCase() === lower
  )
}

// Format a verse reference for display: "Genesis 1:1"
export function formatVerseRef(bookId, chapter, verse) {
  const book = getBookById(bookId)
  if (!book) return `${bookId} ${chapter}:${verse}`
  return `${book.name} ${chapter}:${verse}`
}

// Format a chapter reference for display: "Genesis 1"
export function formatChapterRef(bookId, chapter) {
  const book = getBookById(bookId)
  if (!book) return `${bookId} ${chapter}`
  return `${book.name} ${chapter}`
}

// Parse a verse reference string: "GEN.1.1" -> { bookId, chapter, verse }
export function parseVerseRef(ref) {
  const parts = ref.split('.')
  if (parts.length === 3) {
    return { bookId: parts[0], chapter: parseInt(parts[1]), verse: parseInt(parts[2]) }
  }
  if (parts.length === 2) {
    return { bookId: parts[0], chapter: parseInt(parts[1]), verse: null }
  }
  return { bookId: ref, chapter: null, verse: null }
}

// Build a verse reference string: { bookId: "GEN", chapter: 1, verse: 1 } -> "GEN.1.1"
export function buildVerseRef(bookId, chapter, verse) {
  if (verse != null) return `${bookId}.${chapter}.${verse}`
  return `${bookId}.${chapter}`
}

const NUMBER_WORDS = [
  ['1', '1', 'i', 'first', '1st'],
  ['2', '2', 'ii', 'second', '2nd'],
  ['3', '3', 'iii', 'third', '3rd'],
]

const EXTRA_ALIASES = {
  psalm: 'PSA',
  psalms: 'PSA',
  ps: 'PSA',
  'song of songs': 'SNG',
  'song of solomon': 'SNG',
  canticles: 'SNG',
  revelations: 'REV',
  apocalypse: 'REV',
  john: 'JHN',
  jn: 'JHN',
  joh: 'JHN',
  'gospel of john': 'JHN',
  'gospel of matthew': 'MAT',
  'gospel of mark': 'MRK',
  'gospel of luke': 'LUK',
  matt: 'MAT',
  mk: 'MRK',
  lk: 'LUK',
  'acts of the apostles': 'ACT',
}

let aliasList = null

function editDistance(a, b) {
  if (a === b) return 0
  const la = a.length
  const lb = b.length
  if (Math.abs(la - lb) > 2) return 3
  const dp = Array.from({ length: la + 1 }, () => new Array(lb + 1).fill(0))
  for (let i = 0; i <= la; i++) dp[i][0] = i
  for (let j = 0; j <= lb; j++) dp[0][j] = j
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1)
      }
    }
  }
  return dp[la][lb]
}

function aliasEntries() {
  if (aliasList) return aliasList
  const map = new Map()
  function add(alias, id) {
    const key = alias.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim()
    if (!key || map.has(key)) return
    if (key.length < 3 && key !== 'ps' && key !== 'jn') return
    map.set(key, id)
  }

  for (const book of BIBLE_BOOKS) {
    add(book.name, book.id)
    add(book.abbr, book.id)
    add(book.id, book.id)
    add(book.name.replace(/\s+/g, ''), book.id)
    const numbered = book.name.match(/^([123])\s+(.+)$/)
    if (numbered) {
      const forms = NUMBER_WORDS[Number(numbered[1]) - 1] || []
      for (const form of forms) add(`${form} ${numbered[2]}`, book.id)
      add(`${numbered[1]}${numbered[2]}`, book.id)
      add(`${numbered[1]}${numbered[2].replace(/\s+/g, '')}`, book.id)
    }
  }
  for (const [alias, id] of Object.entries(EXTRA_ALIASES)) add(alias, id)

  aliasList = [...map.entries()]
    .map(([alias, id]) => ({ alias, id }))
    .sort((a, b) => b.alias.length - a.alias.length)
  return aliasList
}

function numbersAfter(rest) {
  const nums = (rest.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(n => n > 0)
  return nums
}

function pack(bookId, nums) {
  const book = getBookById(bookId)
  if (!book || !nums.length) return { bookId, chapter: null, verse: null, verseEnd: null }
  const chapter = nums[0]
  if (chapter > book.chapters) return null
  const verse = nums[1] || null
  const verseEnd = nums[2] && nums[2] >= (verse || 0) ? nums[2] : null
  return { bookId, chapter, verse, verseEnd }
}

// Turn "jn 3:16", "jonh 3 16", "psalm 23", or "1 cor 13:4" into a passage.
// Returns null when the text is not a reference.
export function parseReadingQuery(raw) {
  if (!raw || typeof raw !== 'string') return null
  let q = raw.toLowerCase().replace(/[’']/g, '')
  q = q.replace(/[._:;,/|]+/g, ' ')
  q = q.replace(/(\d)\s*[-–—]\s*(\d)/g, '$1 $2')
  q = q.replace(/([a-z])(\d)/g, '$1 $2')
  q = q.replace(/\b([123])(?=[a-z])/g, '$1 ')
  q = q.replace(/\s+/g, ' ').trim()
  if (!q) return null

  const aliases = aliasEntries()

  for (const { alias, id } of aliases) {
    if (q === alias || q.startsWith(`${alias} `)) {
      return pack(id, numbersAfter(q.slice(alias.length))) || null
    }
  }

  for (const { alias, id } of aliases) {
    const idx = q.indexOf(alias)
    if (idx < 0) continue
    const before = idx === 0 ? '' : q[idx - 1]
    if (before && before !== ' ') continue
    const prefix = q.slice(0, idx).trim()
    if (/\d$/.test(prefix)) continue
    const after = q.slice(idx + alias.length).trim()
    if (!/^\d/.test(after)) continue
    const hit = pack(id, numbersAfter(after))
    if (hit?.chapter) return hit
  }

  const parts = q.split(' ')
  if (parts.length >= 2 && /^\d+$/.test(parts[1]) && parts[0].length >= 4) {
    let best = null
    let bestScore = 99
    for (const entry of aliases) {
      if (entry.alias.includes(' ')) continue
      if (Math.abs(entry.alias.length - parts[0].length) > 2) continue
      const d = editDistance(parts[0], entry.alias)
      if (d === 0 || d > 1) continue
      const score = d * 10 + Math.abs(entry.alias.length - parts[0].length)
      if (score < bestScore) {
        bestScore = score
        best = entry
      } else if (score === bestScore) {
        const bestSame = best && best.alias.split('').sort().join('') === parts[0].split('').sort().join('')
        const nextSame = entry.alias.split('').sort().join('') === parts[0].split('').sort().join('')
        if (nextSame && !bestSame) best = entry
        else if (!(bestSame && !nextSame)) best = null
      }
    }
    if (best) return pack(best.id, numbersAfter(parts.slice(1).join(' ')))
  }

  return null
}
