import { type NextRequest, NextResponse } from "next/server"
import { SessionModel, UserModel } from "@/lib/redis/models"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Get session from cookies
    const sessionId = request.cookies.get("ctek-session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Validate session and get user
    const session = await SessionModel.findById(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = await UserModel.findById(session.userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get Supabase client
    const supabase = createClient()

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
    // Get session from cookies
    const sessionId = request.cookies.get("ctek-session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Validate session and get user
    const session = await SessionModel.findById(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = await UserModel.findById(session.userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { dealerId, status, adminNotes } = await request.json()

    // Get Supabase client
    const supabase = createClient()

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
