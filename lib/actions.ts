"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Create a simple Supabase client for server actions
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured")
  }

  return {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          return { error: { message: data.error_description || data.msg || "Invalid login credentials" } }
        }

        // Set auth cookies
        const cookieStore = cookies()
        if (data.access_token) {
          cookieStore.set("sb-access-token", data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: data.expires_in || 3600,
          })
        }
        if (data.refresh_token) {
          cookieStore.set("sb-refresh-token", data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
          })
        }

        return { data: { user: data.user }, error: null }
      },

      async signUp({
        email,
        password,
        options,
      }: {
        email: string
        password: string
        options?: {
          emailRedirectTo?: string
          data?: Record<string, any>
        }
      }) {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            data: options?.data || {},
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          return { error: { message: data.error_description || data.msg || "Sign up failed" } }
        }

        return { data: { user: data.user }, error: null }
      },

      async signOut() {
        const cookieStore = cookies()
        const accessToken = cookieStore.get("sb-access-token")?.value

        if (accessToken) {
          await fetch(`${supabaseUrl}/auth/v1/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${accessToken}`,
            },
          })
        }

        // Clear auth cookies
        cookieStore.delete("sb-access-token")
        cookieStore.delete("sb-refresh-token")
      },
    },

    from(table: string) {
      return {
        async insert(data: any) {
          const cookieStore = cookies()
          const accessToken = cookieStore.get("sb-access-token")?.value

          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${accessToken || supabaseAnonKey}`,
              Prefer: "return=minimal",
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const error = await response.json()
            return { error }
          }

          return { error: null }
        },
      }
    },
  }
}

export async function signIn(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    // Return success instead of redirecting directly
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Database connection failed. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phone = formData.get("phone")
  const role = formData.get("role") || "customer"

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    return { error: "Email, password, first name, and last name are required" }
  }

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: {
          first_name: firstName.toString(),
          last_name: lastName.toString(),
          phone: phone?.toString() || null,
          role: role.toString(),
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    // If user was created, add them to the users table
    if (data?.user) {
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email: email.toString(),
        first_name: firstName.toString(),
        last_name: lastName.toString(),
        phone: phone?.toString() || null,
        role: role.toString(),
      })

      if (insertError) {
        console.error("Error creating user record:", insertError)
        return { error: "Failed to create user profile. Please try again." }
      }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "Database connection failed. Please try again." }
  }
}

export async function signOut() {
  try {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Sign out error:", error)
  }
  redirect("/auth/login")
}
