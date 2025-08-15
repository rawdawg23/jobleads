import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const createClient = () => {
  const cookieStore = cookies()

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: (table: string) => ({
        select: (columns: string) => ({
          eq: (column: string, value: any) => ({
            single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          }),
          order: (column: string, options?: any) => ({
            limit: (count: number) => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: (data: any) => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        update: (data: any) => ({
          eq: (column: string, value: any) =>
            Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        }),
        delete: () => ({
          eq: (column: string, value: any) =>
            Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        }),
      }),
    } as any
  }

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
