import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, role } = await request.json()

    // Create service role client to bypass RLS
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Creating user via bypass method:", email)

    // Create auth user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
    })

    if (authError) {
      console.error("[v0] Admin auth creation error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }

    // Create user record in public.users table
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role: role,
    })

    if (insertError) {
      console.error("[v0] User record creation error:", insertError)
      // Clean up auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create user record" }, { status: 400 })
    }

    console.log("[v0] User created successfully via bypass:", authData.user.id)
    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (error) {
    console.error("[v0] Bypass registration error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 },
    )
  }
}
