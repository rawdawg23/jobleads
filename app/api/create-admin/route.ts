import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Admin user creation endpoint. Use POST method to create admin user.",
    usage: "This endpoint should be called via POST request from the diagnostic page.",
    redirect: "/diagnose",
  })
}

export async function POST() {
  try {
    console.log("[v0] Creating admin user with working approach...")

    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if admin user already exists in database
    console.log("[v0] Checking if admin user already exists...")
    const { data: existingUser } = await supabaseAdmin.from("users").select("*").eq("email", "admin@ctek.com").single()

    if (existingUser) {
      console.log("[v0] Admin user already exists in database")
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
        user: { email: "admin@ctek.com", role: "admin" },
      })
    }

    console.log("[v0] Attempting client-side signup...")
    const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
      email: "admin@ctek.com",
      password: "admin123",
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (signupError) {
      console.log("[v0] Client-side signup failed, trying admin creation...")

      // Fallback to admin creation
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@ctek.com",
        password: "admin123",
        email_confirm: true,
      })

      if (authError) {
        console.error("[v0] Both signup methods failed:", authError.message)

        const manualSolution = `
Since automated user creation is failing due to Supabase configuration issues, 
please create the admin user manually:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Email: admin@ctek.com
5. Password: admin123
6. Auto Confirm User: Yes
7. Click "Create User"

Then run this SQL in the SQL Editor to create the database record:

INSERT INTO public.users (id, email, first_name, last_name, role)
SELECT id, email, 'Admin', 'User', 'admin'
FROM auth.users 
WHERE email = 'admin@ctek.com'
ON CONFLICT (id) DO NOTHING;
        `

        return NextResponse.json(
          {
            error: "Automated user creation failed due to Supabase configuration",
            solution: manualSolution,
            action: "Create user manually in Supabase Dashboard",
          },
          { status: 400 },
        )
      }

      const updatedSignupData = {
        ...signupData,
        user: authData.user,
      }
      Object.assign(signupData, updatedSignupData)
    }

    if (!signupData.user) {
      return NextResponse.json({ error: "User creation failed - no user data returned" }, { status: 400 })
    }

    if (!signupData.user.email_confirmed_at) {
      console.log("[v0] Confirming user email...")
      await supabaseAdmin.auth.admin.updateUserById(signupData.user.id, {
        email_confirm: true,
      })
    }

    console.log("[v0] Creating database record...")
    const { error: dbError } = await supabaseAdmin.from("users").insert({
      id: signupData.user.id,
      email: "admin@ctek.com",
      first_name: "Admin",
      last_name: "User",
      role: "admin",
    })

    if (dbError) {
      console.error("[v0] Database record creation error:", dbError)
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 400 })
    }

    console.log("[v0] Admin user created successfully!")
    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: signupData.user.id,
        email: "admin@ctek.com",
        role: "admin",
      },
      credentials: {
        email: "admin@ctek.com",
        password: "admin123",
      },
    })
  } catch (error) {
    console.error("[v0] Admin user creation exception:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
