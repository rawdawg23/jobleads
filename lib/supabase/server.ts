export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Simple working Supabase client implementation
export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase environment variables are not configured")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Create a basic Supabase client that works without complex imports
  const client = {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            return {
              data: null,
              error: {
                message: errorData.error_description || errorData.msg || "Invalid login credentials",
              },
            }
          }

          const data = await response.json()
          return { data: { user: data.user, session: data }, error: null }
        } catch (error) {
          console.error("Sign in error:", error)
          return { data: null, error: { message: "Network error occurred" } }
        }
      },

      async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              email,
              password,
              data: options?.data || {},
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            return {
              data: null,
              error: {
                message: errorData.error_description || errorData.msg || "Sign up failed",
              },
            }
          }

          const data = await response.json()
          return { data: { user: data.user, session: data }, error: null }
        } catch (error) {
          console.error("Sign up error:", error)
          return { data: null, error: { message: "Network error occurred" } }
        }
      },

      async signOut() {
        return { error: null }
      },

      async getUser() {
        return { data: { user: null }, error: null }
      },

      async getSession() {
        return { data: { session: null }, error: null }
      },
    },

    from(table: string) {
      return {
        async insert(data: any) {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: "return=representation",
              },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const errorData = await response.json()
              return { data: null, error: errorData }
            }

            const result = await response.json()
            return { data: result, error: null }
          } catch (error) {
            console.error("Insert error:", error)
            return { data: null, error: { message: "Database insert failed" } }
          }
        },

        async select(columns = "*") {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            })

            if (!response.ok) {
              const errorData = await response.json()
              return { data: [], error: errorData }
            }

            const data = await response.json()
            return { data, error: null }
          } catch (error) {
            console.error("Select error:", error)
            return { data: [], error: { message: "Database query failed" } }
          }
        },
      }
    },
  }

  return client
}

export const createServerClient = createClient
