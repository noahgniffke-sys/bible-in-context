import { createContext, useEffect, useState } from 'react'
import { supabase, getProfile, createProfile } from '../lib/supabase'

export const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          loadProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Live profile updates via Realtime — only attach if Realtime is enabled
  // (otherwise the subscription connects but the channel just sits idle).
  // Disabled until we confirm Realtime publication is active on the project.
  // useEffect(() => {
  //   if (!user?.id) return
  //   const channel = supabase
  //     .channel(`profile-self-${user.id}`)
  //     .on('postgres_changes', {
  //       event: 'UPDATE',
  //       schema: 'public',
  //       table: 'profiles',
  //       filter: `id=eq.${user.id}`,
  //     }, (payload) => {
  //       if (payload.new) setProfile((prev) => ({ ...(prev || {}), ...payload.new }))
  //     })
  //     .subscribe()
  //   return () => { supabase.removeChannel(channel) }
  // }, [user?.id])

  async function loadProfile(userId) {
    try {
      const { data, error } = await getProfile(userId)
      if (error) console.warn('[auth] getProfile error:', error)

      if (data) {
        setProfile(data)
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const meta = authUser.user_metadata || {}
          const email = authUser.email || ''
          const base = (meta.preferred_username || meta.name || email.split('@')[0] || 'user')
            .toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 14) || 'user'

          const { data: newProfile, error: createErr } = await createProfile(userId, {
            username: `${base}_${Date.now().toString(36).slice(-5)}`,
            display_name: meta.full_name || meta.name || base,
            avatar_url: meta.avatar_url || meta.picture || null,
            profile_setup_complete: false
          })
          if (createErr) console.warn('[auth] createProfile error:', createErr)
          setProfile(newProfile)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id)
  }

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    signOut: async () => {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { useAuth } from '../hooks/useAuth'
