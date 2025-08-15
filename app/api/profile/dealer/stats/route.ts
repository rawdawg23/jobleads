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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to verify role
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "Dealer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get dealer ID
    const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", user.id).single()

    if (!dealer) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 })
    }

    // Fetch dealer statistics
    const { data: applications } = await supabase
      .from("job_applications")
      .select("id, quote, created_at, job:jobs(status)")
      .eq("dealer_id", dealer.id)

    const { data: messages } = await supabase.from("messages").select("id").eq("dealer_id", dealer.id)

    const stats = {
      totalApplications: applications?.length || 0,
      activeJobs: applications?.filter((app) => ["accepted", "in_progress"].includes(app.job?.status)).length || 0,
      completedJobs: applications?.filter((app) => app.job?.status === "completed").length || 0,
      totalMessages: messages?.length || 0,
      totalEarnings:
        applications
          ?.filter((app) => app.job?.status === "completed")
          .reduce((sum, app) => sum + (app.quote || 0), 0) || 0,
      averageRating: 4.7, // TODO: Calculate from actual reviews
      responseTime: 2.5, // TODO: Calculate from actual response times
      successRate:
        applications?.length > 0
          ? Math.round(
              (applications.filter((app) => app.job?.status === "completed").length / applications.length) * 100,
            )
          : 0,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in GET /api/profile/dealer/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
