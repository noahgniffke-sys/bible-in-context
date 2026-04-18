import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. App will run in local-only mode.')
}

function createMockSupabaseClient() {
  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithIdToken: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  }

  return {
    auth: mockAuth,
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), then: (fn) => fn({ data: [], error: null }) }), then: (fn) => fn({ data: [], error: null }) }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
      upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
    })
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      }
    })
  : createMockSupabaseClient()

export async function requireAuth() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, error: { message: 'Not authenticated' } }
  return { user, error: null }
}

// Profile operations
export async function getProfile(userId) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function createProfile(userId, profileData) {
  return supabase.from('profiles').insert([{ id: userId, ...profileData }]).select().single()
}

export async function updateProfile(userId, updates) {
  return supabase.from('profiles').update(updates).eq('id', userId).select().single()
}
