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

    if (!profile || profile.role !== "Customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch customer statistics
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, status, customer_price, created_at")
      .eq("customer_id", user.id)

    const { data: messages } = await supabase.from("messages").select("id").eq("customer_id", user.id)

    const stats = {
      totalJobs: jobs?.length || 0,
      activeJobs: jobs?.filter((job) => ["open", "accepted", "in_progress"].includes(job.status)).length || 0,
      completedJobs: jobs?.filter((job) => job.status === "completed").length || 0,
      totalMessages: messages?.length || 0,
      totalSpent: jobs?.reduce((sum, job) => sum + (job.customer_price || 0), 0) || 0,
      averageRating: 4.5, // TODO: Calculate from actual reviews
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in GET /api/profile/customer/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
