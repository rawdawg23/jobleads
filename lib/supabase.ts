import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const isSupabaseConfigured = true

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found, using placeholder client")
    // Return a mock client for build time
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// export const supabase = createClient()

// Server-side Supabase client
export const createSSRClient = () => createClient()

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
