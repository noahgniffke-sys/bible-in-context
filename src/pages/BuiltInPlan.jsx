import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import EmptyState from '../components/EmptyState'
import {
  getBuiltInPlan,
  getCompletedDays,
  toggleBuiltInDay,
} from '../data/plans/builtin'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function BuiltInPlan() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const plan = getBuiltInPlan(slug)
  const [completed, setCompleted] = useState([])

  useEffect(() => {
    setCompleted(getCompletedDays(slug))
  }, [slug])

  if (!plan) {
    return (
      <div className="p-4">
        <BackButton label="Plans" to="/plans" />
        <EmptyState
          emoji="📖"
          title="Plan Not Found"
          description="That built-in plan doesn't exist."
        />
      </div>
    )
  }

  function toggleDay(day) {
    triggerHaptic(HapticStyle.SUCCESS)
    setCompleted(toggleBuiltInDay(slug, day))
  }

  function openPassage(p) {
    triggerHaptic(HapticStyle.LIGHT)
    if (p.verse) navigate(`/bible/${p.bookId}/${p.chapter}/${p.verse}`)
    else navigate(`/bible/${p.bookId}/${p.chapter}`)
  }

  const totalDays = plan.days.length
  const progressPercent = totalDays > 0 ? Math.round((completed.length / totalDays) * 100) : 0

  return (
    <div className="p-4">
      <BackButton label="Plans" to="/plans" />

      {/* Plan header */}
      <div
        className="rounded-2xl p-5 mt-4 mb-4 overflow-hidden relative"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklab, var(--accent-primary) 22%, var(--bg-card)) 0%, var(--bg-card) 100%)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="text-4xl">{plan.emoji}</span>
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1"
              style={{ color: 'var(--gold-accent)' }}
            >
              Featured Plan
            </p>
            <h2 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
              {plan.title}
            </h2>
          </div>
        </div>
        {plan.description && (
          <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
            {plan.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>{totalDays} days</span>
          <span>·</span>
          <span>{plan.category?.replace('_', ' ')}</span>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-primary)] font-medium">
              {progressPercent}% complete
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {completed.length} of {totalDays}
            </span>
          </div>
          <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPercent}%`,
                background:
                  'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-2">
        {plan.days.map(day => {
          const isComplete = completed.includes(day.day)
          return (
            <div
              key={day.day}
              className="bg-[var(--bg-card)] rounded-xl p-4 border transition-colors"
              style={{
                borderColor: isComplete
                  ? 'color-mix(in oklab, var(--accent-success) 50%, transparent)'
                  : 'var(--border-primary)',
              }}
            >
              <div className="flex items-start justify-between mb-2 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] uppercase tracking-wider font-bold"
                      style={{ color: 'var(--gold-accent)' }}
                    >
                      Day {day.day}
                    </span>
                    {isComplete && (
                      <span className="text-[10px] uppercase tracking-wider text-[var(--accent-success)] font-bold">
                        ✓ Done
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1">
                    {day.title}
                  </h3>
                </div>
                <button
                  onClick={() => toggleDay(day.day)}
                  className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center min-h-[auto] min-w-[auto] active:scale-90 transition-colors ${
                    isComplete
                      ? 'bg-[var(--accent-success)] border-[var(--accent-success)] text-white'
                      : 'border-[var(--border-primary)]'
                  }`}
                  aria-label={isComplete ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isComplete && '✓'}
                </button>
              </div>

              {/* Passages */}
              {day.passages?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {day.passages.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => openPassage(p)}
                      className="text-xs bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] px-2.5 py-1 rounded-full font-medium min-h-[auto] min-w-[auto] active:scale-95 transition-transform"
                    >
                      {p.ref} →
                    </button>
                  ))}
                </div>
              )}

              {day.reflection && (
                <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                  {day.reflection}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BuiltInPlan
