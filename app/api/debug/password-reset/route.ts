import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    console.log("[v0] Password reset diagnostic starting...")

    const { email, action = "send_reset" } = await request.json()
    console.log("[v0] Action:", action, "Email:", email)

    if (action === "send_reset") {
      console.log("[v0] Attempting to send password reset email...")

      // Check if user exists first
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("email, role")
        .eq("email", email)
        .single()

      if (userError) {
        console.log("[v0] User lookup error:", userError)
        return NextResponse.json({
          success: false,
          step: "user_lookup",
          error: userError.message,
          diagnosis: "User not found in database",
        })
      }

      console.log("[v0] User found:", users)

      // Send reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      })

      if (resetError) {
        console.log("[v0] Reset email error:", resetError)
        return NextResponse.json({
          success: false,
          step: "send_email",
          error: resetError.message,
          diagnosis: "Failed to send reset email",
        })
      }

      console.log("[v0] Password reset email sent successfully")
      return NextResponse.json({
        success: true,
        step: "email_sent",
        message: "Password reset email sent",
        user: users,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      })
    }

    if (action === "update_password") {
      const { password } = await request.json()
      console.log("[v0] Attempting to update password...")

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.log("[v0] Session error:", sessionError)
        return NextResponse.json({
          success: false,
          step: "session_check",
          error: sessionError?.message || "No active session",
          diagnosis: "User must be authenticated to update password",
        })
      }

      console.log("[v0] Session found:", session.user.email)

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.log("[v0] Password update error:", updateError)
        return NextResponse.json({
          success: false,
          step: "password_update",
          error: updateError.message,
          diagnosis: "Failed to update password",
        })
      }

      console.log("[v0] Password updated successfully")
      return NextResponse.json({
        success: true,
        step: "password_updated",
        message: "Password updated successfully",
        user: session.user.email,
      })
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action",
      diagnosis: "Action must be send_reset or update_password",
    })
  } catch (error) {
    console.error("[v0] Password reset diagnostic exception:", error)
    return NextResponse.json(
      {
        success: false,
        step: "exception",
        error: error instanceof Error ? error.message : "Unknown error",
        diagnosis: "Unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    console.log("[v0] Password reset diagnostic status check...")

    // Check current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    return NextResponse.json({
      session: session
        ? {
            user: session.user.email,
            expires_at: session.expires_at,
          }
        : null,
      sessionError: sessionError?.message,
      environment: envCheck,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Diagnostic status error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
