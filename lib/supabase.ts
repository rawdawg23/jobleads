import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const isSupabaseConfigured = true

export const createClient = () => {
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
