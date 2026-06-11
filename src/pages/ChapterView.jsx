import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBookById, formatChapterRef } from '../lib/bible-books'
import { expandBookNames } from '../lib/utils'
import { getChapter, getTranslation, setTranslation, getTranslationName, getTranslationDescription, AVAILABLE_TRANSLATIONS } from '../lib/bible-api'
import { getStudyNote } from '../lib/study'
import { getCommentary } from '../lib/commentary'
import { getJFBCommentary } from '../lib/jfb'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'
import useUserData from '../hooks/useUserData'
import useLocalStorage from '../hooks/useLocalStorage'
import { VERSE_FONT_SIZES, DEFAULT_FONT_SIZE_INDEX, clampFontSizeIndex, applyVerseFontSize } from '../lib/fontSize'

function ChapterView() {
  const { bookId, chapter } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const chapterNum = parseInt(chapter)
  const book = getBookById(bookId)
  const [currentTranslation, setCurrentTranslation] = useState(getTranslation())

  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copyright, setCopyright] = useState('')
  const [chapterSummary, setChapterSummary] = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const [showCommentary, setShowCommentary] = useState(false)
  const [verseCommentaries, setVerseCommentaries] = useState({})
  const [showTranslationPicker, setShowTranslationPicker] = useState(false)
  const [fontSizeIdx, setFontSizeIdx] = useLocalStorage('bic_font_size', DEFAULT_FONT_SIZE_INDEX)

  // Ref mirror so fetchChapter can read the toggle without depending on it
  // (a dep would refetch the whole chapter every time commentary is toggled).
  const showCommentaryRef = useRef(showCommentary)
  useEffect(() => { showCommentaryRef.current = showCommentary }, [showCommentary])

  useEffect(() => { applyVerseFontSize(fontSizeIdx) }, [fontSizeIdx])

  function changeFontSize(delta) {
    triggerHaptic(HapticStyle.LIGHT)
    setFontSizeIdx(clampFontSizeIndex(fontSizeIdx + delta))
  }

  // Multi-select state
  const [selectedVerses, setSelectedVerses] = useState(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  const { items: highlights, add: addHighlight, update: updateHighlight } = useUserData('highlights')
  const { items: notes } = useUserData('notes')
  const { items: bookmarks, add: addBookmark, remove: removeBookmark } = useUserData('bookmarks')

  const chapterRef = `${bookId}.${chapterNum}`
  const existingBookmark = bookmarks.find(b => b.verse_ref === chapterRef)

  function toggleBookmark() {
    triggerHaptic(HapticStyle.LIGHT)
    if (existingBookmark) {
      removeBookmark(existingBookmark.id)
      toast.success('Bookmark removed')
      return
    }
    if (bookmarks.length >= 5) {
      toast.error('You can save up to 5 bookmarks. Delete one to add another.')
      return
    }
    addBookmark({ verse_ref: chapterRef })
    toast.success('Chapter bookmarked')
  }

  const fetchChapter = useCallback(async () => {
    setLoading(true)
    setError(null)
    setShowSummary(false)
    setVerseCommentaries({})
    setSelectedVerses(new Set())
    setSelectionMode(false)
    try {
      const data = await getChapter(bookId, chapterNum, currentTranslation)
      setVerses(data.verses || [])
      setCopyright(data.copyright || '')

      try {
        const summaryModule = await import(`../data/chapter-summaries/${bookId.toLowerCase()}.json`)
        const summaryData = summaryModule.default || summaryModule
        setChapterSummary(summaryData[String(chapterNum)] || null)
      } catch {
        setChapterSummary(null)
      }

      // Save reading position
      localStorage.setItem('bic_last_book', bookId)
      localStorage.setItem('bic_last_chapter', String(chapterNum))
      localStorage.removeItem('bic_last_verse')

      // Auto-load commentary if toggle was on
      if (showCommentaryRef.current) {
        loadCommentaries(data.verses || [])
      }
    } catch (err) {
      setError(err.message)
      setVerses([])
    } finally {
      setLoading(false)
    }
  }, [bookId, chapterNum, currentTranslation])

  useEffect(() => {
    fetchChapter()
  }, [fetchChapter])

  // Remember scroll position per chapter so reopening the app resumes mid-chapter.
  useEffect(() => {
    if (loading) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        try {
          localStorage.setItem('bic_scroll', JSON.stringify({ ref: chapterRef, y: window.scrollY }))
        } catch {}
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [loading, chapterRef])

  // Restore saved position once per chapter, after verses render (so the page
  // has its full height). Runs after ScrollToTop, so this restore wins.
  const restoredChapterRef = useRef(null)
  useEffect(() => {
    if (loading || restoredChapterRef.current === chapterRef) return
    restoredChapterRef.current = chapterRef
    try {
      const saved = JSON.parse(localStorage.getItem('bic_scroll') || 'null')
      if (saved?.ref === chapterRef && saved.y > 0) {
        requestAnimationFrame(() => window.scrollTo(0, saved.y))
      }
    } catch {}
  }, [loading, chapterRef])

  async function loadCommentaries(verseList) {
    const commentaries = {}
    for (const verse of verseList) {
      try {
        const tyndale = await getStudyNote(verse.ref)
        if (tyndale) { commentaries[verse.ref] = tyndale; continue }
        const jfb = await getJFBCommentary(verse.ref)
        if (jfb) { commentaries[verse.ref] = jfb; continue }
        const gill = await getCommentary(verse.ref)
        if (gill) { commentaries[verse.ref] = gill; continue }
      } catch {}
    }
    setVerseCommentaries(commentaries)
  }

  async function toggleCommentary() {
    triggerHaptic(HapticStyle.LIGHT)
    if (showCommentary) {
      setShowCommentary(false)
      return
    }
    setShowCommentary(true)
    if (Object.keys(verseCommentaries).length === 0 && verses.length > 0) {
      await loadCommentaries(verses)
    }
  }

  function pickTranslation(code) {
    setTranslation(code)
    setCurrentTranslation(code)
    setShowTranslationPicker(false)
    triggerHaptic(HapticStyle.LIGHT)
    toast.info(`Switched to ${getTranslationName(code)}`)
  }

  function getHighlightColor(verseRef) {
    const hl = highlights.find(item => item.verse_ref === verseRef)
    return hl?.color || null
  }

  function hasNote(verseRef) {
    return notes.some(item => item.verse_ref === verseRef)
  }

  // Verse tap — single tap selects in selection mode, otherwise navigates
  function handleVerseTap(verseRef) {
    if (selectionMode) {
      triggerHaptic(HapticStyle.LIGHT)
      setSelectedVerses(prev => {
        const next = new Set(prev)
        if (next.has(verseRef)) next.delete(verseRef)
        else next.add(verseRef)
        return next
      })
    } else {
      triggerHaptic(HapticStyle.LIGHT)
      navigate(`/bible/${bookId}/${chapterNum}/${verseRef.split('.')[2]}`)
    }
  }

  // Long press to enter selection mode
  function handleVerseLongPress(verseRef) {
    triggerHaptic(HapticStyle.MEDIUM)
    setSelectionMode(true)
    setSelectedVerses(new Set([verseRef]))
  }

  async function applyHighlightToSelected(color) {
    triggerHaptic(HapticStyle.SUCCESS)
    const count = selectedVerses.size

    await Promise.all([...selectedVerses].map(async (ref) => {
      const existing = highlights.find(h => h.verse_ref === ref)
      const verse = verses.find(v => v.ref === ref)
      if (existing) {
        await updateHighlight(existing.id, { color, verse_text: verse?.text || '' })
      } else {
        await addHighlight({
          verse_ref: ref,
          color,
          verse_text: verse?.text || '',
          is_public: false,
          translation: currentTranslation,
        })
      }
    }))

    setSelectionMode(false)
    setSelectedVerses(new Set())
    toast.success(`${count} verse${count > 1 ? 's' : ''} highlighted`)
  }

  function clearSelection() {
    setSelectionMode(false)
    setSelectedVerses(new Set())
  }

  const hasPrev = chapterNum > 1
  const hasNext = book && chapterNum < book.chapters

  const HIGHLIGHT_COLORS = [
    { name: 'Red', value: 'var(--highlight-red)' },
    { name: 'Orange', value: 'var(--highlight-orange)' },
    { name: 'Yellow', value: 'var(--highlight-yellow)' },
    { name: 'Green', value: 'var(--highlight-green)' },
    { name: 'Blue', value: 'var(--highlight-blue)' },
    { name: 'Purple', value: 'var(--highlight-purple)' },
  ]

  if (!book) {
    return (
      <div className="p-4">
        <BackButton label="Bible" to="/bible" />
        <ErrorBanner message={`Book "${bookId}" not found.`} className="mt-4" />
      </div>
    )
  }

  // Long press handler
  let longPressTimer = null
  function onTouchStart(verseRef) {
    longPressTimer = setTimeout(() => handleVerseLongPress(verseRef), 500)
  }
  function onTouchEnd() {
    if (longPressTimer) clearTimeout(longPressTimer)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <BackButton label={book.name} to="/bible" />

        <div className="flex items-center gap-2">
        {/* Font size stepper */}
        <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-full overflow-hidden">
          <button
            onClick={() => changeFontSize(-1)}
            disabled={fontSizeIdx <= 0}
            aria-label="Decrease text size"
            className="px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] disabled:opacity-40 min-h-[auto] min-w-[auto]"
          >
            A−
          </button>
          <div className="w-px h-4 bg-[var(--border-primary)]" />
          <button
            onClick={() => changeFontSize(1)}
            disabled={fontSizeIdx >= VERSE_FONT_SIZES.length - 1}
            aria-label="Increase text size"
            className="px-2.5 py-1.5 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-40 min-h-[auto] min-w-[auto]"
          >
            A+
          </button>
        </div>

        {/* Translation dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowTranslationPicker(!showTranslationPicker); triggerHaptic(HapticStyle.LIGHT) }}
            aria-label="Choose translation"
            className="text-sm text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-primary)] px-3 py-1.5 rounded-full flex items-center gap-1"
          >
            {currentTranslation}
            <svg viewBox="0 0 24 24" fill="none" className={`w-3 h-3 transition-transform ${showTranslationPicker ? 'rotate-180' : ''}`}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showTranslationPicker && (
            <div className="absolute right-0 top-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg shadow-lg z-50 overflow-y-auto max-h-[60vh] min-w-[180px] fade-in-up">
              {AVAILABLE_TRANSLATIONS.map(code => (
                <button
                  key={code}
                  onClick={() => pickTranslation(code)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left border-b border-[var(--border-subtle)] last:border-b-0 active:bg-[var(--bg-surface)] ${
                    currentTranslation === code ? 'bg-[var(--accent-secondary)]/10' : ''
                  }`}
                >
                  <div>
                    <span className={`text-sm font-bold ${currentTranslation === code ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-primary)]'}`}>{code}</span>
                    <p className="text-xs text-[var(--text-muted)]">{getTranslationName(code)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] opacity-70">{getTranslationDescription(code)}</p>
                  </div>
                  {currentTranslation === code && <span className="text-[var(--accent-secondary)] text-sm">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Chapter title + nav */}
      <div className="flex items-center justify-between mb-3">
        {hasPrev ? (
          <Link to={`/bible/${bookId}/${chapterNum - 1}`} onClick={() => triggerHaptic(HapticStyle.LIGHT)}
            aria-label="Previous chapter"
            className="text-[var(--accent-secondary)] text-sm font-medium flex items-center gap-1 min-h-[auto] min-w-[auto]">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        ) : <div className="w-6" />}
        <div className="flex items-center gap-2">
          <h2 className="display text-2xl text-[var(--text-primary)]">
            {formatChapterRef(bookId, chapterNum)}
          </h2>
          <button
            onClick={toggleBookmark}
            aria-label={existingBookmark ? 'Remove bookmark' : 'Bookmark chapter'}
            className="p-1 min-h-[auto] min-w-[auto]"
            style={{ color: existingBookmark ? 'var(--gold-accent)' : 'var(--text-muted)' }}
          >
            {existingBookmark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 3a2 2 0 0 0-2 2v16l8-4 8 4V5a2 2 0 0 0-2-2H6z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </button>
        </div>
        {hasNext ? (
          <Link to={`/bible/${bookId}/${chapterNum + 1}`} onClick={() => triggerHaptic(HapticStyle.LIGHT)}
            aria-label="Next chapter"
            className="text-[var(--accent-secondary)] text-sm font-medium flex items-center gap-1 min-h-[auto] min-w-[auto]">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        ) : <div className="w-6" />}
      </div>

      {/* Verse count */}
      {!loading && verses.length > 0 && (
        <p className="text-xs text-[var(--text-muted)] text-center -mt-1 mb-3">
          {verses.length} verse{verses.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Chapter Summary */}
      {chapterSummary && (
        <div className="mb-3">
          <div role="button" onClick={() => { setShowSummary(!showSummary); triggerHaptic(HapticStyle.LIGHT) }}
            className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg px-4 py-3 cursor-pointer"
            style={{ minHeight: 'auto', minWidth: 'auto' }}>
            <span className="text-sm font-medium text-[var(--accent-secondary)]">📖 Chapter Summary</span>
            <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showSummary ? 'rotate-90' : ''}`}>
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {showSummary && (
            <div className="bg-[var(--bg-card)] border-x border-b border-[var(--border-primary)] rounded-b-lg px-4 py-3 fade-in-up">
              <ul className="space-y-2">
                {chapterSummary.map((point, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-[var(--text-primary)] leading-relaxed">
                    <span className="text-[var(--accent-secondary)] mt-0.5 flex-shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Commentary toggle */}
      {!loading && verses.length > 0 && (
        <div className="mb-3">
          <div role="button" onClick={toggleCommentary}
            className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg px-4 py-3 cursor-pointer"
            style={{ minHeight: 'auto', minWidth: 'auto' }}>
            <span className="text-sm font-medium text-[var(--accent-secondary)]">✝️ Show Commentary</span>
            <span className={`text-xs px-2 py-1 rounded-full ${showCommentary ? 'bg-[var(--accent-secondary)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
              {showCommentary ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      )}

      {/* Selection mode hint */}
      {!selectionMode && !loading && verses.length > 0 && (
        <p className="text-xs text-[var(--text-muted)] mb-2 text-center">
          Tap a verse to study it. Long press to select and highlight multiple verses.
        </p>
      )}

      {error && <ErrorBanner message={error} className="mb-4" />}

      {/* Multi-select toolbar */}
      {selectionMode && (
        <div className="sticky top-0 z-40 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl p-3 mb-3 fade-in-up shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {selectedVerses.size} verse{selectedVerses.size !== 1 ? 's' : ''} selected
            </span>
            <button onClick={clearSelection} className="text-xs text-[var(--text-muted)] min-h-[auto] min-w-[auto] px-2 py-1">
              Cancel
            </button>
          </div>
          <div className="flex gap-2 items-center">
            {HIGHLIGHT_COLORS.map(c => (
              <button key={c.name} onClick={() => applyHighlightToSelected(c.value)}
                aria-label={`Highlight ${c.name.toLowerCase()}`}
                className="w-8 h-8 rounded-full border-2 border-[var(--border-primary)] flex-shrink-0 active:scale-90"
                style={{ backgroundColor: c.value }} title={c.name} />
            ))}
            <button onClick={() => {
              if (selectedVerses.size === 1) {
                const ref = [...selectedVerses][0]
                clearSelection()
                navigate(`/bible/${bookId}/${chapterNum}/${ref.split('.')[2]}`)
              }
            }}
              className="ml-auto text-xs text-[var(--accent-secondary)] font-medium min-h-[auto] min-w-[auto] px-2 py-1"
              style={{ display: selectedVerses.size === 1 ? 'block' : 'none' }}>
              Study →
            </button>
          </div>
        </div>
      )}

      {/* Verses */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-[var(--bg-surface)] rounded-lg shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {verses.map((verse) => {
            const highlightColor = getHighlightColor(verse.ref)
            const noteExists = hasNote(verse.ref)
            const isSelected = selectedVerses.has(verse.ref)
            const inlineCommentary = showCommentary ? verseCommentaries[verse.ref] : null

            return (
              <div key={verse.number}>
                <div
                  role="button"
                  onClick={() => handleVerseTap(verse.ref)}
                  onTouchStart={() => onTouchStart(verse.ref)}
                  onTouchEnd={onTouchEnd}
                  onTouchMove={onTouchEnd}
                  onMouseDown={() => onTouchStart(verse.ref)}
                  onMouseUp={onTouchEnd}
                  onMouseLeave={onTouchEnd}
                  className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer active:scale-[0.99] transition-transform ${
                    isSelected ? 'ring-2 ring-[var(--accent-secondary)]' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-secondary)' : highlightColor || undefined,
                    opacity: isSelected ? 0.85 : 1,
                    minHeight: 'auto', minWidth: 'auto',
                  }}
                >
                  <span className="inline">
                    <span className="text-xs font-bold text-[var(--accent-secondary)] mr-1.5 align-super">
                      {verse.number}
                    </span>
                    <span className="text-[var(--text-primary)] leading-relaxed verse-text">
                      {verse.text}
                    </span>
                    {noteExists && (
                      <span className="inline-block w-2 h-2 bg-[var(--gold-accent)] rounded-full ml-1 align-middle" />
                    )}
                  </span>
                </div>
                {inlineCommentary && (
                  <div className="mx-3 mb-2 px-3 py-2 border-l-2 border-[var(--accent-secondary)] bg-[var(--bg-surface)] rounded-r-lg">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {expandBookNames(inlineCommentary)}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Copyright notice */}
      {copyright && (
        <p className="text-xs text-[var(--text-muted)] mt-6 text-center italic">{copyright}</p>
      )}

      {/* Chapter navigation */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border-primary)]">
        {hasPrev ? (
          <Link to={`/bible/${bookId}/${chapterNum - 1}`}
            className="flex items-center gap-1 text-[var(--accent-secondary)] font-medium text-sm min-h-[44px]"
            onClick={() => triggerHaptic(HapticStyle.LIGHT)}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Chapter {chapterNum - 1}
          </Link>
        ) : <div />}
        {hasNext ? (
          <Link to={`/bible/${bookId}/${chapterNum + 1}`}
            className="flex items-center gap-1 text-[var(--accent-secondary)] font-medium text-sm min-h-[44px]"
            onClick={() => triggerHaptic(HapticStyle.LIGHT)}>
            Chapter {chapterNum + 1}
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}

export default ChapterView
