"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

async function createSafeClient() {
  try {
    const supabase = createClient()
    // Test the client by checking if it's properly configured
    if (!supabase) {
      throw new Error("Supabase client could not be created")
    }
    return supabase
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw new Error("Authentication service is temporarily unavailable")
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

  try {
    const supabase = await createSafeClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    // Get user profile to determine role-based redirect
    const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).single()

    // Redirect based on user role
    const userRole = profile?.role || "customer"
    switch (userRole) {
      case "admin":
        redirect("/profile/admin")
        break
      case "dealer":
        redirect("/profile/dealer")
        break
      default:
        redirect("/profile/customer")
    }
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Login action error:", error instanceof Error ? error.message : String(error))
    return { error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again." }
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
  const accountType = formData.get("accountType")

  if (!email || !password || !firstName || !lastName) {
    return { error: "All required fields must be filled" }
  }

  try {
    const supabase = await createSafeClient()

    const role =
      accountType === "Customer - Post Jobs"
        ? "customer"
        : accountType === "Dealer - Apply for Jobs"
          ? "dealer"
          : "customer"

    const redirectUrl =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/profile/${role}`

    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName.toString(),
          last_name: lastName.toString(),
          phone_number: phone?.toString() || "",
          role: role,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    // If user is created, also create profile in users table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: email.toString(),
        first_name: firstName.toString(),
        last_name: lastName.toString(),
        role: role,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
      }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Sign up action error:", error instanceof Error ? error.message : String(error))
    return { error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  try {
    const supabase = await createSafeClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  } catch (error) {
    console.error("Sign out error:", error)
    // Still redirect to login even if sign out fails
    redirect("/auth/login")
  }
}

export async function requestPasswordReset(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const supabase = await createSafeClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email.toString(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Password reset request error:", error instanceof Error ? error.message : String(error))
    return { error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again." }
  }
}

export async function resetPassword(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")

  if (!password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.toString().length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  try {
    const supabase = await createSafeClient()

    const { error } = await supabase.auth.updateUser({
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error instanceof Error ? error.message : String(error))
    return { error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again." }
  }
}
