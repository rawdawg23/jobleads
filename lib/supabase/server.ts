import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export const createClient = cache(() => {
  const cookieStore = cookies()

  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
        signUp: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: (table: string) => ({
        select: (columns: string) => ({
          eq: (column: string, value: any) => ({
            single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          }),
        }),
        insert: (data: any) => Promise.resolve({ error: { message: "Supabase not configured" } }),
        update: (data: any) => ({
          eq: (column: string, value: any) => Promise.resolve({ error: { message: "Supabase not configured" } }),
        }),
      }),
    } as any
  }

  return createServerComponentClient({ cookies: () => cookieStore })
})
