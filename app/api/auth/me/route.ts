import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Get user profile from users table
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    // Combine auth user with profile data
    const userData = {
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      role: profile?.role || "customer",
      createdAt: user.created_at,
      updatedAt: profile?.updated_at || user.updated_at,
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Auth me error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
