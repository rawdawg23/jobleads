import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export const createClient = () => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (callback: (event: string, session: any) => void) => ({
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }),
        signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
      }),
    }
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export const supabase = createClient()

// Server-side Supabase client
export const createServerSupabaseClient = () => createClient()

// Database types
export type UserRole = "customer" | "dealer" | "admin"

export interface User {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  phone?: string
  address?: string
  postcode?: string
  created_at: string
}

export interface Dealer {
  id: string
  user_id: string
  business_name: string
  business_address: string
  business_postcode: string
  status: "pending" | "active" | "suspended" | "cancelled"
  subscription_expires_at?: string
}
