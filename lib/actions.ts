"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Simple Supabase client for server actions
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          return { error: { message: data.error_description || "Invalid credentials" } }
        }

        // Set auth cookie
        const cookieStore = cookies()
        cookieStore.set("supabase-auth-token", data.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: data.expires_in,
        })

        return { data, error: null }
      },

      async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({
            email,
            password,
            confirm: true,
            data: options?.data || {},
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          return { error: { message: data.error_description || "Sign up failed" }, data: null }
        }

        return { data: { user: data.user }, error: null }
      },

      async signOut() {
        const cookieStore = cookies()
        cookieStore.delete("supabase-auth-token")
        return { error: null }
      },
    },

    from(table: string) {
      return {
        async insert(data: any) {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
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
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createSupabaseClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    redirect("/dashboard")
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phone = formData.get("phone")
  const role = formData.get("role")

  if (!email || !password || !firstName || !lastName || !role) {
    return { error: "All required fields must be filled" }
  }

  const supabase = createSupabaseClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
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
      }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createSupabaseClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
