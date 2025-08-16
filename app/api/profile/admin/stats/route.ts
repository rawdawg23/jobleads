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

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [usersResult, jobsResult, dealersResult, paymentsResult] = await Promise.allSettled([
      supabase.from("users").select("id, role"),
      supabase.from("jobs").select("id, status, customer_price, dealer_quote"),
      supabase.from("dealers").select("id, status"),
      supabase.from("payments").select("id, amount, status, payment_type"),
    ])

    const users = usersResult.status === "fulfilled" ? usersResult.value.data || [] : []
    const jobs = jobsResult.status === "fulfilled" ? jobsResult.value.data || [] : []
    const dealers = dealersResult.status === "fulfilled" ? dealersResult.value.data || [] : []
    const payments = paymentsResult.status === "fulfilled" ? paymentsResult.value.data || [] : []

    const completedPayments = payments.filter((payment) => payment.status === "completed")
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const platformRevenue = jobs.reduce((sum, job) => sum + (job.customer_price || 0), 0) + totalRevenue * 0.03 // 3% platform fee on transactions

    const pendingDealers = dealers.filter((dealer) => dealer.status === "pending")

    const totalRequests = users.length + jobs.length + dealers.length + payments.length
    const successfulOperations = users.length + jobs.length + dealers.length + completedPayments.length
    const systemHealth = totalRequests > 0 ? Math.round((successfulOperations / totalRequests) * 100) : 100

    const stats = {
      totalUsers: users.length,
      totalDealers: users.filter((user) => user.role === "dealer").length,
      totalCustomers: users.filter((user) => user.role === "customer").length,
      totalJobs: jobs.length,
      totalRevenue: platformRevenue,
      activeJobs: jobs.filter((job) => ["pending", "accepted", "in_progress"].includes(job.status)).length,
      pendingApprovals: pendingDealers.length,
      systemHealth: systemHealth,
      completedJobs: jobs.filter((job) => job.status === "completed").length,
      averageJobValue:
        jobs.length > 0
          ? jobs.reduce((sum, job) => sum + (job.dealer_quote || job.customer_price || 0), 0) / jobs.length
          : 0,
      activeDealers: dealers.filter((dealer) => dealer.status === "active").length,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in GET /api/profile/admin/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
