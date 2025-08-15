"use server"

import { AuthService } from "@/lib/redis/auth"
import { UserModel, PasswordResetModel } from "@/lib/redis/models"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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

export async function requestPasswordReset(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] Missing RESEND_API_KEY environment variable")
      return { error: "Email service is not configured. Please contact support." }
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"

    console.log("[v0] Using site URL:", siteUrl)

    // Find user by email
    const user = await UserModel.findByEmail(email.toString())
    console.log("[v0] User lookup result:", user ? "found" : "not found")

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Create password reset token
      console.log("[v0] Creating password reset token for user:", user.id)
      const resetToken = await PasswordResetModel.create(user.id, user.email, 1) // 1 hour expiry
      console.log("[v0] Reset token created:", resetToken.id)

      // Create reset URL
      const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken.id}`
      console.log("[v0] Reset URL:", resetUrl)

      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
      console.log("[v0] Sending email from:", fromEmail)

      // Send password reset email
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: [user.email],
        subject: "Reset Your CTEK Job Leads Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Reset Your Password</h2>
            <p>Hello ${user.firstName},</p>
            <p>You requested to reset your password for your CTEK Job Leads account. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">CTEK Job Leads - Professional ECU Remapping Network</p>
          </div>
        `,
      })

      console.log("[v0] Email send result:", emailResult.data ? "success" : "failed", emailResult.error || "")

      if (emailResult.error) {
        console.error("[v0] Email send error:", emailResult.error)
        return { error: "Failed to send reset email. Please try again or contact support." }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Password reset request error:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Full error object:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function resetPassword(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const token = formData.get("token")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")

  if (!token || !password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.toString().length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  try {
    // Find and validate reset token
    const resetToken = await PasswordResetModel.findById(token.toString())

    if (!resetToken) {
      return { error: "Invalid or expired reset token" }
    }

    // Update user password
    const success = await UserModel.updatePassword(resetToken.userId, password.toString())

    if (!success) {
      return { error: "Failed to update password. Please try again." }
    }

    // Mark token as used
    await PasswordResetModel.markAsUsed(resetToken.id)

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error instanceof Error ? error.message : String(error))
    return { error: "An unexpected error occurred. Please try again." }
  }
}
