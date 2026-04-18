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

    try {
      if (isFollowing) {
        await supabase.from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
        setIsFollowing(false)
      } else {
        await supabase.from('follows')
          .insert([{ follower_id: user.id, following_id: targetUserId }])
        setIsFollowing(true)
        triggerHaptic(HapticStyle.SUCCESS)
      }
    } catch (err) {
      console.error('Follow toggle error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, targetUserId, isFollowing])

  return { isFollowing, toggle, loading }
}
