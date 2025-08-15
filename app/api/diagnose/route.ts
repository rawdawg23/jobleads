import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    console.log("[v0] Starting comprehensive system diagnosis...")

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // Check database connection
    let dbStatus = "unknown"
    let userCount = 0
    try {
      const { data: users, error: dbError } = await supabase.from("users").select("id, email, role").limit(5)

      if (dbError) {
        dbStatus = `error: ${dbError.message}`
      } else {
        dbStatus = "connected"
        userCount = users?.length || 0
      }
    } catch (e) {
      dbStatus = `exception: ${e}`
    }

    // Environment check
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    }

    const diagnosis = {
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        error: sessionError?.message || null,
      },
      user: {
        exists: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        error: userError?.message || null,
      },
      database: {
        status: dbStatus,
        userCount: userCount,
      },
      environment: envCheck,
      globalAuthState: {
        note: "Check client-side logs for global auth mounting issues",
      },
    }

    console.log("[v0] System diagnosis complete:", diagnosis)

    return NextResponse.json({
      status: "success",
      diagnosis,
      recommendations: [
        session ? "User is authenticated" : "User is not authenticated",
        dbStatus === "connected" ? "Database connection OK" : "Database connection issues",
        "Check browser console for AuthProvider mounting issues",
        "Multiple auth instances may be causing redirect loops",
      ],
    })
  } catch (error) {
    console.error("[v0] Diagnosis failed:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    console.log("[v0] Diagnostic action requested:", action)

    if (action === "reset-auth") {
      // This would be called from client-side to reset global auth state
      return NextResponse.json({
        status: "success",
        message: "Auth reset signal sent - check client console",
        instructions: "Refresh the page to reinitialize auth system",
      })
    }

    if (action === "create-admin-user") {
      const supabase = createRouteHandlerClient({ cookies })

      try {
        // Create admin user using Supabase Auth Admin API
        const { data, error } = await supabase.auth.admin.createUser({
          email: "admin@ctek.com",
          password: "admin123",
          email_confirm: true,
          user_metadata: { role: "admin" },
        })

        if (error) {
          return NextResponse.json({
            status: "error",
            message: `Failed to create admin user: ${error.message}`,
          })
        }

        // Also insert into public.users table if it exists
        try {
          await supabase.from("users").upsert({
            id: data.user.id,
            email: "admin@ctek.com",
            role: "admin",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } catch (e) {
          console.log("[v0] Note: Could not insert into public.users table (may not exist)")
        }

        return NextResponse.json({
          status: "success",
          message: "Admin user created successfully! Email: admin@ctek.com, Password: admin123",
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        })
      } catch (error) {
        return NextResponse.json({
          status: "error",
          message: `Exception creating admin user: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    if (action === "test-forgot-password") {
      const supabase = createRouteHandlerClient({ cookies })
      const testEmail = "admin@ctek.com"

      // Auto-detect site URL if not set
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        request.headers.get("origin") ||
        `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`

      const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${siteUrl}/auth/reset-password`,
      })

      return NextResponse.json({
        status: error ? "error" : "success",
        message: error ? error.message : "Test password reset email would be sent",
        testEmail,
        redirectUrl: `${siteUrl}/auth/reset-password`,
        siteUrl,
      })
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Unknown action",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("[v0] Diagnostic action failed:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
