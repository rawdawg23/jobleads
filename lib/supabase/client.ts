import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Return a dummy client during build time or when env vars are missing
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: (callback: any) => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithPassword: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
        signUp: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          }),
        }),
        insert: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
        update: () => ({
          eq: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
        }),
      }),
    } as any
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Check if Supabase is configured
export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
