import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBookById, formatChapterRef } from '../lib/bible-books'
import { expandBookNames } from '../lib/utils'
import { getChapter, getTranslation, setTranslation, getTranslationName, AVAILABLE_TRANSLATIONS } from '../lib/bible-api'
import { getStudyNote } from '../lib/study'
import { getCommentary } from '../lib/commentary'
import { getJFBCommentary } from '../lib/jfb'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'
import useUserData from '../hooks/useUserData'

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

  // Multi-select state
  const [selectedVerses, setSelectedVerses] = useState(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  const { items: highlights, add: addHighlight, update: updateHighlight } = useUserData('highlights')
  const { items: notes } = useUserData('notes')

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
      if (showCommentary) {
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

        {/* Translation dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowTranslationPicker(!showTranslationPicker); triggerHaptic(HapticStyle.LIGHT) }}
            className="text-sm text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-primary)] px-3 py-1.5 rounded-full flex items-center gap-1"
          >
            {currentTranslation}
            <svg viewBox="0 0 24 24" fill="none" className={`w-3 h-3 transition-transform ${showTranslationPicker ? 'rotate-180' : ''}`}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showTranslationPicker && (
            <div className="absolute right-0 top-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg shadow-lg z-50 overflow-hidden min-w-[180px] fade-in-up">
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
                  </div>
                  {currentTranslation === code && <span className="text-[var(--accent-secondary)] text-sm">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chapter title + nav */}
      <div className="flex items-center justify-between mb-3">
        {hasPrev ? (
          <Link to={`/bible/${bookId}/${chapterNum - 1}`} onClick={() => triggerHaptic(HapticStyle.LIGHT)}
            className="text-[var(--accent-secondary)] text-sm font-medium flex items-center gap-1 min-h-[auto] min-w-[auto]">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        ) : <div className="w-6" />}
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          {formatChapterRef(bookId, chapterNum)}
        </h2>
        {hasNext ? (
          <Link to={`/bible/${bookId}/${chapterNum + 1}`} onClick={() => triggerHaptic(HapticStyle.LIGHT)}
            className="text-[var(--accent-secondary)] text-sm font-medium flex items-center gap-1 min-h-[auto] min-w-[auto]">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        ) : <div className="w-6" />}
      </div>

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
                    <span className="text-[var(--text-primary)] text-[15px] leading-relaxed verse-text">
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
