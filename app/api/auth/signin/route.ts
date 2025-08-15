import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get user profile from users table
    const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

    // Combine auth user with profile data
    const userData = {
      id: data.user.id,
      email: data.user.email,
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      role: profile?.role || "customer",
      createdAt: data.user.created_at,
      updatedAt: profile?.updated_at || data.user.updated_at,
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Sign in API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
