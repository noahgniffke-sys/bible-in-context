import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

export default function useFollowToggle(targetUserId, initialFollowing = false) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  // Re-sync when initialFollowing changes (e.g. after async profile load)
  useEffect(() => {
    setIsFollowing(initialFollowing)
  }, [initialFollowing])

  const toggle = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return

    setLoading(true)
    triggerHaptic(HapticStyle.LIGHT)
    const next = !isFollowing
    setIsFollowing(next)

    try {
      if (!next) {
        const { error } = await supabase.from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('follows')
          .insert([{ follower_id: user.id, following_id: targetUserId }])
        if (error && error.code !== '23505') throw error
        triggerHaptic(HapticStyle.SUCCESS)
      }
      return true
    } catch (err) {
      console.error('Follow toggle error:', err)
      setIsFollowing(!next)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, targetUserId, isFollowing])

  return { isFollowing, toggle, loading }
}
