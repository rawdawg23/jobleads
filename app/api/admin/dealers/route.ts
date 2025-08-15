import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get dealers from Supabase
    const { data: dealers, error } = await supabase
      .from("dealers")
      .select(`
        *,
        user:users(
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ dealers: dealers || [] })
  } catch (error) {
    console.error("Admin dealers error:", error)
    return NextResponse.json({ error: "Failed to fetch dealers" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { dealerId, status, adminNotes } = await request.json()

    // Update dealer status in Supabase
    const { error } = await supabase
      .from("dealers")
      .update({
        status,
        updated_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq("id", dealerId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update dealer status error:", error)
    return NextResponse.json({ error: "Failed to update dealer status" }, { status: 500 })
  }
}
