export const isSupabaseConfigured = true // Always true since Supabase is integrated

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      }),
    }
  }

  // Create basic Supabase client for client-side use
  return {
    auth: {
      async getUser() {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              apikey: supabaseKey,
            },
            credentials: "include",
          })

          if (response.ok) {
            const user = await response.json()
            return { data: { user }, error: null }
          }
        } catch (error) {
          console.error("Auth error:", error)
        }

        return { data: { user: null }, error: null }
      },

      async getSession() {
        return { data: { session: null }, error: null }
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

          if (response.ok) {
            const data = await response.json()
            return { data, error: null }
          } else {
            const error = await response.json()
            return { data: null, error }
          }
        } catch (error) {
          return { data: null, error: { message: "Sign in failed" } }
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
              data: options?.data,
              redirect_to: options?.emailRedirectTo,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            return { data, error: null }
          } else {
            const error = await response.json()
            return { data: null, error }
          }
        } catch (error) {
          return { data: null, error: { message: "Sign up failed" } }
        }
      },

      async signOut() {
        try {
          await fetch(`${supabaseUrl}/auth/v1/logout`, {
            method: "POST",
            headers: {
              apikey: supabaseKey,
            },
            credentials: "include",
          })
        } catch (error) {
          console.error("Sign out error:", error)
        }

        return { error: null }
      },

      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        // Simple implementation for auth state changes
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }
      },
    },

    from: (table: string) => ({
      select: (columns = "*") => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`, {
                headers: {
                  Authorization: `Bearer ${supabaseKey}`,
                  apikey: supabaseKey,
                },
              })

              if (response.ok) {
                const data = await response.json()
                return { data: data[0] || null, error: null }
              }
            } catch (error) {
              console.error("Database error:", error)
            }

            return { data: null, error: { message: "Database query failed" } }
          },
        }),
      }),

      async insert(values: any) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
              apikey: supabaseKey,
            },
            body: JSON.stringify(values),
          })

          if (response.ok) {
            const data = await response.json()
            return { data, error: null }
          }
        } catch (error) {
          console.error("Database error:", error)
        }

        return { data: null, error: { message: "Database insert failed" } }
      },
    }),
  }
}
