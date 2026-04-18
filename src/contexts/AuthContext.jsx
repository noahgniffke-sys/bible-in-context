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

  async function loadProfile(userId) {
    try {
      const { data, error } = await getProfile(userId)

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile(data)
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const meta = authUser.user_metadata || {}
          const email = authUser.email || ''
          const username = (meta.preferred_username || meta.name || email.split('@')[0] || 'user')
            .toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30)

          const { data: newProfile } = await createProfile(userId, {
            username: `${username}_${Date.now().toString(36)}`,
            display_name: meta.full_name || meta.name || username,
            avatar_url: meta.avatar_url || meta.picture || null,
            profile_setup_complete: false
          })
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
