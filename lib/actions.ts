"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { error: "Authentication service not configured" }
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
      },
      body: JSON.stringify({
        email: email.toString(),
        password: password.toString(),
      }),
    })

    if (response.ok) {
      const data = await response.json()

      // Set auth cookies
      const cookieStore = cookies()
      if (data.access_token) {
        cookieStore.set("sb-access-token", data.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }

      return { success: true }
    } else {
      const error = await response.json()
      return { error: error.error_description || error.message || "Sign in failed" }
    }
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
  const role = formData.get("role") || "customer"

  if (!email || !password || !firstName || !lastName) {
    return { error: "Email, password, first name, and last name are required" }
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { error: "Authentication service not configured" }
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
      },
      body: JSON.stringify({
        email: email.toString(),
        password: password.toString(),
        data: {
          first_name: firstName.toString(),
          last_name: lastName.toString(),
          phone: phone?.toString() || null,
          role: role.toString(),
        },
        redirect_to:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      }),
    })

    if (response.ok) {
      const data = await response.json()

      // If user was created, add them to the users table
      if (data?.user) {
        const supabase = createClient()
        await supabase.from("users").insert({
          id: data.user.id,
          email: email.toString(),
          first_name: firstName.toString(),
          last_name: lastName.toString(),
          phone: phone?.toString() || null,
          role: role.toString(),
        })
      }

      return { success: "Check your email to confirm your account." }
    } else {
      const error = await response.json()
      return { error: error.error_description || error.message || "Sign up failed" }
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  cookieStore.delete("sb-access-token")

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
        },
      })
    }
  } catch (error) {
    console.error("Sign out error:", error)
  }
}
