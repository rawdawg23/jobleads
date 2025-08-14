import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userProfile || userProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { bankSettings, platformSettings } = await request.json()

    // In a real application, you would save these settings to a database
    // For now, we'll just return success
    console.log("Bank settings updated:", bankSettings)
    console.log("Platform settings updated:", platformSettings)

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    })
  } catch (error) {
    console.error("Settings save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
