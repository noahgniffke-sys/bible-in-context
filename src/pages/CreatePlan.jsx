import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { validateText } from '../lib/moderation'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const CATEGORIES = [
  { value: 'struggles', label: 'Struggles' },
  { value: 'curiosities', label: 'Curiosities' },
  { value: 'book_study', label: 'Book Study' },
  { value: 'devotional', label: 'Devotional' },
  { value: 'topical', label: 'Topical' },
]

const EMOJIS = ['📖', '🙏', '✝️', '🕊', '🔥', '❤️', '🌟', '🌿', '🏔', '💡', '🛡', '⚔️']

function CreatePlan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('devotional')
  const [emoji, setEmoji] = useState('📖')
  const [days, setDays] = useState([{ title: '', verseRefs: '', prompt: '' }])
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function addDay() {
    setDays([...days, { title: '', verseRefs: '', prompt: '' }])
    triggerHaptic(HapticStyle.LIGHT)
  }

  function removeDay(idx) {
    if (days.length <= 1) return
    setDays(days.filter((_, i) => i !== idx))
    triggerHaptic(HapticStyle.LIGHT)
  }

  function updateDay(idx, field, value) {
    const updated = [...days]
    updated[idx] = { ...updated[idx], [field]: value }
    setDays(updated)
  }

  async function handlePublish() {
    setError(null)

    const titleCheck = validateText(title, 100, 'Title')
    if (!titleCheck.valid) { setError(titleCheck.error); return }

    if (description) {
      const descCheck = validateText(description, 500, 'Description')
      if (!descCheck.valid) { setError(descCheck.error); return }
    }

    // Validate each day has at least one verse reference
    for (let i = 0; i < days.length; i++) {
      if (!days[i].verseRefs.trim()) {
        setError(`Day ${i + 1} needs at least one verse reference.`)
        return
      }
    }

    setLoading(true)
    triggerHaptic(HapticStyle.MEDIUM)

    try {
      // Create the plan
      const { data: plan, error: planError } = await supabase.from('plans').insert([{
        creator_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        cover_emoji: emoji,
        total_days: days.length,
        is_published: isPublic,
      }]).select().single()

      if (planError) throw planError

      // Create the plan days
      const planDays = days.map((day, idx) => ({
        plan_id: plan.id,
        day_number: idx + 1,
        title: day.title.trim() || null,
        verse_refs: day.verseRefs.split(',').map(r => r.trim()).filter(Boolean),
        reflection_prompt: day.prompt.trim() || null,
      }))

      const { error: daysError } = await supabase.from('plan_days').insert(planDays)
      if (daysError) throw daysError

      triggerHaptic(HapticStyle.SUCCESS)
      toast.success('Plan published!')
      navigate(`/plans/${plan.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      triggerHaptic(HapticStyle.ERROR)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-4">
        <BackButton label="Plans" to="/plans" />
        <div className="mt-8 text-center">
          <p className="text-[var(--text-secondary)] mb-4">Sign in to create a Bible plan.</p>
          <Link to="/login" className="themed-btn-primary inline-block px-6 py-3">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <BackButton label="Plans" to="/plans" />

      <h2 className="display text-2xl text-[var(--text-primary)] mt-4 mb-4">Create Bible Plan</h2>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {/* Emoji picker */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => { setEmoji(e); triggerHaptic(HapticStyle.LIGHT) }}
            className={`text-2xl p-2 rounded-lg min-h-[auto] min-w-[auto] ${
              emoji === e ? 'bg-[var(--accent-secondary)]/20 ring-2 ring-[var(--accent-secondary)]' : ''
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Plan title"
        maxLength={100}
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm mb-3 focus:outline-none focus:border-[var(--accent-secondary)]"
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        maxLength={500}
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm mb-3 resize-none min-h-[80px] focus:outline-none focus:border-[var(--accent-secondary)]"
      />

      {/* Category */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => { setCategory(c.value); triggerHaptic(HapticStyle.LIGHT) }}
            className={`px-3 py-2 rounded-lg text-xs font-medium min-h-[auto] min-w-[auto] ${
              category === c.value
                ? 'bg-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Days */}
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">
        Daily Readings ({days.length} day{days.length !== 1 ? 's' : ''})
      </h3>

      <div className="space-y-3 mb-4">
        {days.map((day, idx) => (
          <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--accent-secondary)]">Day {idx + 1}</span>
              {days.length > 1 && (
                <button
                  onClick={() => removeDay(idx)}
                  className="text-xs text-[var(--accent-error)] min-h-[auto] min-w-[auto]"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              value={day.title}
              onChange={(e) => updateDay(idx, 'title', e.target.value)}
              placeholder="Day title (optional)"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-xs mb-2 focus:outline-none focus:border-[var(--accent-secondary)]"
            />
            <input
              type="text"
              value={day.verseRefs}
              onChange={(e) => updateDay(idx, 'verseRefs', e.target.value)}
              placeholder="Verse refs: GEN.1.1, JHN.3.16"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-xs mb-2 focus:outline-none focus:border-[var(--accent-secondary)]"
            />
            <input
              type="text"
              value={day.prompt}
              onChange={(e) => updateDay(idx, 'prompt', e.target.value)}
              placeholder="Reflection prompt (optional)"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-secondary)]"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addDay}
        className="w-full py-2 border border-dashed border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-muted)] mb-6 active:scale-95"
      >
        + Add Day
      </button>

      <div
        role="button"
        onClick={() => setIsPublic(!isPublic)}
        className="flex items-center justify-between px-3 py-3 rounded-xl border border-[var(--border-primary)] cursor-pointer mb-3"
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18 }}>{isPublic ? '🌍' : '🔒'}</span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {isPublic ? 'Public plan' : 'Private plan'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {isPublic ? 'Anyone can discover and follow this plan' : 'Only you can see and use this plan'}
            </p>
          </div>
        </div>
        <div
          className="w-10 h-6 rounded-full relative transition-colors flex-shrink-0"
          style={{ backgroundColor: isPublic ? 'var(--accent-secondary)' : 'var(--border-primary)' }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
            style={{ transform: isPublic ? 'translateX(18px)' : 'translateX(2px)' }}
          />
        </div>
      </div>

      <button
        onClick={handlePublish}
        disabled={loading || !title.trim()}
        className="themed-btn-primary w-full py-3 disabled:opacity-50"
      >
        {loading ? 'Publishing...' : isPublic ? 'Publish Plan' : 'Save Plan'}
      </button>
    </div>
  )
}

export default CreatePlan
