// Treasury of Scripture Knowledge — Cross-reference lookup
// TSK is public domain. Data files are loaded per-book via dynamic import.
// Run `node scripts/prepare-data.js` to download and split TSK data.

const tskCache = {}

export async function getCrossReferences(verseRef) {
  const bookId = verseRef.split('.')[0]

  if (!tskCache[bookId]) {
    try {
      const module = await import(`../data/tsk/${bookId.toLowerCase()}.json`)
      tskCache[bookId] = module.default || module
    } catch {
      // TSK data not yet downloaded for this book
      tskCache[bookId] = {}
    }
  }

  return tskCache[bookId][verseRef] || []
}

// Get cross-references with book names for display
export async function getCrossReferencesWithNames(verseRef) {
  const refs = await getCrossReferences(verseRef)
  // Each ref is a string like "JHN.1.1" or an object { ref, text }
  return refs.map(r => typeof r === 'string' ? r : r.ref || r)
}
