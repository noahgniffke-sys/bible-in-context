import { excerptLexicon } from '../lib/lexicon-notes'

export default function LexiconNote({ note, compact = false, onOpen }) {
  if (!note?.text) return null
  const body = compact ? excerptLexicon(note.text) : note.text
  const clipped = compact && body.length < note.text.length

  return (
    <div className={compact ? 'mt-2 pt-2 border-t border-[var(--border-subtle)]' : 'bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4'}>
      <p className={`font-bold text-[var(--text-muted)] uppercase tracking-wide ${compact ? 'text-[10px] mb-1' : 'text-xs text-[var(--accent-secondary)] mb-2'}`}>
        {note.title}
      </p>
      <p className={`text-[var(--text-primary)] leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
        {body}
      </p>
      {clipped && onOpen && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          className="text-[10px] font-bold text-[var(--accent-secondary)] mt-1 min-h-[auto] p-0"
        >
          Read the rest of this entry
        </button>
      )}
      {!compact && (
        <p className="text-[10px] text-[var(--text-muted)] mt-2">{note.attribution}</p>
      )}
    </div>
  )
}
