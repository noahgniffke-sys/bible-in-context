import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import usePlanSync from '../hooks/usePlanSync'
import TabBar from '../components/TabBar'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import { triggerHaptic, HapticStyle } from '../lib/haptics'
import { BUILT_IN_PLANS, getCompletedDays } from '../data/plans/builtin'

const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'struggles', label: 'Struggles' },
  { key: 'devotional', label: 'Devotional' },
  { key: 'book_study', label: 'Book Study' },
]

function Plans() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [category, setCategory] = useState('all')
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { subscriptions } = usePlanSync()

  useEffect(() => {
    loadPlans()
  }, [category])

  async function loadPlans() {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from('plans').select('*, profiles(username, display_name)').eq('is_published', true).order('subscriber_count', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setPlans(data || [])
    } catch (err) {
      // If Supabase isn't configured, show empty state
      setPlans([])
      if (err.message !== 'Supabase not configured') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function isSubscribed(planId) {
    return subscriptions.some(s => s.plan_id === planId)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="display text-2xl text-[var(--text-primary)]">Bible Plans</h2>
        {user && (
          <button
            onClick={() => { navigate('/plans/create'); triggerHaptic(HapticStyle.LIGHT) }}
            className="themed-btn-primary px-4 py-2 text-sm"
          >
            + Create
          </button>
        )}
      </div>

      {/* Featured / built-in plans */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold mb-3 px-1">
          Featured · Christ-Centered Studies
        </p>
        <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 snap-x snap-mandatory scrollbar-none">
          {BUILT_IN_PLANS.map(p => {
            const done = getCompletedDays(p.slug).length
            const total = p.days.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <button
                key={p.slug}
                onClick={() => { navigate(`/plans/built/${p.slug}`); triggerHaptic(HapticStyle.LIGHT) }}
                className="snap-start shrink-0 w-64 text-left rounded-2xl p-4 active:scale-[0.98] transition-transform"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in oklab, var(--accent-primary) 18%, var(--bg-card)) 0%, var(--bg-card) 100%)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: '0 4px 14px -8px var(--accent-glow)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] font-bold"
                    style={{ color: 'var(--gold-accent)' }}
                  >
                    Featured
                  </span>
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-sm leading-tight mb-1">
                  {p.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 min-h-[2.4em]">
                  {p.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>{total} days</span>
                  {done > 0 && (
                    <span style={{ color: 'var(--accent-success)' }}>
                      {pct}% complete
                    </span>
                  )}
                </div>
                {done > 0 && (
                  <div className="h-1 mt-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'var(--accent-success)' }}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold mb-2 px-1">
        Community Plans
      </p>
      <TabBar tabs={CATEGORY_TABS} activeTab={category} onChange={setCategory} variant="pill" />

      {error && <ErrorBanner message={error} className="my-4" />}

      <div className="mt-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 shimmer rounded-xl" />
            ))}
          </div>
        ) : plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map(plan => (
              <button
                key={plan.id}
                onClick={() => { navigate(`/plans/${plan.id}`); triggerHaptic(HapticStyle.LIGHT) }}
                className="w-full text-left bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{plan.cover_emoji || '📖'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[var(--text-primary)] text-sm truncate">{plan.title}</h3>
                      {isSubscribed(plan.id) && (
                        <span className="text-xs bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] px-2 py-0.5 rounded-full">Following</span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{plan.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {plan.total_days} day{plan.total_days !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {plan.subscriber_count || 0} follower{(plan.subscriber_count || 0) !== 1 ? 's' : ''}
                      </span>
                      {plan.profiles && (
                        <span className="text-xs text-[var(--accent-secondary)]">
                          by @{plan.profiles.username}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="📖"
            title="No Plans Yet"
            description={user
              ? 'Be the first to create a Bible plan for the community!'
              : 'Sign in to create and follow Bible reading plans.'
            }
            actionLabel={user ? 'Create Plan' : 'Sign In'}
            actionTo={user ? '/plans/create' : '/login'}
          />
        )}
      </div>
    </div>
  )
}

export default Plans
