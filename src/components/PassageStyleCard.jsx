export default function PassageStyleCard({ style, currentVerse, onOpenVerse }) {
  const patterns = style?.patterns || []
  if (patterns.length === 0) return null

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--gold-accent)] rounded-xl p-4 mb-4">
      <h3 className="text-xs font-bold text-[var(--gold-accent)] mb-3 uppercase tracking-wide">
        How this passage is written
      </h3>
      <div className="space-y-4">
        {patterns.map(pattern => (
          <div key={pattern.id}>
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{pattern.title}</p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{pattern.body}</p>
            {pattern.verses?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {pattern.verses.map(line => {
                  const current = line.verse === currentVerse
                  return (
                    <li key={line.verse}>
                      <button
                        type="button"
                        onClick={() => { if (!current) onOpenVerse(line.verse) }}
                        className={`w-full text-left text-sm leading-snug bg-transparent min-h-[auto] px-0 py-0.5 ${
                          current ? 'text-[var(--gold-accent)] font-medium' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="font-mono text-[10px] mr-2">{line.verse}</span>
                        {line.text}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
