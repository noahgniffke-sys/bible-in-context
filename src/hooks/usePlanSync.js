import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import useLocalStorage from './useLocalStorage'
import { useAuth } from './useAuth'

// Distinct from useUserData: plan_subscriptions has 1 row per (user, plan)
// and plan_progress has 1 row per (subscription, day_number) — the shape
// doesn't fit the flat-list pattern.
export default function usePlanSync() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useLocalStorage('bic_plan_subs_local', [])
  const [progress, setProgress] = useLocalStorage('bic_plan_progress_local', {})

  const syncedForUser = useRef(null)

  useEffect(() => {
    if (!user) {
      syncedForUser.current = null
      return
    }
    if (syncedForUser.current === user.id) return

    let cancelled = false
    ;(async () => {
      try {
        const { data: cloudSubs, error } = await supabase
          .from('plan_subscriptions')
          .select('*, plan_progress(day_number)')
          .eq('user_id', user.id)
        if (error) throw error
        if (cancelled) return

        const cloudPlanIds = new Set((cloudSubs || []).map(s => s.plan_id))

        // Push any local-only subscriptions to cloud
        const localOnly = subscriptions.filter(s => !cloudPlanIds.has(s.plan_id))
        const pushed = []
        for (const local of localOnly) {
          const { data: ins, error: insErr } = await supabase
            .from('plan_subscriptions')
            .insert({
              user_id: user.id,
              plan_id: local.plan_id,
              current_day: local.current_day || 1,
              started_at: local.started_at || new Date().toISOString(),
            })
            .select()
            .single()
          if (insErr) {
            console.error('[plans] push local sub error:', insErr)
            continue
          }
          pushed.push(ins)

          // Push any local progress for this plan
          const localCompleted = progress[local.plan_id]?.completedDays || []
          if (localCompleted.length > 0) {
            const rows = localCompleted.map(d => ({ subscription_id: ins.id, day_number: d }))
            const { error: pErr } = await supabase.from('plan_progress').upsert(rows, { onConflict: 'subscription_id,day_number' })
            if (pErr) console.error('[plans] push local progress error:', pErr)
          }
        }

        const allSubs = [...(cloudSubs || []), ...pushed]
        const nextSubs = allSubs.map(s => ({
          id: s.id,
          plan_id: s.plan_id,
          current_day: s.current_day,
          started_at: s.started_at,
        }))
        const nextProgress = {}
        for (const s of allSubs) {
          // For subs we just pushed, plan_progress isn't joined — pull from local
          const completedDays = s.plan_progress
            ? s.plan_progress.map(p => p.day_number)
            : (progress[s.plan_id]?.completedDays || [])
          nextProgress[s.plan_id] = { completedDays }
        }

        if (!cancelled) {
          setSubscriptions(nextSubs)
          setProgress(nextProgress)
          syncedForUser.current = user.id
        }
      } catch (err) {
        console.error('[plans] sync error:', err)
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function subscribe(planId) {
    let id
    let started_at = new Date().toISOString()
    if (user) {
      const { data, error } = await supabase
        .from('plan_subscriptions')
        .insert({ user_id: user.id, plan_id: planId, current_day: 1, started_at })
        .select()
        .single()
      if (error) {
        console.error('[plans] subscribe error:', error)
        id = `local-${Date.now()}`
      } else {
        id = data.id
        started_at = data.started_at
      }
    } else {
      id = `local-${Date.now()}`
    }
    setSubscriptions(prev => [...prev, { id, plan_id: planId, current_day: 1, started_at }])
  }

  async function unsubscribe(planId) {
    const sub = subscriptions.find(s => s.plan_id === planId)
    if (user && sub?.id && !String(sub.id).startsWith('local-')) {
      const { error } = await supabase
        .from('plan_subscriptions')
        .delete()
        .eq('id', sub.id)
        .eq('user_id', user.id)
      if (error) console.error('[plans] unsubscribe error:', error)
    }
    setSubscriptions(prev => prev.filter(s => s.plan_id !== planId))
    setProgress(prev => {
      const next = { ...prev }
      delete next[planId]
      return next
    })
  }

  async function toggleDayComplete(planId, dayNumber) {
    const sub = subscriptions.find(s => s.plan_id === planId)
    if (!sub) return
    const completed = progress[planId]?.completedDays || []
    const isComplete = completed.includes(dayNumber)

    if (user && sub.id && !String(sub.id).startsWith('local-')) {
      if (isComplete) {
        const { error } = await supabase
          .from('plan_progress')
          .delete()
          .eq('subscription_id', sub.id)
          .eq('day_number', dayNumber)
        if (error) console.error('[plans] uncomplete day error:', error)
      } else {
        const { error } = await supabase
          .from('plan_progress')
          .insert({ subscription_id: sub.id, day_number: dayNumber })
        if (error) console.error('[plans] complete day error:', error)
      }
    }

    setProgress(prev => ({
      ...prev,
      [planId]: {
        completedDays: isComplete
          ? completed.filter(d => d !== dayNumber)
          : [...completed, dayNumber],
      },
    }))
  }

  return { subscriptions, progress, subscribe, unsubscribe, toggleDayComplete }
}
