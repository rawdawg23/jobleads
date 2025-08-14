import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"

export const createClient = cache(() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
        exchangeCodeForSession: async () => ({ data: null, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          }),
          order: () => ({ data: [], error: null }),
        }),
        insert: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        update: () => ({
          eq: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        }),
        delete: () => ({
          eq: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        }),
      }),
    } as any
  }

  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
})

export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
