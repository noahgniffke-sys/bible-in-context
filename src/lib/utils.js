// Expand abbreviated book names in commentary text to full names
const BOOK_ABBR_TO_FULL = {
  'Gen': 'Genesis', 'Ge': 'Genesis', 'Gn': 'Genesis',
  'Exod': 'Exodus', 'Exo': 'Exodus', 'Ex': 'Exodus',
  'Lev': 'Leviticus', 'Le': 'Leviticus', 'Lv': 'Leviticus',
  'Num': 'Numbers', 'Nu': 'Numbers', 'Nm': 'Numbers',
  'Deut': 'Deuteronomy', 'Deu': 'Deuteronomy', 'Dt': 'Deuteronomy',
  'Josh': 'Joshua', 'Jos': 'Joshua',
  'Judg': 'Judges', 'Jdg': 'Judges', 'Jg': 'Judges',
  'Ru': 'Ruth', 'Rut': 'Ruth',
  '1 Sam': '1 Samuel', '1Sam': '1 Samuel', '1Sa': '1 Samuel',
  '2 Sam': '2 Samuel', '2Sam': '2 Samuel', '2Sa': '2 Samuel',
  '1 Kgs': '1 Kings', '1Kgs': '1 Kings', '1Ki': '1 Kings', '1 Ki': '1 Kings',
  '2 Kgs': '2 Kings', '2Kgs': '2 Kings', '2Ki': '2 Kings', '2 Ki': '2 Kings',
  '1 Chr': '1 Chronicles', '1Chr': '1 Chronicles', '1Ch': '1 Chronicles', '1 Ch': '1 Chronicles',
  '2 Chr': '2 Chronicles', '2Chr': '2 Chronicles', '2Ch': '2 Chronicles', '2 Ch': '2 Chronicles',
  'Ezr': 'Ezra',
  'Neh': 'Nehemiah', 'Ne': 'Nehemiah',
  'Esth': 'Esther', 'Est': 'Esther', 'Es': 'Esther',
  'Ps': 'Psalm', 'Pss': 'Psalms', 'Psa': 'Psalm',
  'Prov': 'Proverbs', 'Pro': 'Proverbs', 'Pr': 'Proverbs',
  'Eccl': 'Ecclesiastes', 'Ecc': 'Ecclesiastes', 'Ec': 'Ecclesiastes',
  'Song': 'Song of Solomon', 'SS': 'Song of Solomon', 'SOS': 'Song of Solomon',
  'Isa': 'Isaiah', 'Is': 'Isaiah',
  'Jer': 'Jeremiah', 'Je': 'Jeremiah',
  'Lam': 'Lamentations', 'La': 'Lamentations',
  'Ezek': 'Ezekiel', 'Eze': 'Ezekiel', 'Ezk': 'Ezekiel',
  'Dan': 'Daniel', 'Da': 'Daniel', 'Dn': 'Daniel',
  'Hos': 'Hosea', 'Ho': 'Hosea',
  'Joe': 'Joel', 'Jol': 'Joel',
  'Amo': 'Amos', 'Am': 'Amos',
  'Obad': 'Obadiah', 'Oba': 'Obadiah', 'Ob': 'Obadiah',
  'Jon': 'Jonah', 'Jnh': 'Jonah',
  'Mic': 'Micah', 'Mi': 'Micah',
  'Nah': 'Nahum', 'Na': 'Nahum',
  'Hab': 'Habakkuk',
  'Zeph': 'Zephaniah', 'Zep': 'Zephaniah',
  'Hag': 'Haggai',
  'Zech': 'Zechariah', 'Zec': 'Zechariah',
  'Mal': 'Malachi',
  'Matt': 'Matthew', 'Mat': 'Matthew', 'Mt': 'Matthew',
  'Mk': 'Mark', 'Mrk': 'Mark', 'Mr': 'Mark',
  'Luk': 'Luke', 'Lk': 'Luke', 'Lu': 'Luke',
  'Jn': 'John', 'Jhn': 'John',
  'Ac': 'Acts', 'Act': 'Acts',
  'Rom': 'Romans', 'Ro': 'Romans',
  '1 Cor': '1 Corinthians', '1Cor': '1 Corinthians', '1Co': '1 Corinthians',
  '2 Cor': '2 Corinthians', '2Cor': '2 Corinthians', '2Co': '2 Corinthians',
  'Gal': 'Galatians', 'Ga': 'Galatians',
  'Eph': 'Ephesians',
  'Phil': 'Philippians', 'Php': 'Philippians',
  'Col': 'Colossians',
  '1 Thess': '1 Thessalonians', '1Thess': '1 Thessalonians', '1Th': '1 Thessalonians', '1 Th': '1 Thessalonians',
  '2 Thess': '2 Thessalonians', '2Thess': '2 Thessalonians', '2Th': '2 Thessalonians', '2 Th': '2 Thessalonians',
  '1 Tim': '1 Timothy', '1Tim': '1 Timothy', '1Ti': '1 Timothy',
  '2 Tim': '2 Timothy', '2Tim': '2 Timothy', '2Ti': '2 Timothy',
  'Tit': 'Titus',
  'Phlm': 'Philemon', 'Phm': 'Philemon', 'Philem': 'Philemon',
  'Heb': 'Hebrews',
  'Jas': 'James', 'Jam': 'James',
  '1 Pet': '1 Peter', '1Pet': '1 Peter', '1Pe': '1 Peter',
  '2 Pet': '2 Peter', '2Pet': '2 Peter', '2Pe': '2 Peter',
  '1 Jn': '1 John', '1Jn': '1 John', '1 John': '1 John',
  '2 Jn': '2 John', '2Jn': '2 John', '2 John': '2 John',
  '3 Jn': '3 John', '3Jn': '3 John', '3 John': '3 John',
  'Jud': 'Jude',
  'Rev': 'Revelation', 'Re': 'Revelation',
}

export function expandBookNames(text) {
  if (!text) return text
  // Sort abbreviations longest first so "1 Sam" matches before "1 S"
  const abbrs = Object.keys(BOOK_ABBR_TO_FULL).sort((a, b) => b.length - a.length)
  let result = text
  for (const abbr of abbrs) {
    // Match abbreviation followed by a space and chapter number (e.g. "Gen 1:1" or "Gen. 1:1")
    const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\.?\\s+(\\d)`, 'g')
    result = result.replace(regex, `${BOOK_ABBR_TO_FULL[abbr]} $1`)
  }
  return result
}

export function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
