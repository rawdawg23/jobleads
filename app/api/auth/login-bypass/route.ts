import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Login via bypass method:", email)

    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: user, error: userError } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          details: "Email or password is incorrect",
        },
        { status: 401 },
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          details: "Email or password is incorrect",
        },
        { status: 401 },
      )
    }

    // Create a simple JWT token for session management
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    console.log("[v0] Login successful via bypass:", email)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      token,
      message: "Login successful!",
    })
  } catch (error: any) {
    console.error("[v0] Login bypass exception:", error.message)
    return NextResponse.json(
      {
        error: "Login failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
