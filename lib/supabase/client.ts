import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Create singleton instance for client components
export const supabase = createClient()

export const isSupabaseConfigured = true
