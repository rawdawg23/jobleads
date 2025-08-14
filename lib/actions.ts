"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message || "Invalid email or password" }
    }

    if (data?.access_token) {
      const cookieStore = cookies()
      cookieStore.set("sb-access-token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      if (data?.refresh_token) {
        cookieStore.set("sb-refresh-token", data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
      }
    }

    return { success: true }
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

  const supabase = createClient()

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
      if (error.message && error.message.includes("Too many signup attempts")) {
        return { error: "Too many signup attempts. Please wait a moment and try again." }
      }
      return { error: error.message || "Failed to create account" }
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
        // Don't return error here as auth user was created successfully
      }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createClient()

  try {
    await supabase.auth.signOut()

    const cookieStore = cookies()
    cookieStore.delete("sb-access-token")
    cookieStore.delete("sb-refresh-token")
  } catch (error) {
    console.error("Sign out error:", error)
  }

  redirect("/auth/login")
}
