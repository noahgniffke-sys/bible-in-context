import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBible, getTranslation, getTranslationName, AVAILABLE_TRANSLATIONS } from '../lib/bible-api'
import { parseVerseRef, formatVerseRef } from '../lib/bible-books'
import ErrorBanner from '../components/ErrorBanner'
import EmptyState from '../components/EmptyState'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchAll, setSearchAll] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const translation = getTranslation()

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return

    triggerHaptic(HapticStyle.LIGHT)
    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      if (searchAll) {
        // Search across all translations and merge results
        const allResults = []
        const seen = new Set()
        for (const t of AVAILABLE_TRANSLATIONS) {
          const data = await searchBible(query.trim(), t, 15)
          for (const v of (data.verses || [])) {
            if (!seen.has(v.ref)) {
              seen.add(v.ref)
              allResults.push({ ...v, translation: t })
            }
          }
        }
        allResults.sort((a, b) => (b.score || 0) - (a.score || 0))
        setResults(allResults.slice(0, 30))
      } else {
        const data = await searchBible(query.trim(), translation, 30)
        setResults((data.verses || []).map(v => ({ ...v, translation })))
      }
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleResultTap(result) {
    triggerHaptic(HapticStyle.LIGHT)
    const parsed = parseVerseRef(result.ref)
    if (parsed.verse) {
      navigate(`/bible/${parsed.bookId}/${parsed.chapter}/${parsed.verse}`)
    } else if (parsed.chapter) {
      navigate(`/bible/${parsed.bookId}/${parsed.chapter}`)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Search</h2>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verses, topics, words..."
            className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-secondary)]"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-3 bg-[var(--accent-secondary)] text-white rounded-xl font-medium text-sm disabled:opacity-50 active:scale-95 min-w-[60px]"
          >
            {loading ? '...' : 'Go'}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-[var(--text-muted)]">
            {searchAll ? 'Searching all translations' : `Searching ${getTranslationName(translation)}`}
          </p>
          <button
            type="button"
            onClick={() => { setSearchAll(!searchAll); triggerHaptic(HapticStyle.LIGHT) }}
            className={`text-xs px-2 py-1 rounded-full min-h-[auto] min-w-[auto] ${
              searchAll
                ? 'bg-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-primary)]'
            }`}
          >
            {searchAll ? 'All translations' : 'Search all'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1 italic">
          Handles misspellings and partial words
        </p>
      </form>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 shimmer rounded-xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-[var(--text-muted)] mb-2">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((result, idx) => {
            const parsed = parseVerseRef(result.ref)
            return (
              <button
                key={idx}
                onClick={() => handleResultTap(result)}
                className="w-full text-left bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-[var(--accent-secondary)]">
                    {result.reference || formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                  </p>
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full">
                    {result.translation}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed line-clamp-3">
                  {result.text}
                </p>
              </button>
            )
          })}
        </div>
      ) : hasSearched && !error ? (
        <EmptyState
          emoji="🔍"
          title="No results found"
          description={`No matches for "${query}". Try different keywords or turn on "Search all" to check every translation.`}
        />
      ) : !hasSearched ? (
        <EmptyState
          emoji="📖"
          title="Search the Bible"
          description="Enter a word, phrase, or topic to find relevant verses. Handles misspellings too."
        />
      ) : null}
    </div>
  )
}

export default Search
