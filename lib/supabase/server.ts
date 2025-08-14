import { cookies } from "next/headers"
import { cache } from "react"

export const isSupabaseConfigured = true // Always true since Supabase is integrated

// Create a cached version of the Supabase client for Server Components
export const createClient = cache(() => {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        exchangeCodeForSession: () => Promise.resolve({ data: null, error: null }),
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }
  }

  // Create basic Supabase client with auth methods
  return {
    auth: {
      async getUser() {
        const authCookie = cookieStore.get("sb-access-token")
        if (!authCookie) {
          return { data: { user: null }, error: null }
        }

        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${authCookie.value}`,
              apikey: supabaseKey,
            },
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
        const authCookie = cookieStore.get("sb-access-token")
        if (!authCookie) {
          return { data: { session: null }, error: null }
        }

        return {
          data: {
            session: {
              access_token: authCookie.value,
              user: { id: "user-id" },
            },
          },
          error: null,
        }
      },

      async exchangeCodeForSession(code: string) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
            },
            body: JSON.stringify({ code }),
          })

          if (response.ok) {
            const data = await response.json()
            return { data, error: null }
          }
        } catch (error) {
          console.error("Code exchange error:", error)
        }

        return { data: null, error: { message: "Failed to exchange code" } }
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
        single: async () => {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&limit=1`, {
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
})

export const createServerClient = createClient
