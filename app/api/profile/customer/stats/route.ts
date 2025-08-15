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

    if (!profile || profile.role !== "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [jobsResult, messagesResult, paymentsResult, reviewsResult] = await Promise.all([
      supabase.from("jobs").select("id, status, customer_price, created_at").eq("customer_id", user.id),
      supabase.from("messages").select("id").eq("customer_id", user.id),
      supabase.from("payments").select("amount, status").eq("customer_id", user.id),
      supabase.from("reviews").select("rating").eq("customer_id", user.id),
    ])

    const jobs = jobsResult.data || []
    const payments = paymentsResult.data || []
    const reviews = reviewsResult.data || []

    // Calculate average rating from actual reviews
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length : 0

    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((job) => ["open", "accepted", "in_progress"].includes(job.status)).length,
      completedJobs: jobs.filter((job) => job.status === "completed").length,
      totalMessages: messagesResult.data?.length || 0,
      totalSpent:
        payments
          .filter((payment) => payment.status === "completed")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0) / 100,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    }

    const response = NextResponse.json({ stats })
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return response
  } catch (error) {
    console.error("Error in GET /api/profile/customer/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
