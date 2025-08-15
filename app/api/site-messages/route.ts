import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ messages: [] })
    }

    // Get user profile to determine role
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ messages: [] })
    }

    // Fetch active site messages
    let query = supabase
      .from("site_messages")
      .select("id, title, content, type, dismissible, target_audience")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    // Filter by target audience based on user role
    const userRole = profile.role.toLowerCase()
    if (userRole === "customer") {
      query = query.in("target_audience", ["all", "customers"])
    } else if (userRole === "dealer") {
      query = query.in("target_audience", ["all", "dealers"])
    } else {
      // Admin can see all messages
      query = query.in("target_audience", ["all", "customers", "dealers"])
    }

    const { data: messages, error } = await query

    if (error) {
      console.error("Error fetching site messages:", error)
      return NextResponse.json({ messages: [] })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error("Error in GET /api/site-messages:", error)
    return NextResponse.json({ messages: [] })
  }
}
