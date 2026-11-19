// Commentary lookup — John Gill's Exposition (public domain). The verse page calls this Deeper study.
// Data files are loaded per-book via dynamic import.
// Run `node scripts/prepare-data.js` to download and split commentary data.

const commentaryCache = {}

export async function getCommentary(verseRef) {
  const bookId = verseRef.split('.')[0]

  if (!commentaryCache[bookId]) {
    try {
      const module = await import(`../data/commentary/${bookId.toLowerCase()}.json`)
      commentaryCache[bookId] = module.default || module
    } catch {
      commentaryCache[bookId] = {}
    }
  }

  // Try exact verse match first, then chapter-level
  const chapterRef = verseRef.split('.').slice(0, 2).join('.')
  return commentaryCache[bookId][verseRef] || commentaryCache[bookId][chapterRef] || null
}
