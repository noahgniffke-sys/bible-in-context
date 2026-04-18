// Jamieson-Fausset-Brown Commentary (public domain, 1871)
// Evangelical, non-denominational, verse-by-verse

const jfbCache = {}

export async function getJFBCommentary(verseRef) {
  const bookId = verseRef.split('.')[0]

  if (!jfbCache[bookId]) {
    try {
      const module = await import(`../data/jfb/${bookId.toLowerCase()}.json`)
      jfbCache[bookId] = module.default || module
    } catch {
      jfbCache[bookId] = {}
    }
  }

  return jfbCache[bookId][verseRef] || null
}
