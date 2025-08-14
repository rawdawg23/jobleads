import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const isSupabaseConfigured =
  (typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0) ||
  (typeof process.env.SUPABASE_URL === "string" &&
    process.env.SUPABASE_URL.length > 0 &&
    typeof process.env.SUPABASE_ANON_KEY === "string" &&
    process.env.SUPABASE_ANON_KEY.length > 0)

export const createClient = () => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: (callback: any) => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
      }),
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  return createSupabaseClient(supabaseUrl!, supabaseKey!)
}

export const supabase = createClient()
