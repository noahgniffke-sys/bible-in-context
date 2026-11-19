import { useEffect, useState } from 'react'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getBlockedUserIds } from '../lib/social-moderation'
import BackButton from '../components/BackButton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import VerifiedBadge from '../components/VerifiedBadge'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const LISTS = {
  followers: {
    title: 'Followers',
    emptyTitle: 'No followers yet',
    emptyDescription: 'When someone follows this account, they show up here.',
    personColumn: 'follower_id',
    ownerColumn: 'following_id',
  },
  following: {
    title: 'Following',
    emptyTitle: 'Not following anyone',
    emptyDescription: 'Accounts this profile follows show up here.',
    personColumn: 'following_id',
    ownerColumn: 'follower_id',
  },
}

function FollowList() {
  const { username } = useParams()
  const navigate = useNavigate()
  const relation = useMatch('/u/:username/followers') ? 'followers' : 'following'
  const spec = LISTS[relation]
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setPeople([])

      const list = LISTS[relation]
      if (!list) {
        setError('That list does not exist.')
        setLoading(false)
        return
      }

      try {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', username)
          .limit(1)
        if (profileError) throw profileError
        const profile = profileRows?.[0]
        if (!profile) throw new Error('Profile not found')

        const { data: followRows, error: followError } = await supabase
          .from('follows')
          .select(`${list.personColumn}, created_at`)
          .eq(list.ownerColumn, profile.id)
          .order('created_at', { ascending: false })
        if (followError) throw followError

        const ids = (followRows || []).map((row) => row[list.personColumn]).filter(Boolean)
        const blocked = new Set(await getBlockedUserIds())
        const visibleIds = ids.filter((id) => !blocked.has(id))
        if (visibleIds.length === 0) return

        const { data: profiles, error: peopleError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, followers_count, bio')
          .in('id', visibleIds)
        if (peopleError) throw peopleError

        const byId = new Map((profiles || []).map((person) => [person.id, person]))
        if (!cancelled) setPeople(visibleIds.map((id) => byId.get(id)).filter(Boolean))
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load this list')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [username, relation])

  function openUser(name) {
    triggerHaptic(HapticStyle.LIGHT)
    navigate(`/u/${name}`)
  }

  return (
    <div className="p-4">
      <BackButton fallback={username ? `/u/${username}` : '/profile'} />

      <h1 className="display text-3xl text-[var(--text-primary)] mt-2">
        {spec?.title || 'People'}
      </h1>
      {username && (
        <p className="text-sm text-[var(--text-muted)] mb-4">@{username}</p>
      )}

      <ErrorBanner message={error} className="mb-4" />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 shimmer rounded-xl" />)}
        </div>
      ) : people.length > 0 ? (
        <div className="space-y-2">
          {people.map((person) => (
            <button
              key={person.id}
              onClick={() => openUser(person.username)}
              className="w-full flex items-center gap-3 text-left bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-3 active:scale-[0.98] transition-transform"
            >
              {person.avatar_url ? (
                <img src={person.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--accent-secondary)] flex items-center justify-center text-white font-bold">
                  {(person.display_name || person.username || '?')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {person.display_name || person.username}
                  </p>
                  <VerifiedBadge username={person.username} size={12} />
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  @{person.username} · {person.followers_count || 0} followers
                </p>
                {person.bio && (
                  <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{person.bio}</p>
                )}
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[var(--text-muted)]">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      ) : !error ? (
        <EmptyState
          emoji="👥"
          title={spec?.emptyTitle || 'Nobody here'}
          description={spec?.emptyDescription}
        />
      ) : null}
    </div>
  )
}

export default FollowList
