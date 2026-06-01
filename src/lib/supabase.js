import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  console.warn('Missing Supabase environment variables. App will run in local-only mode.')
}

// Chainable mock — any method call returns another chainable; awaiting yields { data: [], error: null }.
function createMockChain() {
  const result = Promise.resolve({ data: [], error: null })
  return new Proxy(result, {
    get(target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return target[prop].bind(target)
      }
      return () => createMockChain()
    },
  })
}

function createMockClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithIdToken: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    },
    from: () => createMockChain(),
  }
}

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
    })
  : createMockClient()

export async function requireAuth() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, error: { message: 'Not authenticated' } }
  return { user, error: null }
}

// getProfile — uses raw fetch to bypass supabase-js's .single() hang AND
// getSession() refresh-loop hang.
export async function getProfile(userId) {
  try {
    const accessToken = readAccessToken()
    const headers = {
      apikey: supabaseAnonKey,
      Accept: 'application/json',
    }
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`

    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(userId)}`,
      { headers, signal: ctrl.signal }
    )
    clearTimeout(t)

    if (!res.ok) {
      const text = await res.text()
      return { data: null, error: { message: `HTTP ${res.status}: ${text.slice(0, 200)}` } }
    }
    const rows = await res.json()
    return { data: rows?.[0] || null, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'getProfile failed' } }
  }
}

export async function createProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, ...profileData }])
    .select()
    .single()
  return { data, error }
}

// Synchronously read the access token from localStorage. Supabase-js stores
// the session there; we read it directly to avoid getSession() (which can
// trigger an internal token refresh that hangs).
function readAccessToken() {
  try {
    const projectRef = supabaseUrl.replace(/^https?:\/\//, '').split('.')[0]
    const raw = localStorage.getItem(`sb-${projectRef}-auth-token`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // supabase-js stores either { access_token, ... } OR [accessToken, refreshToken, ...]
    if (Array.isArray(parsed)) return parsed[0] || null
    return parsed?.access_token || parsed?.currentSession?.access_token || null
  } catch {
    return null
  }
}

// updateProfile — raw fetch PATCH with 10s timeout. Avoids supabase-js's
// .maybeSingle() hang and getSession() refresh-loop hang.
export async function updateProfile(userId, updates) {
  const accessToken = readAccessToken()
  if (!accessToken) {
    console.error('[updateProfile] no access token in localStorage')
    return { data: null, error: { message: 'Not authenticated — please sign in again' } }
  }

  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 10000)
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(updates),
        signal: ctrl.signal,
      }
    )
    clearTimeout(t)

    const text = await res.text()
    if (!res.ok) {
      console.error('[updateProfile] HTTP', res.status, text)
      if (text.includes('23505') || text.includes('duplicate key')) {
        return { data: null, error: { code: '23505', message: 'That username is already taken' } }
      }
      return { data: null, error: { message: `HTTP ${res.status}: ${text.slice(0, 200)}` } }
    }
    let rows = []
    try { rows = JSON.parse(text) } catch {}
    return { data: rows?.[0] || null, error: null }
  } catch (err) {
    console.error('[updateProfile] fetch error', err)
    if (err.name === 'AbortError') return { data: null, error: { message: 'Save timed out after 10s — please try again' } }
    return { data: null, error: { message: err.message || 'update failed' } }
  }
}

// checkUsernameAvailable — raw fetch with anon key. Pass currentUserId to
// exclude the caller's own row (so re-submitting your existing username
// isn't flagged as taken).
export async function checkUsernameAvailable(username, currentUserId = null) {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=id,username&username=eq.${encodeURIComponent(username)}&limit=2`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Accept: 'application/json',
        },
        signal: ctrl.signal,
      }
    )
    clearTimeout(t)
    if (!res.ok) return { available: false, error: { message: `HTTP ${res.status}` } }
    const rows = await res.json()
    if (rows.length === 0) return { available: true, error: null }
    if (currentUserId && rows.every((r) => r.id === currentUserId)) {
      return { available: true, error: null }
    }
    return { available: false, error: null }
  } catch (err) {
    return { available: false, error: { message: err.message || 'check failed' } }
  }
}
