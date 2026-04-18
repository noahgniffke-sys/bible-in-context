import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../hooks/useLocalStorage'
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
  const navigate = useNavigate()
  const confirm = useConfirm()

  const [notes, setNotes] = useLocalStorage('bic_notes_local', [])
  const [highlights, setHighlights] = useLocalStorage('bic_highlights_local', [])
  const [bookmarks, setBookmarks] = useLocalStorage('bic_bookmarks_local', [])

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
      setNotes(notes.filter(n => n.id !== id))
    }
  }

  async function handleDeleteBookmark(id) {
    triggerHaptic(HapticStyle.LIGHT)
    setBookmarks(bookmarks.filter(b => b.id !== id))
  }

  async function handleDeleteHighlight(id) {
    triggerHaptic(HapticStyle.LIGHT)
    setHighlights(highlights.filter(h => h.id !== id))
  }

  const sortedNotes = [...notes].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
  const sortedHighlights = [...highlights].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const sortedBookmarks = [...bookmarks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Study Tools</h2>

      <TabBar tabs={TOOL_TABS} activeTab={tab} onChange={setTab} />

      {/* Notes tab */}
      {tab === 'notes' && (
        sortedNotes.length > 0 ? (
          <div className="space-y-3">
            {sortedNotes.map(note => {
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
          <EmptyState
            emoji="📝"
            title="No Notes Yet"
            description="Tap any verse while reading to add your study notes."
            actionLabel="Start Reading"
            actionTo="/bible"
          />
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
