import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OT_BOOKS, NT_BOOKS, getBookById } from '../lib/bible-books'
import TabBar from '../components/TabBar'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const TABS = [
  { key: 'OT', label: 'Old Testament' },
  { key: 'NT', label: 'New Testament' },
]

function BibleIndex() {
  const [tab, setTab] = useState('OT')
  const [expandedBook, setExpandedBook] = useState(null)
  const navigate = useNavigate()

  // Check for saved reading position
  const lastBook = localStorage.getItem('bic_last_book')
  const lastChapter = localStorage.getItem('bic_last_chapter')
  const lastVerse = localStorage.getItem('bic_last_verse')
  const lastBookInfo = lastBook ? getBookById(lastBook) : null

  const books = tab === 'OT' ? OT_BOOKS : NT_BOOKS

  function handleBookTap(bookId) {
    triggerHaptic(HapticStyle.LIGHT)
    setExpandedBook(expandedBook === bookId ? null : bookId)
  }

  function handleChapterTap(bookId, chapter) {
    triggerHaptic(HapticStyle.MEDIUM)
    navigate(`/bible/${bookId}/${chapter}`)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Bible</h2>

      {/* Resume reading banner */}
      {lastBookInfo && lastChapter && (
        <button
          onClick={() => {
            triggerHaptic(HapticStyle.MEDIUM)
            if (lastVerse) navigate(`/bible/${lastBook}/${lastChapter}/${lastVerse}`)
            else navigate(`/bible/${lastBook}/${lastChapter}`)
          }}
          className="w-full bg-[var(--accent-secondary)] text-white rounded-xl px-4 py-3 mb-4 text-left active:scale-[0.98]"
        >
          <p className="text-sm font-bold">Continue Reading</p>
          <p className="text-xs opacity-80">
            {lastBookInfo.name} {lastChapter}{lastVerse ? `:${lastVerse}` : ''}
          </p>
        </button>
      )}

      <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />

      <div className="space-y-1">
        {books.map((book) => (
          <div key={book.id}>
            {/* Book row */}
            <button
              onClick={() => handleBookTap(book.id)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-muted)] w-8 text-right font-mono">
                  {book.chapters}
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {book.name}
                </span>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
                  expandedBook === book.id ? 'rotate-90' : ''
                }`}
              >
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Chapter grid */}
            {expandedBook === book.id && (
              <div className="grid grid-cols-6 gap-2 p-3 bg-[var(--bg-surface)] rounded-b-lg border-x border-b border-[var(--border-subtle)] fade-in-up">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => handleChapterTap(book.id, ch)}
                    className="py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--accent-primary)] hover:text-white hover:border-[var(--accent-primary)] active:scale-90 transition-all"
                  >
                    {ch}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BibleIndex
