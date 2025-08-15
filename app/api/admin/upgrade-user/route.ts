import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Admin upgrade request received")

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Looking up user by email:", email)

    const { data: user, error: userError } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      console.log("[v0] User not found:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] User found:", user.id, "Current role:", user.role)

    const supabaseClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.log("[v0] Password verification failed:", signInError.message)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    console.log("[v0] Password verified, upgrading to admin role")

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        role: "admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.log("[v0] Failed to update user role:", updateError)
      return NextResponse.json({ error: "Failed to upgrade user role", details: updateError.message }, { status: 500 })
    }

    console.log("[v0] User successfully upgraded to admin:", updatedUser.id)

    return NextResponse.json({
      success: true,
      message: "Account successfully upgraded to admin",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
      },
    })
  } catch (error) {
    console.error("[v0] Admin upgrade exception:", error)
    return NextResponse.json(
      { error: "Admin upgrade failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
