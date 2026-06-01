// User blocking + content reporting.
// Required for App Store Guideline 1.2 (user-generated content must be
// reportable and abusive users blockable).
//
// All functions fail soft: if the moderation tables don't exist yet
// (migration not run) they return empty/neutral results instead of throwing,
// so the rest of the app keeps working.

import { supabase, requireAuth } from './supabase'

// Block a user. Returns { error } — null on success.
export async function blockUser(blockedId) {
  const { user, error: authError } = await requireAuth()
  if (authError) return { error: authError }
  if (user.id === blockedId) return { error: { message: "You can't block yourself" } }

  const { error } = await supabase
    .from('user_blocks')
    .insert([{ blocker_id: user.id, blocked_id: blockedId }])

  // Duplicate block (already blocked) is a no-op success.
  if (error && !String(error.code).includes('23505')) return { error }
  return { error: null }
}

export async function unblockUser(blockedId) {
  const { user, error: authError } = await requireAuth()
  if (authError) return { error: authError }

  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId)

  return { error: error || null }
}

// IDs of everyone the current user has blocked. Empty array on any failure.
export async function getBlockedUserIds() {
  try {
    const { user } = await requireAuth()
    if (!user) return []
    const { data, error } = await supabase
      .from('user_blocks')
      .select('blocked_id')
      .eq('blocker_id', user.id)
    if (error) return []
    return (data || []).map((r) => r.blocked_id)
  } catch {
    return []
  }
}

export async function isUserBlocked(blockedId) {
  const ids = await getBlockedUserIds()
  return ids.includes(blockedId)
}

// File a report against a piece of content or a profile.
// type: 'note' | 'highlight' | 'profile'
export async function reportContent({ reportedUserId, type, contentId = null, contentText = null, reason = null }) {
  const { user, error: authError } = await requireAuth()
  if (authError) return { error: authError }

  const { error } = await supabase.from('content_reports').insert([{
    reporter_id: user.id,
    reported_user_id: reportedUserId || null,
    content_type: type,
    content_id: contentId,
    content_text: contentText ? String(contentText).slice(0, 1000) : null,
    reason,
  }])

  return { error: error || null }
}
