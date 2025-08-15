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

    if (!profile || profile.role !== "dealer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get dealer ID
    const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", user.id).single()

    if (!dealer) {
      return NextResponse.json({ error: "Dealer profile not found" }, { status: 404 })
    }

    const [applicationsResult, messagesResult, reviewsResult] = await Promise.all([
      supabase
        .from("job_applications")
        .select(`
          id, quote, created_at, status, response_time,
          job:jobs(id, status, customer_price, created_at)
        `)
        .eq("dealer_id", dealer.id),
      supabase.from("messages").select("id, created_at").eq("dealer_id", dealer.id),
      supabase.from("reviews").select("rating, created_at").eq("dealer_id", dealer.id),
    ])

    const applications = applicationsResult.data || []
    const reviews = reviewsResult.data || []
    const completedJobs = applications.filter((app) => app.job?.status === "completed")

    // Calculate real average rating from reviews
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length : 0

    // Calculate real response time from applications
    const responseTimes = applications.filter((app) => app.response_time).map((app) => app.response_time || 0)
    const averageResponseTime =
      responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0

    const stats = {
      totalApplications: applications.length,
      activeJobs: applications.filter((app) => ["accepted", "in_progress"].includes(app.job?.status || "")).length,
      completedJobs: completedJobs.length,
      totalMessages: messagesResult.data?.length || 0,
      totalEarnings: completedJobs.reduce((sum, app) => sum + (app.quote || 0), 0),
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      responseTime: Math.round(averageResponseTime * 10) / 10, // Round to 1 decimal place
      successRate: applications.length > 0 ? Math.round((completedJobs.length / applications.length) * 100) : 0,
    }

    const response = NextResponse.json({ stats })
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return response
  } catch (error) {
    console.error("Error in GET /api/profile/dealer/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
