const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Basic Supabase client implementation
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Return a subscription object with unsubscribe method
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // Mock unsubscribe - in a real implementation this would clean up listeners
            },
          },
        },
      }
    },
    signInWithPassword: async (credentials: any) => ({ data: null, error: null }),
    signUp: async (credentials: any) => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
      }),
      order: (column: string, options?: any) => ({
        limit: (count: number) => Promise.resolve({ data: [], error: null }),
      }),
      limit: (count: number) => Promise.resolve({ data: [], error: null }),
    }),
    insert: (values: any) => Promise.resolve({ data: null, error: null }),
    update: (values: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
    }),
  }),
}

// Server-side Supabase client
export const createServerSupabaseClient = () => supabase

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
