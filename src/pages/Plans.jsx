import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import useLocalStorage from '../hooks/useLocalStorage'
import TabBar from '../components/TabBar'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

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
  const [subscriptions] = useLocalStorage('bic_plan_subs_local', [])

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
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Bible Plans</h2>
        {user && (
          <button
            onClick={() => { navigate('/plans/create'); triggerHaptic(HapticStyle.LIGHT) }}
            className="px-4 py-2 bg-[var(--accent-secondary)] text-white rounded-lg font-medium text-sm active:scale-95"
          >
            + Create
          </button>
        )}
      </div>

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
