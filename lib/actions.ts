"use server"

import { AuthService } from "@/lib/redis/auth"
import { redirect } from "next/navigation"
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
    const result = await AuthService.signIn(email.toString(), password.toString())

    if ("error" in result) {
      return { error: result.error }
    }

    const { user, session } = result

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("ctek-session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    // Redirect based on user role
    switch (user.role) {
      case "admin":
        redirect("/admin")
        break
      case "dealer":
        redirect("/dealer")
        break
      default:
        redirect("/dashboard")
    }
  } catch (error) {
    console.error("Login action error:", error instanceof Error ? error.message : String(error))
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
  const accountType = formData.get("accountType")

  if (!email || !password || !firstName || !lastName) {
    return { error: "All required fields must be filled" }
  }

  try {
    const role =
      accountType === "Customer - Post Jobs"
        ? "customer"
        : accountType === "Dealer - Apply for Jobs"
          ? "dealer"
          : "customer"

    const userData = {
      email: email.toString(),
      firstName: firstName.toString(),
      lastName: lastName.toString(),
      phoneNumber: phone?.toString() || "",
      role: role as "customer" | "dealer" | "admin",
    }

    const result = await AuthService.signUp(userData, password.toString())

    if ("error" in result) {
      return { error: result.error }
    }

    const { user, session } = result

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("ctek-session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    // Redirect based on user role
    switch (user.role) {
      case "admin":
        redirect("/admin")
        break
      case "dealer":
        redirect("/dealer")
        break
      default:
        redirect("/dashboard")
    }
  } catch (error) {
    console.error("Sign up action error:", error instanceof Error ? error.message : String(error))
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("ctek-session")?.value

    if (sessionId) {
      await AuthService.signOut(sessionId)
    }

    // Clear session cookie
    cookieStore.delete("ctek-session")
  } catch (error) {
    console.error("Sign out error:", error)
  }

  redirect("/auth/login")
}
