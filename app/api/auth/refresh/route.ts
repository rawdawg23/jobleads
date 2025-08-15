import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    // Refresh the session
    const { error: refreshError } = await supabase.auth.refreshSession()

    if (refreshError) {
      return NextResponse.json({ error: "Failed to refresh session" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Session refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
