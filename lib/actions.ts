"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const { data: userData } = await supabase.from("users").select("role").eq("id", data.user.id).single()

    const role = userData?.role || "customer"

    switch (role) {
      case "admin":
        redirect("/admin")
        break
      case "dealer":
        redirect("/dealer")
        break
      default:
        redirect("/dashboard")
    }
  }

  return { success: true }
}

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const accountType = formData.get("accountType") as string

  if (!email || !password || !firstName || !lastName) {
    return { error: "All fields are required" }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const role = accountType === "Customer - Post Jobs" ? "customer" : "dealer"

    const { error: dbError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role,
    })

    if (dbError) {
      return { error: "Failed to create user profile" }
    }
  }

  return { success: "Check your email to confirm your account" }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
