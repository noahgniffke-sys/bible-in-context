// Bible study notes — Tyndale commentary (public domain)
// Modern, accessible study notes for in-depth verse understanding

const studyCache = {}

export async function getStudyNote(verseRef) {
  const bookId = verseRef.split('.')[0]

  if (!studyCache[bookId]) {
    try {
      const module = await import(`../data/study/${bookId.toLowerCase()}.json`)
      studyCache[bookId] = module.default || module
    } catch {
      studyCache[bookId] = {}
    }
  }

  return studyCache[bookId][verseRef] || null
}
