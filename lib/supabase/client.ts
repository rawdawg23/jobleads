import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export function createClient() {
  if (isSupabaseConfigured) {
    return createClientComponentClient()
  }

  // Return a working dummy client that doesn't break the app
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({ data: { user: null, session: null }, error: { message: "Authentication not available" } }),
      signUp: () =>
        Promise.resolve({ data: { user: null, session: null }, error: { message: "Authentication not available" } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback: any) => {
        // Call callback immediately with null session
        setTimeout(() => callback("INITIAL_SESSION", null), 0)
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }
      },
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: "Database not available" } }),
      update: () => Promise.resolve({ data: null, error: { message: "Database not available" } }),
      delete: () => Promise.resolve({ data: null, error: { message: "Database not available" } }),
    }),
  }
}

export const supabase = createClient()
