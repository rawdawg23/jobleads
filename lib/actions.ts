"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getRedirectPath } from "@/lib/auth-utils"

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
      return { error: error.message }
    }

    if (data.user) {
      const { data: userData } = await supabase.from("users").select("role").eq("id", data.user.id).single()

      const role = userData?.role || "customer"
      const redirectPath = getRedirectPath(role)
      redirect(redirectPath)
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
  const role = formData.get("role") || "customer"

  if (!email || !password || !firstName || !lastName) {
    return { error: "Email, password, first name, and last name are required" }
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        data: {
          first_name: firstName.toString(),
          last_name: lastName.toString(),
          phone: phone?.toString() || null,
          role: role.toString(),
        },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data?.user) {
      const { error: dbError } = await supabase.from("users").insert({
        id: data.user.id,
        email: email.toString(),
        first_name: firstName.toString(),
        last_name: lastName.toString(),
        phone: phone?.toString() || null,
        role: role.toString(),
      })

      if (dbError) {
        console.error("Database error:", dbError)
        // Don't return error here as auth was successful
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
    redirect("/auth/login")
  } catch (error) {
    console.error("Sign out error:", error)
    redirect("/auth/login")
  }
}
