import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { lookupStrongs, parseStrongsDefinition } from '../lib/strongs'
import { getVersesForStrongs, getChapter, getTranslation, getTranslationName } from '../lib/bible-api'
import { BIBLE_BOOKS } from '../lib/bible-books'
import BackButton from '../components/BackButton'
import EmptyState from '../components/EmptyState'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const MAX_VERSES = 200

// Pull the original-language word out of a Strong's definition header like
// "πορνεία porneía, por-ni'-ah; ..." — the lexicon's own `word` field is
// empty for most entries.
function extractOriginalWord(def) {
  if (!def) return ''
  const stripped = def.replace(/^[†*\s]+/, '')
  if (!/^[\u0370-\u03FF\u0590-\u05FF\u1F00-\u1FFF]/.test(stripped)) return ''
  return stripped.split(/\s+/)[0] || ''
}

function Lexicon() {
  const { strongs: strongsParam } = useParams()
  const navigate = useNavigate()
  const translation = getTranslation()
  const strongsNum = (strongsParam || '').toUpperCase()
  const language = strongsNum.startsWith('G') ? 'Greek' : strongsNum.startsWith('H') ? 'Hebrew' : ''

  const [lexEntry, setLexEntry] = useState(null)
  const [verses, setVerses] = useState([])
  const [verseTexts, setVerseTexts] = useState({})
  const [loading, setLoading] = useState(true)
  const [truncated, setTruncated] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!strongsNum) { setLoading(false); return }
      setLoading(true)
      setVerseTexts({})

      const [entry, allVerses] = await Promise.all([
        lookupStrongs(strongsNum),
        getVersesForStrongs(strongsNum),
      ])
      if (cancelled) return

      setLexEntry(entry)
      const limited = allVerses.slice(0, MAX_VERSES)
      setTruncated(allVerses.length > MAX_VERSES)
      setVerses(limited)

      const chaptersByBook = {}
      for (const ref of limited) {
        const [bookId, ch] = ref.split('.')
        if (!chaptersByBook[bookId]) chaptersByBook[bookId] = new Set()
        chaptersByBook[bookId].add(ch)
      }

      const chapterPromises = []
      for (const [bookId, chapters] of Object.entries(chaptersByBook)) {
        for (const ch of chapters) {
          chapterPromises.push(
            getChapter(bookId, parseInt(ch), translation).then(data => ({ bookId, ch, data }))
          )
        }
      }
      const loaded = await Promise.all(chapterPromises)
      if (cancelled) return

      const texts = {}
      for (const { bookId, ch, data } of loaded) {
        for (const v of (data.verses || [])) {
          texts[`${bookId}.${ch}.${v.number}`] = v.text
        }
      }
      setVerseTexts(texts)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [strongsNum, translation])

  if (!strongsNum) {
    return (
      <div className="p-4">
        <BackButton label="Back" />
        <EmptyState
          emoji="📖"
          title="Word Study"
          description="Open any verse and tap an original-language word to study it here."
        />
      </div>
    )
  }

  const parsedDef = lexEntry ? parseStrongsDefinition(lexEntry.definition) : null
  const originalWord = lexEntry?.word || extractOriginalWord(lexEntry?.definition || '')
  const bookOrder = Object.fromEntries(BIBLE_BOOKS.map((b, i) => [b.id, i]))
  const bookNames = Object.fromEntries(BIBLE_BOOKS.map(b => [b.id, b.name]))

  const grouped = {}
  for (const ref of verses) {
    const [bookId] = ref.split('.')
    if (!grouped[bookId]) grouped[bookId] = []
    grouped[bookId].push(ref)
  }
  const sortedBookIds = Object.keys(grouped).sort((a, b) => (bookOrder[a] ?? 99) - (bookOrder[b] ?? 99))

  return (
    <div className="p-4 space-y-4">
      <BackButton label="Back" />

      {/* Word header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {originalWord && (
              <p
                className="text-3xl font-bold text-[var(--text-primary)] leading-tight"
                dir={language === 'Hebrew' ? 'rtl' : 'ltr'}
              >
                {originalWord}
              </p>
            )}
            {(parsedDef?.transliteration || lexEntry?.transliteration) && (
              <p className="text-sm italic text-[var(--text-secondary)] mt-1">
                {parsedDef?.transliteration || lexEntry?.transliteration}
                {lexEntry?.pronunciation && (
                  <span className="text-[var(--text-muted)]"> · say it: {lexEntry.pronunciation}</span>
                )}
              </p>
            )}
            {lexEntry?.partOfSpeech && (
              <p className="text-xs text-[var(--accent-secondary)] mt-1">{lexEntry.partOfSpeech}</p>
            )}
          </div>
          <span className="text-xs bg-[var(--bg-surface)] text-[var(--accent-secondary)] px-2 py-1 rounded-full font-mono flex-shrink-0">
            {strongsNum}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}
        </div>
      ) : !lexEntry ? (
        <EmptyState emoji="🔍" title="Not found" description={`No Strong's entry for ${strongsNum}.`} />
      ) : (
        <>
          {/* Definition */}
          {parsedDef && (parsedDef.literal || parsedDef.figurative.length > 0 || parsedDef.kjvUsages.length > 0) && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-wide">
                {language} Definition
              </h3>
              {parsedDef.literal && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Literal</p>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{parsedDef.literal}</p>
                </div>
              )}
              {parsedDef.figurative.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">By Extension</p>
                  <ul className="text-sm text-[var(--text-primary)] space-y-1">
                    {parsedDef.figurative.map((f, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-[var(--text-muted)]">→</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parsedDef.etymology && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Origin</p>
                  <p className="text-xs text-[var(--text-secondary)]">{parsedDef.etymology}</p>
                </div>
              )}
              {parsedDef.kjvUsages.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">KJV translates as</p>
                  <div className="flex flex-wrap gap-1">
                    {parsedDef.kjvUsages.map((u, i) => (
                      <span key={i} className="text-xs bg-[var(--bg-surface)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verses grouped by book */}
          <div>
            <h3 className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-wide mb-3">
              Used in {verses.length}{truncated ? '+' : ''} verse{verses.length !== 1 ? 's' : ''}
              <span className="font-normal text-[var(--text-muted)] ml-1 normal-case">
                · see it in context ({getTranslationName(translation)})
              </span>
            </h3>

            {verses.length === 0 ? (
              <EmptyState
                emoji="📚"
                title="No occurrences"
                description="This Strong's number isn't tagged to any verse in the bundled mapping."
              />
            ) : (
              sortedBookIds.map(bookId => (
                <div key={bookId} className="mb-4">
                  <p className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wide">
                    {bookNames[bookId]} <span className="text-[var(--text-muted)] normal-case">({grouped[bookId].length})</span>
                  </p>
                  <div className="space-y-1">
                    {grouped[bookId].map(ref => {
                      const [, ch, vs] = ref.split('.')
                      const text = verseTexts[ref] || ''
                      return (
                        <button
                          key={ref}
                          onClick={() => {
                            triggerHaptic(HapticStyle.LIGHT)
                            navigate(`/bible/${bookId}/${ch}/${vs}`)
                          }}
                          className="w-full text-left bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg p-3 active:scale-[0.98] transition-transform"
                        >
                          <p className="text-xs font-bold text-[var(--accent-secondary)] mb-0.5">
                            {bookNames[bookId]} {ch}:{vs}
                          </p>
                          <p className="text-sm text-[var(--text-primary)] leading-snug line-clamp-2">
                            {text || <span className="text-[var(--text-muted)] italic">Loading...</span>}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}

            {truncated && (
              <p className="text-center text-xs text-[var(--text-muted)] mt-2 italic">
                Showing first {MAX_VERSES} occurrences.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Lexicon
