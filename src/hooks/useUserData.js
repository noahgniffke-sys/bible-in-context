import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import useLocalStorage from './useLocalStorage'
import { useAuth } from './useAuth'

const CONFIG = {
  notes:      { table: 'notes',      key: 'bic_notes_local' },
  highlights: { table: 'highlights', key: 'bic_highlights_local' },
  bookmarks:  { table: 'bookmarks',  key: 'bic_bookmarks_local' },
  prayers:    { table: 'prayers',    key: 'bic_prayers_local' },
}

const isUuid = (v) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

// Strip client-only fields the DB doesn't accept (e.g. user_id is set server-side from auth context)
function forCloud(item, userId) {
  const out = { ...item, user_id: userId }
  if (!isUuid(out.id)) delete out.id
  return out
}

export function useUserData(kind) {
  const cfg = CONFIG[kind]
  if (!cfg) throw new Error(`useUserData: unknown kind "${kind}"`)

  const { user } = useAuth()
  const [items, setItems] = useLocalStorage(cfg.key, [])
  const [syncing, setSyncing] = useState(false)

  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  const syncedForUser = useRef(null)

  // On sign-in: pull cloud, push any local-only items, replace state with merged set
  useEffect(() => {
    if (!user) {
      syncedForUser.current = null
      return
    }
    if (syncedForUser.current === user.id) return

    let cancelled = false
    setSyncing(true)
    ;(async () => {
      try {
        const { data: cloud, error } = await supabase
          .from(cfg.table)
          .select('*')
          .eq('user_id', user.id)
        if (error) throw error
        if (cancelled) return

        const cloudIds = new Set((cloud || []).map(c => c.id))
        const localOnly = itemsRef.current.filter(i => !cloudIds.has(i.id))

        if (localOnly.length > 0) {
          const payload = localOnly.map(i => forCloud(i, user.id))
          const { error: upErr } = await supabase.from(cfg.table).upsert(payload)
          if (upErr) console.error(`[${kind}] push local error:`, upErr)
        }

        if (!cancelled) {
          syncedForUser.current = user.id
          setItems([...(cloud || []), ...localOnly])
        }
      } catch (err) {
        console.error(`[${kind}] cloud sync error:`, err)
      } finally {
        if (!cancelled) setSyncing(false)
      }
    })()

    return () => { cancelled = true }
  }, [user, cfg.table, kind, setItems])

  const add = useCallback(async (partial) => {
    const now = new Date().toISOString()
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    const item = { id, created_at: now, updated_at: now, ...partial }
    setItems(prev => [...prev, item])
    if (user) {
      const { error } = await supabase.from(cfg.table).insert(forCloud(item, user.id))
      if (error) console.error(`[${kind}] insert error:`, error)
    }
    return item
  }, [user, cfg.table, kind, setItems])

  // Update by id; pass partial fields to merge. Keeps offline + cloud in sync.
  const update = useCallback(async (id, patch) => {
    const now = new Date().toISOString()
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch, updated_at: now } : i))
    if (user) {
      const { error } = await supabase
        .from(cfg.table)
        .update({ ...patch, updated_at: now })
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) console.error(`[${kind}] update error:`, error)
    }
  }, [user, cfg.table, kind, setItems])

  const remove = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (user) {
      const { error } = await supabase
        .from(cfg.table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) console.error(`[${kind}] delete error:`, error)
    }
  }, [user, cfg.table, kind, setItems])

  // Replace full list; only used for bulk operations like multi-verse highlight.
  const replaceAll = useCallback(async (next) => {
    setItems(next)
    if (user) {
      const { error } = await supabase
        .from(cfg.table)
        .upsert(next.map(i => forCloud(i, user.id)))
      if (error) console.error(`[${kind}] replaceAll error:`, error)
    }
  }, [user, cfg.table, kind, setItems])

  return { items, add, update, remove, replaceAll, syncing }
}

export default useUserData
