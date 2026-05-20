import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBookById, formatVerseRef, buildVerseRef, parseVerseRef } from '../lib/bible-books'
import { expandBookNames } from '../lib/utils'
import { getVerse, getChapter, getTranslation, getVersesForStrongs } from '../lib/bible-api'
import { getCrossReferences } from '../lib/tsk'
import { getStudyNote } from '../lib/study'
import { getJFBCommentary } from '../lib/jfb'
import { getStrongsForVerse, getLanguageForBook, adaptWordsToTranslation, generatePhraseByPhrase, detectVerseType, generatePlainEnglish, getEtymologyBreakdown } from '../lib/strongs'
import { getCommentary } from '../lib/commentary'
import { shareVerse } from '../lib/share'
import { getBiblicalConnections } from '../lib/connections'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'
import useUserData from '../hooks/useUserData'

function VerseContext() {
  const { bookId, chapter, verse } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const chapterNum = parseInt(chapter)
  const verseNum = parseInt(verse)
  const book = getBookById(bookId)
  const verseRef = buildVerseRef(bookId, chapterNum, verseNum)
  const translation = getTranslation()
  const language = getLanguageForBook(bookId)

  const [verseData, setVerseData] = useState(null)
  const [crossRefs, setCrossRefs] = useState([])
  const [strongsWords, setStrongsWords] = useState([])
  const [commentary, setCommentary] = useState(null)
  const [studyNote, setStudyNote] = useState(null)
  const [jfbNote, setJfbNote] = useState(null)
  const [expandedRefs, setExpandedRefs] = useState({})
  const [wordPopup, setWordPopup] = useState(null) // index of word to show popup for
  const [wordExamples, setWordExamples] = useState(null) // { strongs, examples, total, loading } | null
  const [wordEtymology, setWordEtymology] = useState(null) // { strongs, rawPhrase, components } | null
  const [refTexts, setRefTexts] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('context')
  const [totalVerses, setTotalVerses] = useState(0)

  const { items: highlights, add: addHighlight, update: updateHighlight, remove: removeHighlight } = useUserData('highlights')
  const { items: bookmarks, add: addBookmark, remove: removeBookmark } = useUserData('bookmarks')
  const { items: notes, add: addNote, update: updateNote, remove: removeNote } = useUserData('notes')

  const currentHighlight = highlights.find(h => h.verse_ref === verseRef)
  const isBookmarked = bookmarks.some(b => b.verse_ref === verseRef)
  const existingNote = notes.find(n => n.verse_ref === verseRef)

  const [noteText, setNoteText] = useState(existingNote?.content || '')
  const [showNoteEditor, setShowNoteEditor] = useState(false)

  // Keep editor text in sync when navigating to a new verse or when notes load from cloud.
  // Skip while the editor is open so we don't clobber user input.
  useEffect(() => {
    if (showNoteEditor) return
    setNoteText(existingNote?.content || '')
  }, [verseRef, existingNote?.content, showNoteEditor])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setExpandedRefs({})
      setRefTexts({})
      const results = await Promise.allSettled([
        getVerse(bookId, chapterNum, verseNum, translation),
        getCrossReferences(verseRef),
        getStrongsForVerse(verseRef),
        getCommentary(verseRef),
        getChapter(bookId, chapterNum, translation),
        getStudyNote(verseRef),
        getJFBCommentary(verseRef),
      ])

      const loadedVerse = results[0].status === 'fulfilled' ? results[0].value : null
      const loadedStrongs = results[2].status === 'fulfilled' ? (results[2].value || []) : []

      setVerseData(loadedVerse)
      setCrossRefs(results[1].status === 'fulfilled' ? (results[1].value || []) : [])
      // Adapt English words to match the current translation
      setStrongsWords(adaptWordsToTranslation(loadedStrongs, loadedVerse?.text))
      setCommentary(results[3].status === 'fulfilled' ? results[3].value : null)
      if (results[4].status === 'fulfilled') {
        setTotalVerses(results[4].value?.verseCount || results[4].value?.verses?.length || 0)
      }
      setStudyNote(results[5].status === 'fulfilled' ? results[5].value : null)
      setJfbNote(results[6].status === 'fulfilled' ? results[6].value : null)
      setLoading(false)

      // Save reading position
      localStorage.setItem('bic_last_book', bookId)
      localStorage.setItem('bic_last_chapter', String(chapterNum))
      localStorage.setItem('bic_last_verse', String(verseNum))
    }
    loadData()
  }, [bookId, chapterNum, verseNum, verseRef, translation])

  // Load cross-verse examples whenever the word popup opens on a new word.
  // Loading state is derived at render time, so no synchronous setState here.
  useEffect(() => {
    if (wordPopup === null) return
    const w = strongsWords[wordPopup]
    if (!w?.strongs) return
    const targetStrongs = w.strongs

    let cancelled = false
    ;(async () => {
      const allVerses = await getVersesForStrongs(targetStrongs)
      if (cancelled) return
      const others = allVerses.filter(r => r !== verseRef).slice(0, 3)
      const loaded = await Promise.all(others.map(async (ref) => {
        const [bId, ch, vs] = ref.split('.')
        const v = await getVerse(bId, parseInt(ch), parseInt(vs), translation)
        const book = getBookById(bId)
        return { ref, bookId: bId, bookName: book?.name || bId, ch: parseInt(ch), vs: parseInt(vs), text: v?.text || '' }
      }))
      if (!cancelled) {
        setWordExamples({ strongs: targetStrongs, examples: loaded, total: allVerses.length })
      }
    })()
    return () => { cancelled = true }
  }, [wordPopup, strongsWords, verseRef, translation])

  // Load etymology (compound word breakdown) whenever the popup opens on a new word.
  useEffect(() => {
    if (wordPopup === null) return
    const w = strongsWords[wordPopup]
    if (!w?.strongs) return
    const targetStrongs = w.strongs
    let cancelled = false
    ;(async () => {
      const ety = await getEtymologyBreakdown(targetStrongs)
      if (cancelled) return
      if (ety) setWordEtymology({ strongs: targetStrongs, ...ety })
      else setWordEtymology({ strongs: targetStrongs, rawPhrase: '', components: [] })
    })()
    return () => { cancelled = true }
  }, [wordPopup, strongsWords])

  const hasPrevVerse = verseNum > 1
  const hasNextVerse = totalVerses > 0 && verseNum < totalVerses

  function goToVerse(num) {
    triggerHaptic(HapticStyle.LIGHT)
    navigate(`/bible/${bookId}/${chapterNum}/${num}`, { replace: true })
  }

  // Split commentary into bullet points
  function getCommentaryBullets(text) {
    if (!text) return []

    const clean = text.replace(/\s+/g, ' ').trim()

    // Split on sentence-ending punctuation followed by a space and uppercase letter
    // But NOT on ellipses (....), abbreviations (Gen. , Jos. , etc.), or mid-sentence periods
    const sentences = clean
      .split(/(?<=[.!?])\s+(?=[A-Z][a-z]{2,})/)
      .filter(s => s.trim().length > 30) // skip tiny fragments

    if (sentences.length <= 1) {
      // If can't split into sentences, break by semicolons or colons
      const parts = clean.split(/;\s+/).filter(s => s.trim().length > 30)
      if (parts.length > 1 && parts.length <= 8) {
        return parts.map(p => p.trim().replace(/^[a-z]/, c => c.toUpperCase()))
      }
      // Last resort: if text is very long, split into ~200 char chunks at word boundaries
      if (clean.length > 400) {
        const chunks = []
        let remaining = clean
        while (remaining.length > 250) {
          let splitAt = remaining.lastIndexOf('. ', 300)
          if (splitAt < 100) splitAt = remaining.lastIndexOf(', ', 300)
          if (splitAt < 100) splitAt = remaining.lastIndexOf(' ', 250)
          if (splitAt < 50) splitAt = 250
          chunks.push(remaining.slice(0, splitAt + 1).trim())
          remaining = remaining.slice(splitAt + 1).trim()
        }
        if (remaining) chunks.push(remaining)
        return chunks
      }
      return [clean]
    }

    // Group very short consecutive sentences together (target ~150-300 chars per bullet)
    const bullets = []
    let buffer = ''
    for (const s of sentences) {
      if (buffer.length > 0 && buffer.length + s.length < 200) {
        buffer += ' ' + s
      } else {
        if (buffer) bullets.push(buffer)
        buffer = s
      }
    }
    if (buffer) bullets.push(buffer)

    return bullets
  }

  const [showBookmarkModal, setShowBookmarkModal] = useState(false)
  const [bookmarkLabel, setBookmarkLabel] = useState('')
  const MAX_BOOKMARKS = 5

  async function openBookmarkModal() {
    triggerHaptic(HapticStyle.LIGHT)
    if (isBookmarked) {
      const existing = bookmarks.find(b => b.verse_ref === verseRef)
      if (existing) await removeBookmark(existing.id)
      toast.info('Bookmark removed')
      return
    }
    if (bookmarks.length >= MAX_BOOKMARKS) {
      toast.warning(`You can only have ${MAX_BOOKMARKS} bookmarks. Remove one first.`)
      return
    }
    setBookmarkLabel('')
    setShowBookmarkModal(true)
  }

  async function saveBookmark() {
    if (!bookmarkLabel.trim()) {
      toast.error('Please enter a label for your bookmark')
      return
    }
    triggerHaptic(HapticStyle.SUCCESS)
    await addBookmark({
      verse_ref: verseRef,
      verse_text: verseData?.text || '',
      label: bookmarkLabel.trim(),
      translation,
    })
    setShowBookmarkModal(false)
    toast.success('Bookmark saved')
  }

  async function handleHighlight(color) {
    triggerHaptic(HapticStyle.LIGHT)
    const existing = highlights.find(h => h.verse_ref === verseRef)
    if (color === null) {
      if (existing) await removeHighlight(existing.id)
      return
    }
    if (existing) {
      await updateHighlight(existing.id, { color })
    } else {
      await addHighlight({
        verse_ref: verseRef,
        color,
        verse_text: verseData?.text || '',
        is_public: false,
        translation,
      })
    }
  }

  async function saveNote() {
    triggerHaptic(HapticStyle.SUCCESS)
    const existing = notes.find(n => n.verse_ref === verseRef)
    if (!noteText.trim()) {
      if (existing) await removeNote(existing.id)
    } else if (existing) {
      await updateNote(existing.id, { content: noteText.trim() })
    } else {
      await addNote({
        verse_ref: verseRef,
        content: noteText.trim(),
        verse_text: verseData?.text || '',
        is_public: false,
        translation,
      })
    }
    setShowNoteEditor(false)
  }

  function navigateToRef(ref) {
    const parsed = parseVerseRef(ref)
    if (parsed.verse) {
      navigate(`/bible/${parsed.bookId}/${parsed.chapter}/${parsed.verse}`)
    } else if (parsed.chapter) {
      navigate(`/bible/${parsed.bookId}/${parsed.chapter}`)
    }
  }

  const HIGHLIGHT_COLORS = [
    { name: 'Red', value: 'var(--highlight-red)' },
    { name: 'Orange', value: 'var(--highlight-orange)' },
    { name: 'Yellow', value: 'var(--highlight-yellow)' },
    { name: 'Green', value: 'var(--highlight-green)' },
    { name: 'Blue', value: 'var(--highlight-blue)' },
    { name: 'Purple', value: 'var(--highlight-purple)' },
  ]

  const SECTIONS = [
    { key: 'study', label: 'Study' },
    { key: 'original', label: language },
    { key: 'crossrefs', label: 'Cross-Refs' },
  ]

  if (!book) {
    return (
      <div className="p-4">
        <BackButton to="/bible" />
        <ErrorBanner message="Book not found." className="mt-4" />
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <BackButton label={`${book.name} ${chapterNum}`} to={`/bible/${bookId}/${chapterNum}`} />
        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              triggerHaptic(HapticStyle.LIGHT)
              const result = await shareVerse(bookId, chapterNum, verseNum, verseData?.text || '')
              if (result === 'copied') toast.success('Copied to clipboard')
            }}
            className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="var(--text-muted)" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,6 12,2 8,6" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={openBookmarkModal}
            className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill={isBookmarked ? 'var(--gold-accent)' : 'none'} stroke={isBookmarked ? 'var(--gold-accent)' : 'var(--text-muted)'} strokeWidth="2">
              <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Prev / Next verse navigation */}
      <div className="flex items-center justify-between mb-3">
        {hasPrevVerse ? (
          <button
            onClick={() => goToVerse(verseNum - 1)}
            className="flex items-center gap-1 text-[var(--accent-secondary)] text-sm font-medium min-h-[auto] min-w-[auto] py-1"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Prev Verse
          </button>
        ) : <div />}
        <span className="text-xs text-[var(--text-muted)]">
          Verse {verseNum}{totalVerses > 0 ? ` of ${totalVerses}` : ''}
        </span>
        {hasNextVerse ? (
          <button
            onClick={() => goToVerse(verseNum + 1)}
            className="flex items-center gap-1 text-[var(--accent-secondary)] text-sm font-medium min-h-[auto] min-w-[auto] py-1"
          >
            Next Verse
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : <div />}
      </div>

      {/* Verse text */}
      <div
        className="themed-card p-4 mb-4 relative"
        style={currentHighlight ? { backgroundColor: currentHighlight.color } : undefined}
      >
        {/* Decorative gold rule across the top */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-4 right-4 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--gold-accent), transparent)',
            opacity: 0.45,
          }}
        />
        <p className="verse-ref text-sm mb-3">
          {formatVerseRef(bookId, chapterNum, verseNum)}
          <span className="text-[var(--text-muted)] font-normal ml-2 text-xs" style={{ fontFamily: 'var(--font-ui)', letterSpacing: 0 }}>
            {translation}
          </span>
        </p>
        {loading ? (
          <div className="h-16 shimmer rounded" />
        ) : verseData ? (
          <p className="text-[var(--text-primary)] text-lg leading-relaxed verse-text">
            {verseData.text}
          </p>
        ) : (
          <p className="text-[var(--text-muted)] italic">
            Verse not found.
          </p>
        )}
      </div>

      {/* Bookmark modal */}
      {showBookmarkModal && (
        <div className="bg-[var(--bg-card)] border border-[var(--gold-accent)] rounded-xl p-4 mb-4 fade-in-up">
          <h3 className="text-sm font-bold text-[var(--gold-accent)] mb-2">
            🔖 Add Bookmark ({bookmarks.length}/{MAX_BOOKMARKS})
          </h3>
          <input
            type="text"
            value={bookmarkLabel}
            onChange={(e) => setBookmarkLabel(e.target.value)}
            placeholder="Label this bookmark (e.g. 'Morning prayer', 'Study topic')"
            maxLength={50}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm mb-3 focus:outline-none focus:border-[var(--gold-accent)]"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={saveBookmark}
              className="flex-1 py-2 rounded-lg bg-[var(--gold-accent)] text-black font-medium text-sm active:scale-95"
            >
              Save Bookmark
            </button>
            <button
              onClick={() => setShowBookmarkModal(false)}
              className="py-2 px-4 rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {/* Highlight colors */}
        {HIGHLIGHT_COLORS.map(c => (
          <button
            key={c.name}
            onClick={() => handleHighlight(c.value)}
            className="w-8 h-8 rounded-full border-2 border-[var(--border-primary)] flex-shrink-0 active:scale-90"
            style={{ backgroundColor: c.value }}
            title={c.name}
          />
        ))}
        {currentHighlight && (
          <button
            onClick={() => handleHighlight(null)}
            className="px-3 py-1 rounded-full text-xs text-[var(--text-muted)] border border-[var(--border-primary)] flex-shrink-0 active:scale-95"
          >
            Clear
          </button>
        )}
        <button
          onClick={() => { setShowNoteEditor(!showNoteEditor); triggerHaptic(HapticStyle.LIGHT) }}
          className="px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 active:scale-95"
          style={{
            color: existingNote ? 'var(--gold-accent)' : 'var(--text-muted)',
            borderColor: existingNote ? 'var(--gold-accent)' : 'var(--border-primary)',
          }}
        >
          {existingNote ? 'Edit Note' : '+ Note'}
        </button>
      </div>

      {/* Note editor */}
      {showNoteEditor && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mb-4 fade-in-up">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your note about this verse..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg p-3 text-[var(--text-primary)] text-sm resize-none min-h-[100px] focus:outline-none focus:border-[var(--accent-secondary)]"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={saveNote}
              className="flex-1 py-2 rounded-lg bg-[var(--accent-secondary)] text-white font-medium text-sm active:scale-95"
            >
              Save
            </button>
            <button
              onClick={() => setShowNoteEditor(false)}
              className="py-2 px-4 rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing note display */}
      {existingNote && !showNoteEditor && (
        <div className="bg-[var(--bg-card)] border-l-4 border-l-[var(--gold-accent)] border border-[var(--border-primary)] rounded-r-xl p-3 mb-4">
          <p className="text-xs text-[var(--gold-accent)] font-bold mb-1">Your Note</p>
          <p className="text-sm text-[var(--text-primary)]">{existingNote.content}</p>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-2 mb-4">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => { setActiveSection(s.key); triggerHaptic(HapticStyle.LIGHT) }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
              activeSection === s.key
                ? 'bg-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Bible Study section */}
      {activeSection === 'study' && (
        <div className="space-y-4 fade-in-up">
          {loading ? (
            <div className="space-y-3">
              <div className="h-20 shimmer rounded-xl" />
              <div className="h-20 shimmer rounded-xl" />
            </div>
          ) : (commentary || studyNote || jfbNote) ? (
            <>
              {/* Study Notes (Tyndale — modern, most accessible) */}
              {studyNote && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-wide mb-3">
                    📖 What This Verse Means
                  </h3>
                  <ul className="space-y-2">
                    {getCommentaryBullets(studyNote).map((bullet, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-[var(--text-primary)] leading-relaxed">
                        <span className="text-[var(--accent-secondary)] mt-1 flex-shrink-0">•</span>
                        <span>{expandBookNames(bullet)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* JFB Commentary (evangelical, non-denominational) */}
              {jfbNote && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-wide mb-3">
                    ✝️ Biblical Commentary
                  </h3>
                  <ul className="space-y-2">
                    {getCommentaryBullets(jfbNote).map((bullet, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-[var(--text-primary)] leading-relaxed">
                        <span className="text-[var(--accent-secondary)] mt-1 flex-shrink-0">•</span>
                        <span>{expandBookNames(bullet)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deeper Study (John Gill — scholarly, detailed) */}
              {commentary && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-wide mb-3">
                    📜 Deeper Study
                  </h3>
                  <ul className="space-y-2">
                    {getCommentaryBullets(commentary).map((bullet, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-[var(--text-primary)] leading-relaxed">
                        <span className="text-[var(--accent-secondary)] mt-1 flex-shrink-0">•</span>
                        <span>{expandBookNames(bullet)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Biblical Connections */}
              {verseData?.text && getBiblicalConnections(verseData.text, bookId, chapterNum, verseNum).length > 0 && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-wide mb-3">
                    🔗 Related Biblical Connections
                  </h3>
                  <div className="space-y-3">
                    {getBiblicalConnections(verseData.text, bookId, chapterNum, verseNum).map((conn, idx) => (
                      <div key={idx}>
                        <p className="text-sm font-bold text-[var(--gold-accent)] mb-1">{conn.title}</p>
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{expandBookNames(conn.text)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                <h3 className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-wide mb-3">
                  🙏 Reflect & Apply
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-secondary)] flex-shrink-0">•</span>
                    <span>What is God revealing about His character in this passage?</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-secondary)] flex-shrink-0">•</span>
                    <span>How does this verse point to Jesus Christ and the gospel?</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-secondary)] flex-shrink-0">•</span>
                    <span>Is there a promise to trust, a command to obey, or a sin to turn from?</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-secondary)] flex-shrink-0">•</span>
                    <span>How should this truth change the way I live today?</span>
                  </li>
                </ul>
              </div>

              {/* Scripture alone disclaimer */}
              <p className="text-xs text-[var(--text-muted)] text-center italic px-4">
                All commentary is from public domain Bible-believing scholars. Scripture alone is the final authority — "All Scripture is God-breathed" (2 Timothy 3:16).
              </p>
            </>
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 text-center">
              <p className="text-[var(--text-muted)] text-sm">
                No study notes available for this verse yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Original Language section */}
      {activeSection === 'original' && (
        <div className="space-y-4 fade-in-up">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 shimmer rounded-xl" />
              ))}
            </div>
          ) : strongsWords.length > 0 ? (
            <>
              {/* Verse Type & Context */}
              {(() => {
                const vt = detectVerseType({ words: strongsWords, text: verseData?.text, bookId })
                return (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                    <h3 className="text-xs font-bold text-[var(--accent-secondary)] mb-2 uppercase tracking-wide">
                      Verse Type & Context
                    </h3>
                    <p className="text-sm font-bold text-[var(--gold-accent)] mb-1">{vt.type}</p>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{vt.description}</p>
                    {vt.analysis && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                          What the {language} actually says
                        </p>
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{vt.analysis}</p>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* What This Verse Is Saying — plain-English, self-contained */}
              {(() => {
                const pe = generatePlainEnglish(verseData?.text, strongsWords, language)
                if (!pe.simplified && pe.insights.length === 0) return null
                return (
                  <div className="bg-[var(--bg-card)] border border-[var(--gold-accent)] rounded-xl p-4">
                    <h3 className="text-xs font-bold text-[var(--gold-accent)] mb-2 uppercase tracking-wide">
                      💡 What This Verse Is Saying
                    </h3>
                    {pe.simplified && (
                      <>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                          In today's English
                        </p>
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                          "{pe.simplified}"
                        </p>
                      </>
                    )}
                    {pe.insights.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                          What the original language shows you
                        </p>
                        <ul className="space-y-2">
                          {pe.insights.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-[var(--text-primary)] leading-relaxed">
                              <span className="text-[var(--gold-accent)] mt-1 flex-shrink-0">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Full verse in original language — each word is clickable */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                <h3 className="text-xs font-bold text-[var(--accent-secondary)] mb-3 uppercase tracking-wide">
                  Original {language} Text
                  <span className="font-normal text-[var(--text-muted)] ml-1">(tap any word)</span>
                </h3>
                <div className="flex flex-wrap gap-x-3 gap-y-2" dir={language === 'Hebrew' ? 'rtl' : 'ltr'}>
                  {strongsWords.map((w, i) => {
                    const gloss = (w.englishWord || '').trim() || w.transliteration || ''
                    const isActive = wordPopup === i
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setWordPopup(isActive ? null : i); triggerHaptic(HapticStyle.LIGHT) }}
                        className={`inline-flex flex-col items-center text-center cursor-pointer border-b-2 border-dotted pb-0.5 min-h-[auto] min-w-[auto] p-0 bg-transparent ${isActive ? 'border-[var(--gold-accent)]' : 'border-[var(--accent-secondary)]'}`}
                      >
                        <span className="text-xl font-bold text-[var(--text-primary)] leading-tight">
                          {w.originalWord}
                        </span>
                        {gloss && (
                          <span className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5" style={{ direction: 'ltr' }}>
                            {gloss}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Word popup — fixed position inside the card, not absolute on each word */}
                {wordPopup !== null && strongsWords[wordPopup] && (() => {
                  const w = strongsWords[wordPopup]
                  return (
                    <div className="mt-3 pt-3 border-t border-[var(--accent-secondary)] fade-in-up" style={{ direction: 'ltr' }}>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-lg font-bold text-[var(--text-primary)]">{w.originalWord}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setWordPopup(null) }}
                          className="text-xs text-[var(--text-muted)] min-h-[auto] min-w-[auto] p-1 ml-2">✕</button>
                      </div>
                      {w.englishWord && (
                        <p className="text-sm font-bold text-[var(--accent-secondary)] mb-1">"{w.englishWord}"</p>
                      )}
                      {w.pronunciation && (
                        <p className="text-xs text-[var(--text-secondary)] mb-1">
                          <span className="text-[var(--text-muted)]">Say it: </span>
                          <span className="italic">{w.pronunciation}</span>
                        </p>
                      )}
                      {w.transliteration && (
                        <p className="text-xs text-[var(--text-secondary)] mb-1">
                          <span className="text-[var(--text-muted)]">Written: </span>{w.transliteration}
                        </p>
                      )}
                      {w.partOfSpeech && (
                        <p className="text-xs text-[var(--accent-secondary)] mb-1">{w.partOfSpeech}</p>
                      )}
                      {w.simpleDefinition && (
                        <p className="text-xs text-[var(--text-primary)] mt-1 pt-1 border-t border-[var(--border-subtle)]">
                          {w.simpleDefinition}
                        </p>
                      )}

                      {/* Etymology / compound word breakdown — "built from G575 + G2644" */}
                      {wordEtymology && wordEtymology.strongs === w.strongs && wordEtymology.components.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                            Built from {wordEtymology.components.length === 1 ? 'this root' : 'these roots'}
                          </p>
                          <div className="space-y-1">
                            {wordEtymology.components.map((c) => (
                              <button
                                key={c.strongs}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  triggerHaptic(HapticStyle.LIGHT)
                                  navigate(`/lexicon/${c.strongs}`)
                                }}
                                className="w-full text-left bg-[var(--bg-surface)] rounded-md px-2 py-1 min-h-[auto] active:scale-[0.98]"
                              >
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  {c.originalWord && (
                                    <span className="text-sm font-bold text-[var(--text-primary)]">{c.originalWord}</span>
                                  )}
                                  {c.transliteration && (
                                    <span className="text-[11px] italic text-[var(--text-secondary)]">{c.transliteration}</span>
                                  )}
                                  <span className="text-[10px] font-mono text-[var(--accent-secondary)]">{c.strongs}</span>
                                </div>
                                {c.gloss && (
                                  <p className="text-[11px] text-[var(--text-primary)] leading-snug">— {c.gloss}</p>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cross-verse examples — see how this Strong's is used elsewhere */}
                      {w.strongs && (() => {
                        const ready = wordExamples && wordExamples.strongs === w.strongs
                        return (
                          <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                            {ready ? (
                              <>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                                  Used in {wordExamples.total} verse{wordExamples.total !== 1 ? 's' : ''}
                                </p>
                                {wordExamples.examples.length === 0 ? (
                                  <p className="text-[10px] text-[var(--text-muted)] italic">No other verses use this word.</p>
                                ) : (
                                  <div className="space-y-1">
                                    {wordExamples.examples.map((ex) => (
                                      <button
                                        key={ex.ref}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          triggerHaptic(HapticStyle.LIGHT)
                                          navigate(`/bible/${ex.bookId}/${ex.ch}/${ex.vs}`)
                                        }}
                                        className="w-full text-left bg-[var(--bg-surface)] rounded-md px-2 py-1 min-h-[auto] active:scale-[0.98]"
                                      >
                                        <p className="text-[10px] font-bold text-[var(--accent-secondary)]">
                                          {ex.bookName} {ex.ch}:{ex.vs}
                                        </p>
                                        <p className="text-[11px] text-[var(--text-primary)] leading-snug line-clamp-2">
                                          {ex.text}
                                        </p>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {wordExamples.total > wordExamples.examples.length && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      triggerHaptic(HapticStyle.LIGHT)
                                      navigate(`/lexicon/${w.strongs}`)
                                    }}
                                    className="text-[10px] font-bold text-[var(--accent-secondary)] mt-1 min-h-[auto] p-0"
                                  >
                                    See all {wordExamples.total} uses →
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                                  Finding other uses…
                                </p>
                                <div className="h-6 shimmer rounded" />
                              </>
                            )}
                          </div>
                        )
                      })()}

                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{w.strongs} • {w.language}</p>
                    </div>
                  )
                })()}
              </div>

              {/* Phrase-by-phrase literal meaning */}
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
                Phrase-by-Phrase — What It Literally Means
              </h3>
              {generatePhraseByPhrase(strongsWords, language).map((row, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      {row.english && (
                        <p className="text-base font-bold text-[var(--text-primary)] leading-tight">
                          "{row.english}"
                        </p>
                      )}
                      <p className="text-xl font-bold text-[var(--text-primary)] mt-1" dir={language === 'Hebrew' ? 'rtl' : 'ltr'}>
                        {row.original}
                      </p>
                      {(row.transliteration || row.pronunciation) && (
                        <p className="text-xs text-[var(--text-secondary)] italic mt-0.5">
                          {row.transliteration}
                          {row.pronunciation && row.pronunciation !== row.transliteration && (
                            <span className="text-[var(--text-muted)]"> · say it: {row.pronunciation}</span>
                          )}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] bg-[var(--bg-surface)] text-[var(--accent-secondary)] px-2 py-0.5 rounded-full font-mono ml-2 flex-shrink-0">
                      {row.strongs}
                    </span>
                  </div>

                  {row.literal && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                        Literally in {row.language}
                      </span>
                      <p className="text-sm font-medium text-[var(--accent-secondary)] leading-snug">
                        {row.literal}
                      </p>
                    </div>
                  )}

                  {row.figurative.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                        Extended / Figurative Use
                      </span>
                      <ul className="text-sm text-[var(--text-primary)] leading-snug space-y-0.5">
                        {row.figurative.map((f, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-[var(--text-muted)] flex-shrink-0">→</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {row.morphDescription && (
                    <p className="text-[11px] text-[var(--text-muted)] mt-2 italic">
                      {row.morphDescription}
                    </p>
                  )}

                  {row.kjvUsages.length > 0 && (
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Also translated as: {row.kjvUsages.slice(0, 6).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 text-center">
              <p className="text-[var(--text-muted)] text-sm">
                No {language} word data available for this verse yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cross-References section */}
      {activeSection === 'crossrefs' && (
        <div className="fade-in-up">
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-10 shimmer rounded-lg" />
              ))}
            </div>
          ) : crossRefs.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                {crossRefs.length} cross-reference{crossRefs.length !== 1 ? 's' : ''} found
              </p>
              {crossRefs.map((ref, idx) => {
                const parsed = parseVerseRef(ref)
                const isExpanded = expandedRefs[ref]
                const verseText = refTexts[ref]

                return (
                  <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg overflow-hidden">
                    {/* Verse reference header — tap to expand/collapse */}
                    <div
                      role="button"
                      onClick={async () => {
                        triggerHaptic(HapticStyle.LIGHT)
                        const newExpanded = { ...expandedRefs, [ref]: !isExpanded }
                        setExpandedRefs(newExpanded)

                        if (!isExpanded && !refTexts[ref]) {
                          try {
                            const v = await getVerse(parsed.bookId, parsed.chapter, parsed.verse, translation)
                            setRefTexts(prev => ({ ...prev, [ref]: v?.text || 'Verse text not available.' }))
                          } catch {
                            setRefTexts(prev => ({ ...prev, [ref]: 'Could not load verse.' }))
                          }
                        }
                      }}
                      className="flex items-center justify-between px-4 py-3 cursor-pointer active:bg-[var(--bg-surface)]"
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                      <span className="text-sm font-medium text-[var(--accent-secondary)]">
                        {formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={`w-4 h-4 text-[var(--text-muted)] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {/* Expanded: show verse text + Go to Verse button */}
                    {isExpanded && (
                      <div className="px-4 pb-3 border-t border-[var(--border-subtle)]">
                        {verseText ? (
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed py-3 verse-text italic">
                            "{verseText}"
                          </p>
                        ) : (
                          <div className="h-10 shimmer rounded my-3" />
                        )}
                        <button
                          onClick={() => { navigateToRef(ref); triggerHaptic(HapticStyle.MEDIUM) }}
                          className="w-full py-2 rounded-lg bg-[var(--accent-secondary)] text-white text-sm font-medium active:scale-95"
                        >
                          Go to Verse
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 text-center">
              <p className="text-[var(--text-muted)] text-sm">
                No cross-references available for this verse yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VerseContext
