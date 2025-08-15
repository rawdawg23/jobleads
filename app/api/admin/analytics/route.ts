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
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all analytics data
    const [
      usersResult,
      customersResult,
      dealersResult,
      jobsResult,
      activeJobsResult,
      completedJobsResult,
      paymentsResult,
      monthlyPaymentsResult,
      monthlyUsersResult,
      monthlyJobsResult,
      postcodesResult,
    ] = await Promise.all([
      supabase.from("users").select("id"),
      supabase.from("users").select("id").eq("role", "customer"),
      supabase.from("users").select("id").eq("role", "dealer"),
      supabase.from("jobs").select("id, customer_price"),
      supabase.from("jobs").select("id").in("status", ["open", "accepted", "in_progress"]),
      supabase.from("jobs").select("id, customer_price").eq("status", "completed"),
      supabase.from("payments").select("amount").eq("status", "completed"),
      supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString()),
      supabase.from("users").select("id").gte("created_at", startOfMonth.toISOString()),
      supabase.from("jobs").select("id").gte("created_at", startOfMonth.toISOString()),
      supabase.from("jobs").select("customer_postcode").not("customer_postcode", "is", null),
    ])

    // Process postcode data
    const postcodeCounts: { [key: string]: number } = {}
    postcodesResult.data?.forEach((job) => {
      if (job.customer_postcode) {
        const area = job.customer_postcode.split(" ")[0]
        postcodeCounts[area] = (postcodeCounts[area] || 0) + 1
      }
    })

    const topPostcodes = Object.entries(postcodeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([postcode, count]) => ({ postcode, count }))

    const totalRevenue = (paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0) / 100
    const monthlyRevenue = (monthlyPaymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0) / 100
    const completedJobsData = completedJobsResult.data || []
    const averageJobValue =
      completedJobsData.length > 0
        ? completedJobsData.reduce((sum, job) => sum + (job.customer_price || 0), 0) / completedJobsData.length
        : 0

    const analytics = {
      totalUsers: usersResult.data?.length || 0,
      totalCustomers: customersResult.data?.length || 0,
      totalDealers: dealersResult.data?.length || 0,
      totalJobs: jobsResult.data?.length || 0,
      activeJobs: activeJobsResult.data?.length || 0,
      completedJobs: completedJobsResult.data?.length || 0,
      totalRevenue,
      monthlyRevenue,
      averageJobValue,
      topPostcodes,
      recentGrowth: {
        usersThisMonth: monthlyUsersResult.data?.length || 0,
        jobsThisMonth: monthlyJobsResult.data?.length || 0,
        revenueThisMonth: monthlyRevenue,
      },
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Admin analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
