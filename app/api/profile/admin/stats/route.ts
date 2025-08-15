import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to verify role
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch admin statistics
    const { data: users } = await supabase.from("users").select("id, role")
    const { data: jobs } = await supabase.from("jobs").select("id, status, customer_price")
    const { data: dealers } = await supabase.from("dealers").select("id")

    const stats = {
      totalUsers: users?.length || 0,
      totalDealers: users?.filter((user) => user.role === "Dealer").length || 0,
      totalCustomers: users?.filter((user) => user.role === "Customer").length || 0,
      totalJobs: jobs?.length || 0,
      totalRevenue: jobs?.reduce((sum, job) => sum + (job.customer_price || 0), 0) * 0.1 || 0, // 10% platform fee
      activeJobs: jobs?.filter((job) => ["open", "accepted", "in_progress"].includes(job.status)).length || 0,
      pendingApprovals: dealers?.filter((dealer) => !dealer.id).length || 0, // TODO: Add approval status
      systemHealth: 98, // TODO: Calculate from actual system metrics
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in GET /api/profile/admin/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
