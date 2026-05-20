import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useUserData from '../hooks/useUserData'
import { useAuth } from '../hooks/useAuth'
import { parseVerseRef, formatVerseRef } from '../lib/bible-books'
import { formatTimeAgo } from '../lib/utils'
import EmptyState from '../components/EmptyState'
import TabBar from '../components/TabBar'
import { triggerHaptic, HapticStyle } from '../lib/haptics'
import { useConfirm } from '../components/ConfirmDialog'

const TOOL_TABS = [
  { key: 'notes', label: 'Notes' },
  { key: 'highlights', label: 'Highlights' },
  { key: 'bookmarks', label: 'Bookmarks' },
]

function Notes() {
  const [tab, setTab] = useState('notes')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { user } = useAuth()

  const { items: notes, remove: removeNote, syncing: notesSyncing } = useUserData('notes')
  const { items: highlights, remove: removeHighlight } = useUserData('highlights')
  const { items: bookmarks, remove: removeBookmark } = useUserData('bookmarks')

  function handleVerseNav(verseRef) {
    triggerHaptic(HapticStyle.LIGHT)
    const parsed = parseVerseRef(verseRef)
    if (parsed.verse) {
      navigate(`/bible/${parsed.bookId}/${parsed.chapter}/${parsed.verse}`)
    }
  }

  async function handleDeleteNote(id) {
    const yes = await confirm({
      title: 'Delete Note',
      message: 'This note will be permanently deleted.',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (yes) {
      triggerHaptic(HapticStyle.ERROR)
      removeNote(id)
    }
  }

  function handleDeleteBookmark(id) {
    triggerHaptic(HapticStyle.LIGHT)
    removeBookmark(id)
  }

  function handleDeleteHighlight(id) {
    triggerHaptic(HapticStyle.LIGHT)
    removeHighlight(id)
  }

  const q = query.trim().toLowerCase()
  const matchesQuery = (text) => !q || (text || '').toLowerCase().includes(q)

  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => matchesQuery(n.content) || matchesQuery(n.verse_ref) || matchesQuery(n.verse_text))
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
  }, [notes, q])

  const sortedHighlights = useMemo(
    () => [...highlights].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [highlights]
  )
  const sortedBookmarks = useMemo(
    () => [...bookmarks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [bookmarks]
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Study Tools</h2>
        {user && notesSyncing && (
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
            Syncing
          </span>
        )}
      </div>

      <TabBar tabs={TOOL_TABS} activeTab={tab} onChange={setTab} />

      {/* Search bar — only on notes tab */}
      {tab === 'notes' && (
        <div className="mb-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your notes..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-secondary)]"
          />
        </div>
      )}

      {/* Notes tab */}
      {tab === 'notes' && (
        filteredNotes.length > 0 ? (
          <div className="space-y-3">
            {filteredNotes.map(note => {
              const parsed = parseVerseRef(note.verse_ref)
              return (
                <div key={note.id} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <button
                      onClick={() => handleVerseNav(note.verse_ref)}
                      className="text-sm font-bold text-[var(--accent-secondary)] min-h-[auto] min-w-[auto]"
                    >
                      {formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-xs text-[var(--text-muted)] min-h-[auto] min-w-[auto] p-1"
                    >
                      {'✕'}
                    </button>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-2">{note.content}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatTimeAgo(note.updated_at || note.created_at)}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          q ? (
            <EmptyState
              emoji="🔍"
              title="No matching notes"
              description={`No notes matched "${query}". Try a different search.`}
            />
          ) : (
            <EmptyState
              emoji="📝"
              title="No Notes Yet"
              description="Tap any verse while reading to add your study notes."
              actionLabel="Start Reading"
              actionTo="/bible"
            />
          )
        )
      )}

      {/* Highlights tab */}
      {tab === 'highlights' && (
        sortedHighlights.length > 0 ? (
          <div className="space-y-2">
            {sortedHighlights.map(h => {
              const parsed = parseVerseRef(h.verse_ref)
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border-primary)]"
                  style={{ backgroundColor: h.color }}
                >
                  <button
                    onClick={() => handleVerseNav(h.verse_ref)}
                    className="flex-1 text-left min-h-[auto] min-w-[auto]"
                  >
                    <p className="text-sm font-bold text-[var(--accent-secondary)]">
                      {formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                    </p>
                    {h.verse_text && (
                      <p className="text-xs text-[var(--text-primary)] mt-1 line-clamp-2">{h.verse_text}</p>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteHighlight(h.id)}
                    className="text-xs text-[var(--text-muted)] min-h-[auto] min-w-[auto] p-1"
                  >
                    {'✕'}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            emoji="🎨"
            title="No Highlights Yet"
            description="Highlight verses while reading to save them here."
            actionLabel="Start Reading"
            actionTo="/bible"
          />
        )
      )}

      {/* Bookmarks tab */}
      {tab === 'bookmarks' && (
        sortedBookmarks.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-muted)] mb-1">
              {sortedBookmarks.length}/5 bookmarks used
            </p>
            {sortedBookmarks.map(b => {
              const parsed = parseVerseRef(b.verse_ref)
              return (
                <div
                  key={b.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl px-4 py-3"
                >
                  <div className="flex items-start justify-between mb-1">
                    <button
                      onClick={() => handleVerseNav(b.verse_ref)}
                      className="flex-1 text-left min-h-[auto] min-w-[auto]"
                    >
                      {b.label && (
                        <p className="text-sm font-bold text-[var(--gold-accent)] mb-1">🔖 {b.label}</p>
                      )}
                      <p className="text-sm font-medium text-[var(--accent-secondary)]">
                        {formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                      </p>
                      {b.verse_text && (
                        <p className="text-xs text-[var(--text-primary)] mt-1 line-clamp-2 italic">"{b.verse_text}"</p>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteBookmark(b.id)}
                      className="text-xs text-[var(--text-muted)] min-h-[auto] min-w-[auto] p-1 ml-2"
                    >
                      {'✕'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            emoji="🔖"
            title="No Bookmarks Yet"
            description="Bookmark verses to quickly find them later."
            actionLabel="Start Reading"
            actionTo="/bible"
          />
        )
      )}
    </div>
  )
}

export default Notes
