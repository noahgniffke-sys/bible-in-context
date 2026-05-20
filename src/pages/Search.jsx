import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBible, getTranslation, getTranslationName, AVAILABLE_TRANSLATIONS } from '../lib/bible-api'
import { parseVerseRef, formatVerseRef } from '../lib/bible-books'
import { supabase } from '../lib/supabase'
import ErrorBanner from '../components/ErrorBanner'
import EmptyState from '../components/EmptyState'
import TabBar from '../components/TabBar'
import VerifiedBadge from '../components/VerifiedBadge'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const SEARCH_TABS = [
  { key: 'verses', label: 'Verses' },
  { key: 'people', label: 'People' },
]

function Search() {
  const [tab, setTab] = useState('verses')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [userResults, setUserResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchAll, setSearchAll] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const translation = getTranslation()

  // Debounced user search — fires on every keystroke when on People tab.
  useEffect(() => {
    if (tab !== 'people') return
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setUserResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        // Escape PostgREST wildcards so user input can't break the pattern.
        const safe = trimmed.replace(/[%_\\]/g, (c) => '\\' + c)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, followers_count, bio')
          .eq('is_public', true)
          .or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%`)
          .limit(25)
        if (cancelled) return
        if (error) throw error
        setUserResults(data || [])
        setHasSearched(true)
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setUserResults([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query, tab])

  async function handleVerseSearch(e) {
    e.preventDefault()
    if (tab !== 'verses' || !query.trim()) return

    triggerHaptic(HapticStyle.LIGHT)
    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      if (searchAll) {
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

  function openUser(username) {
    triggerHaptic(HapticStyle.LIGHT)
    navigate(`/u/${username}`)
  }

  return (
    <div className="p-4">
      <h2 className="display text-2xl text-[var(--text-primary)] mb-4">Search</h2>

      <TabBar tabs={SEARCH_TABS} activeTab={tab} onChange={(k) => { setTab(k); setHasSearched(false); setError(null); setResults([]); setUserResults([]) }} />

      {/* Search form */}
      <form onSubmit={handleVerseSearch} className="mb-4 mt-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'verses' ? 'Search verses, topics, words...' : 'Search by username or name...'}
            className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-secondary)]"
          />
          {tab === 'verses' && (
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-3 bg-[var(--accent-secondary)] text-white rounded-xl font-medium text-sm disabled:opacity-50 active:scale-95 min-w-[60px]"
            >
              {loading ? '...' : 'Go'}
            </button>
          )}
        </div>
        {tab === 'verses' && (
          <>
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
          </>
        )}
      </form>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {/* Verses tab */}
      {tab === 'verses' && (
        loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (<div key={i} className="h-20 shimmer rounded-xl" />))}
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
            description={`No matches for "${query}". Try different keywords or turn on "Search all".`}
          />
        ) : !hasSearched ? (
          <EmptyState
            emoji="📖"
            title="Search the Bible"
            description="Enter a word, phrase, or topic to find relevant verses. Handles misspellings too."
          />
        ) : null
      )}

      {/* People tab */}
      {tab === 'people' && (
        loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (<div key={i} className="h-16 shimmer rounded-xl" />))}
          </div>
        ) : userResults.length > 0 ? (
          <div className="space-y-2">
            {userResults.map(u => (
              <button
                key={u.id}
                onClick={() => openUser(u.username)}
                className="w-full flex items-center gap-3 text-left bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-3 active:scale-[0.98] transition-transform"
              >
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-secondary)] flex items-center justify-center text-white font-bold">
                    {(u.display_name || u.username || '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{u.display_name || u.username}</p>
                    <VerifiedBadge username={u.username} size={12} />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">@{u.username} · {u.followers_count || 0} followers</p>
                  {u.bio && <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{u.bio}</p>}
                </div>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[var(--text-muted)]">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        ) : hasSearched && query.trim().length >= 2 ? (
          <EmptyState emoji="🔍" title="No users found" description={`No matches for "${query}".`} />
        ) : (
          <EmptyState emoji="👥" title="Find people" description="Type 2+ characters to search by username or name." />
        )
      )}
    </div>
  )
}

export default Search
