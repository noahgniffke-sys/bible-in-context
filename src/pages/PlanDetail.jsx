import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import usePlanSync from '../hooks/usePlanSync'
import { parseVerseRef, formatVerseRef } from '../lib/bible-books'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function PlanDetail() {
  const { planId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [plan, setPlan] = useState(null)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { subscriptions, progress, subscribe: doSubscribe, unsubscribe: doUnsubscribe, toggleDayComplete: doToggleDay } = usePlanSync()

  const subscription = subscriptions.find(s => s.plan_id === planId)
  const planProgress = progress[planId] || { completedDays: [] }

  useEffect(() => {
    loadPlan()
  }, [planId])

  async function loadPlan() {
    setLoading(true)
    try {
      const [planResult, daysResult] = await Promise.all([
        supabase.from('plans').select('*, profiles(username, display_name)').eq('id', planId).single(),
        supabase.from('plan_days').select('*').eq('plan_id', planId).order('day_number'),
      ])

      if (planResult.error) throw planResult.error
      setPlan(planResult.data)
      setDays(daysResult.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function subscribe() {
    triggerHaptic(HapticStyle.SUCCESS)
    await doSubscribe(planId)
    toast.success('Plan started!')
  }

  async function unsubscribe() {
    triggerHaptic(HapticStyle.LIGHT)
    await doUnsubscribe(planId)
    toast.info('Unfollowed plan')
  }

  async function toggleDayComplete(dayNumber) {
    triggerHaptic(HapticStyle.SUCCESS)
    await doToggleDay(planId, dayNumber)
  }

  if (loading) {
    return (
      <div className="p-4">
        <BackButton label="Plans" to="/plans" />
        <div className="mt-4 space-y-3">
          <div className="h-32 shimmer rounded-xl" />
          <div className="h-20 shimmer rounded-xl" />
          <div className="h-20 shimmer rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="p-4">
        <BackButton label="Plans" to="/plans" />
        <ErrorBanner message={error || 'Plan not found.'} className="mt-4" />
      </div>
    )
  }

  const completedCount = (planProgress.completedDays || []).length
  const progressPercent = plan.total_days > 0 ? Math.round((completedCount / plan.total_days) * 100) : 0

  return (
    <div className="p-4">
      <BackButton label="Plans" to="/plans" />

      {/* Plan header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mt-4 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{plan.cover_emoji || '📖'}</span>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{plan.title}</h2>
            <p className="text-xs text-[var(--accent-secondary)]">
              by @{plan.profiles?.username || 'unknown'}
            </p>
          </div>
        </div>
        {plan.description && (
          <p className="text-sm text-[var(--text-secondary)] mb-3">{plan.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>{plan.total_days} day{plan.total_days !== 1 ? 's' : ''}</span>
          <span>{plan.category?.replace('_', ' ')}</span>
          <span>{plan.subscriber_count || 0} follower{(plan.subscriber_count || 0) !== 1 ? 's' : ''}</span>
        </div>

        {/* Subscribe/progress */}
        {subscription ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-primary)] font-medium">
                {progressPercent}% complete
              </span>
              <button
                onClick={unsubscribe}
                className="text-xs text-[var(--text-muted)] min-h-[auto] min-w-[auto]"
              >
                Unfollow
              </button>
            </div>
            <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-secondary)] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={subscribe}
            className="w-full mt-4 py-3 bg-[var(--accent-secondary)] text-white rounded-xl font-bold active:scale-95"
          >
            Start Plan
          </button>
        )}
      </div>

      {/* Days list */}
      <div className="space-y-2">
        {days.map(day => {
          const isComplete = (planProgress.completedDays || []).includes(day.day_number)
          return (
            <div
              key={day.day_number}
              className={`bg-[var(--bg-card)] border rounded-xl p-4 ${
                isComplete ? 'border-[var(--accent-success)]/50' : 'border-[var(--border-primary)]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    Day {day.day_number}
                  </span>
                  {day.title && (
                    <span className="text-sm text-[var(--text-secondary)] ml-2">{day.title}</span>
                  )}
                </div>
                {subscription && (
                  <button
                    onClick={() => toggleDayComplete(day.day_number)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center min-h-[auto] min-w-[auto] ${
                      isComplete
                        ? 'bg-[var(--accent-success)] border-[var(--accent-success)] text-white'
                        : 'border-[var(--border-primary)]'
                    }`}
                  >
                    {isComplete && '✓'}
                  </button>
                )}
              </div>

              {/* Verse references */}
              {day.verse_refs && day.verse_refs.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {day.verse_refs.map((ref, idx) => {
                    const parsed = parseVerseRef(ref)
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          triggerHaptic(HapticStyle.LIGHT)
                          if (parsed.verse) navigate(`/bible/${parsed.bookId}/${parsed.chapter}/${parsed.verse}`)
                          else if (parsed.chapter) navigate(`/bible/${parsed.bookId}/${parsed.chapter}`)
                        }}
                        className="text-xs bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] px-2 py-1 rounded-full min-h-[auto] min-w-[auto]"
                      >
                        {formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                      </button>
                    )
                  })}
                </div>
              )}

              {day.reflection_prompt && (
                <p className="text-xs text-[var(--text-muted)] italic">{day.reflection_prompt}</p>
              )}
            </div>
          )
        })}

        {days.length === 0 && (
          <p className="text-center text-[var(--text-muted)] text-sm py-8">
            No days added to this plan yet.
          </p>
        )}
      </div>
    </div>
  )
}

export default PlanDetail
