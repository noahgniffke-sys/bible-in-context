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

// getProfile — uses raw fetch to bypass supabase-js's .single() hang.
export async function getProfile(userId) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = {
      apikey: supabaseAnonKey,
      Accept: 'application/json',
    }
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`

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

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle()
  return { data, error }
}

export async function checkUsernameAvailable(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()
  if (error && error.code === 'PGRST116') return { available: true }
  return { available: false }
}
