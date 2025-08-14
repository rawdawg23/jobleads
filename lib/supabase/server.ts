import { cookies } from "next/headers"
import { cache } from "react"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Simple Supabase client implementation that works without complex imports
export const createClient = cache(() => {
  if (!isSupabaseConfigured) {
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
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
      }),
    }
  }

  // Create a working Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return {
    auth: {
      async getUser() {
        try {
          const cookieStore = cookies()
          const accessToken = cookieStore.get("sb-access-token")?.value

          if (!accessToken) {
            return { data: { user: null }, error: null }
          }

          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              apikey: supabaseKey,
            },
          })

          if (response.ok) {
            const user = await response.json()
            return { data: { user }, error: null }
          }

          return { data: { user: null }, error: null }
        } catch (error) {
          return { data: { user: null }, error }
        }
      },

      async getSession() {
        try {
          const cookieStore = cookies()
          const accessToken = cookieStore.get("sb-access-token")?.value
          const refreshToken = cookieStore.get("sb-refresh-token")?.value

          if (!accessToken || !refreshToken) {
            return { data: { session: null }, error: null }
          }

          return {
            data: {
              session: {
                access_token: accessToken,
                refresh_token: refreshToken,
              },
            },
            error: null,
          }
        } catch (error) {
          return { data: { session: null }, error }
        }
      },

      async signInWithPassword({ email, password }: { email: string; password: string }) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok) {
            return { data, error: null }
          }

          return { data: null, error: data }
        } catch (error) {
          return { data: null, error }
        }
      },

      async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
            },
            body: JSON.stringify({
              email,
              password,
              ...options,
            }),
          })

          const data = await response.json()

          if (response.ok) {
            return { data, error: null }
          }

          return { data: null, error: data }
        } catch (error) {
          return { data: null, error }
        }
      },

      async signOut() {
        try {
          const cookieStore = cookies()
          const accessToken = cookieStore.get("sb-access-token")?.value

          if (accessToken) {
            await fetch(`${supabaseUrl}/auth/v1/logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                apikey: supabaseKey,
              },
            })
          }

          return { error: null }
        } catch (error) {
          return { error }
        }
      },
    },

    from(table: string) {
      return {
        async select(columns = "*") {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            })

            if (response.ok) {
              const data = await response.json()
              return { data, error: null }
            }

            const error = await response.json()
            return { data: null, error }
          } catch (error) {
            return { data: null, error }
          }
        },

        async insert(values: any) {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: "return=representation",
              },
              body: JSON.stringify(values),
            })

            if (response.ok) {
              const data = await response.json()
              return { data, error: null }
            }

            const error = await response.json()
            return { data: null, error }
          } catch (error) {
            return { data: null, error }
          }
        },
      }
    },
  }
})

export const createServerClient = createClient
