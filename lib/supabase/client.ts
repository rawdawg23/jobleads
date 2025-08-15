import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if we're in a browser environment and Supabase environment variables are available
export const isSupabaseConfigured =
  typeof window !== "undefined" &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

let supabaseClient: any = null

export function createClient() {
  if (typeof window === "undefined") {
    return {
      auth: {
        signInWithPassword: async () => ({ data: null, error: new Error("Not available during build") }),
        signUp: async () => ({ data: null, error: new Error("Not available during build") }),
        signOut: async () => ({ error: new Error("Not available during build") }),
        onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error("Not available during build") }),
          }),
        }),
        insert: async () => ({ data: null, error: new Error("Not available during build") }),
      }),
    } as any
  }

  if (!supabaseClient && isSupabaseConfigured) {
    supabaseClient = createClientComponentClient()
  }

  return supabaseClient
}

export const supabase = createClient()
