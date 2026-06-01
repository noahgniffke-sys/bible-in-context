import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import useFollowToggle from '../hooks/useFollowToggle'
import { parseVerseRef, formatVerseRef } from '../lib/bible-books'
import { formatTimeAgo } from '../lib/utils'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'
import EmptyState from '../components/EmptyState'
import TabBar from '../components/TabBar'
import VerifiedBadge from '../components/VerifiedBadge'
import { useConfirm } from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'
import { blockUser, reportContent } from '../lib/social-moderation'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const PROFILE_TABS = [
  { key: 'highlights', label: 'Highlights' },
  { key: 'notes', label: 'Notes' },
]

function PublicProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()

  const [profile, setProfile] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('highlights')
  const [initialFollowing, setInitialFollowing] = useState(false)

  const { isFollowing, toggle: toggleFollow, loading: followLoading } = useFollowToggle(
    profile?.id,
    initialFollowing
  )

  useEffect(() => {
    loadProfile()
  }, [username])

  // Live follower count subscription — disabled until Realtime is enabled
  // on the profiles table in Supabase. Re-enable after running the SQL.
  // useEffect(() => {
  //   if (!profile?.id) return
  //   const channel = supabase
  //     .channel(`profile-${profile.id}`)
  //     .on('postgres_changes', {
  //       event: 'UPDATE',
  //       schema: 'public',
  //       table: 'profiles',
  //       filter: `id=eq.${profile.id}`,
  //     }, (payload) => {
  //       if (payload.new) setProfile((prev) => ({ ...(prev || {}), ...payload.new }))
  //     })
  //     .subscribe()
  //   return () => { supabase.removeChannel(channel) }
  // }, [profile?.id])

  async function loadProfile() {
    setLoading(true)
    setError(null)
    try {
      // Get profile (avoid .single() — hangs in this project)
      const { data: profileRows, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .limit(1)

      if (profileError) throw profileError
      const profileData = profileRows?.[0]
      if (!profileData) throw new Error('Profile not found')
      setProfile(profileData)

      // Check if following (avoid .single() — hangs in this project)
      if (user && profileData.id !== user.id) {
        const { data: followRows } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .limit(1)
        setInitialFollowing(Boolean(followRows?.length))
      }

      // Get public highlights and notes
      const [highlightsResult, notesResult] = await Promise.all([
        supabase.from('highlights')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false }),
        supabase.from('notes')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false }),
      ])

      setHighlights(highlightsResult.data || [])
      setNotes(notesResult.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleBlock() {
    if (!profile) return
    const ok = await confirm({
      title: `Block @${profile.username}?`,
      message: "You won't see their highlights or notes, and they'll be removed from your feed.",
      confirmLabel: 'Block',
      destructive: true,
    })
    if (!ok) return
    triggerHaptic(HapticStyle.WARNING)
    const { error } = await blockUser(profile.id)
    if (error) { toast.error('Could not block user'); return }
    toast.info(`@${profile.username} blocked`)
    navigate(-1)
  }

  async function handleReport() {
    if (!profile) return
    const ok = await confirm({
      title: 'Report this user?',
      message: 'Our team will review this profile for objectionable content within 24 hours.',
      confirmLabel: 'Report',
      destructive: true,
    })
    if (!ok) return
    triggerHaptic(HapticStyle.WARNING)
    const { error } = await reportContent({
      reportedUserId: profile.id,
      type: 'profile',
      contentId: profile.id,
      contentText: profile.bio || profile.display_name,
    })
    if (error) { toast.error('Could not submit report'); return }
    toast.info('Thank you. This profile has been reported for review.')
  }

  if (loading) {
    return (
      <div className="p-4">
        <BackButton />
        <div className="mt-4 space-y-3">
          <div className="h-32 shimmer rounded-xl" />
          <div className="h-20 shimmer rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-4">
        <BackButton />
        <ErrorBanner message={error || 'User not found.'} className="mt-4" />
      </div>
    )
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="p-4">
      <BackButton />

      {/* Profile card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mt-4 mb-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-secondary)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
          {(profile.display_name || '?')[0].toUpperCase()}
        </div>
        <h2 className="display text-2xl text-[var(--text-primary)] inline-flex items-center justify-center gap-1.5">
          {profile.display_name}
          <VerifiedBadge username={profile.username} size={14} />
        </h2>
        <p className="text-sm text-[var(--text-muted)]">@{profile.username}</p>
        {profile.bio && (
          <p className="text-sm text-[var(--text-secondary)] mt-2">{profile.bio}</p>
        )}

        <div className="flex justify-center gap-6 mt-3">
          <div>
            <span className="block text-lg font-bold text-[var(--text-primary)]">{profile.followers_count || 0}</span>
            <span className="text-xs text-[var(--text-muted)]">Followers</span>
          </div>
          <div>
            <span className="block text-lg font-bold text-[var(--text-primary)]">{profile.following_count || 0}</span>
            <span className="text-xs text-[var(--text-muted)]">Following</span>
          </div>
        </div>

        {!isOwnProfile && user && (
          <>
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={isFollowing ? 'themed-btn mt-4 px-6 py-2 text-sm' : 'themed-btn-primary mt-4 px-6 py-2 text-sm'}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <div className="flex justify-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
              <button onClick={handleReport} className="hover:text-[var(--text-secondary)] transition-colors">
                Report
              </button>
              <span aria-hidden="true">·</span>
              <button onClick={handleBlock} className="hover:text-[var(--text-secondary)] transition-colors">
                Block
              </button>
            </div>
          </>
        )}
      </div>

      <TabBar tabs={PROFILE_TABS} activeTab={tab} onChange={setTab} />

      {/* Highlights */}
      {tab === 'highlights' && (
        highlights.length > 0 ? (
          <div className="space-y-2">
            {highlights.map(h => {
              const parsed = parseVerseRef(h.verse_ref)
              return (
                <button
                  key={h.id}
                  onClick={() => {
                    triggerHaptic(HapticStyle.LIGHT)
                    if (parsed.verse) navigate(`/bible/${parsed.bookId}/${parsed.chapter}/${parsed.verse}`)
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-[var(--border-primary)] active:scale-[0.98]"
                  style={{ backgroundColor: h.color }}
                >
                  <p className="text-sm font-bold text-[var(--accent-secondary)]">
                    {formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                  </p>
                  {h.verse_text && (
                    <p className="text-xs text-[var(--text-primary)] mt-1 line-clamp-2">{h.verse_text}</p>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <EmptyState emoji="🎨" title="No Public Highlights" description="This user hasn't shared any highlights yet." />
        )
      )}

      {/* Notes */}
      {tab === 'notes' && (
        notes.length > 0 ? (
          <div className="space-y-2">
            {notes.map(n => {
              const parsed = parseVerseRef(n.verse_ref)
              return (
                <div key={n.id} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                  <p className="text-sm font-bold text-[var(--accent-secondary)] mb-1">
                    {formatVerseRef(parsed.bookId, parsed.chapter, parsed.verse)}
                  </p>
                  <p className="text-sm text-[var(--text-primary)]">{n.content}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">{formatTimeAgo(n.created_at)}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState emoji="📝" title="No Public Notes" description="This user hasn't shared any notes yet." />
        )
      )}
    </div>
  )
}

export default PublicProfile
