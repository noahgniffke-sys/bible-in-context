import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { parseVerseRef, formatVerseRef } from '../lib/bible-books'
import { formatTimeAgo } from '../lib/utils'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

function Feed() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) loadFeed()
    else setLoading(false)
  }, [user])

  async function loadFeed() {
    setLoading(true)
    setError(null)
    try {
      // Get users I follow
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (!follows || follows.length === 0) {
        setItems([])
        setLoading(false)
        return
      }

      const followingIds = follows.map(f => f.following_id)

      // Get their public highlights and notes
      const [highlightsResult, notesResult] = await Promise.all([
        supabase.from('highlights')
          .select('*, profiles(username, display_name, avatar_url)')
          .in('user_id', followingIds)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('notes')
          .select('*, profiles(username, display_name, avatar_url)')
          .in('user_id', followingIds)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      const allItems = [
        ...(highlightsResult.data || []).map(h => ({ ...h, type: 'highlight' })),
        ...(notesResult.data || []).map(n => ({ ...n, type: 'note' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setItems(allItems)
    } catch (err) {
      if (err.message !== 'Supabase not configured') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-4">
        <h2 className="display text-2xl text-[var(--text-primary)] mb-4">Feed</h2>
        <EmptyState
          emoji="👥"
          title="Sign In to See Your Feed"
          description="Follow other users to see their highlights and notes."
          actionLabel="Sign In"
          actionTo="/login"
        />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Feed</h2>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 shimmer rounded-xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const parsed = parseVerseRef(item.verse_ref)
            return (
              <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                {/* User info */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => {
                      triggerHaptic(HapticStyle.LIGHT)
                      navigate(`/u/${item.profiles?.username}`)
                    }}
                    className="flex items-center gap-2 min-h-[auto] min-w-[auto]"
                  >
                    <div className="w-7 h-7 rounded-full bg-[var(--accent-secondary)] flex items-center justify-center text-white text-xs font-bold">
                      {(item.profiles?.display_name || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {item.profiles?.display_name || 'User'}
                    </span>
                  </button>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    {formatTimeAgo(item.created_at)}
                  </span>
                </div>

                {/* Type badge */}
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${
                  item.type === 'highlight'
                    ? 'bg-[var(--highlight-yellow)] text-[var(--text-primary)]'
                    : 'bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]'
                }`}>
                  {item.type === 'highlight' ? 'Highlighted' : 'Note'}
                </span>

                {/* Verse reference */}
                <button
                  onClick={() => {
                    triggerHaptic(HapticStyle.LIGHT)
                    if (parsed.verse) navigate(`/bible/${parsed.bookId}/${parsed.chapter}/${parsed.verse}`)
                    else if (parsed.chapter) navigate(`/bible/${parsed.bookId}/${parsed.chapter}`)
                  }}
                  className="block min-h-[auto] min-w-[auto]"
                >
                  <p className="text-sm font-bold text-[var(--accent-secondary)] mb-1">
                    {formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                  </p>
                </button>

                {item.verse_text && (
                  <p className="text-sm text-[var(--text-primary)] italic mb-1 line-clamp-2">
                    "{item.verse_text}"
                  </p>
                )}

                {item.type === 'note' && item.content && (
                  <p className="text-sm text-[var(--text-secondary)] mt-2">{item.content}</p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          emoji="👥"
          title="Your Feed is Empty"
          description="Follow other users to see their public highlights and notes here."
        />
      )}
    </div>
  )
}

export default Feed
