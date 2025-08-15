import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, account_type } = await request.json()

    if (!email || !password || !name || !account_type) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const { error } = await supabase.from("users").insert({
      email,
      password_hash: passwordHash,
      name,
      account_type,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Registration error:", error)
      return NextResponse.json({ error: "Registration failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
