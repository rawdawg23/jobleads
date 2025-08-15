import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/redis/models"
import { sendPasswordResetEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await UserModel.findByEmail(email)
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        message: "If an account with that email exists, we've sent a password reset link." 
      })
    }

    // Generate reset token (you might want to store this in Redis with expiration)
    const resetToken = crypto.randomUUID()
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in Redis (you'll need to implement this)
    // await storeResetToken(email, resetToken, resetExpiry)

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken, user.firstName)
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError)
      return NextResponse.json({ 
        error: "Failed to send password reset email. Please try again." 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "If an account with that email exists, we've sent a password reset link." 
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ 
      error: "An unexpected error occurred. Please try again." 
    }, { status: 500 })
  }
}