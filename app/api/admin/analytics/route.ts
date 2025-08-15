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
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "dealer"),
      supabase.from("jobs").select("customer_price", { count: "exact" }),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "accepted", "in_progress"]),
      supabase.from("jobs").select("customer_price", { count: "exact" }).eq("status", "completed"),
      supabase.from("payments").select("amount").eq("status", "completed"),
      supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString()),
      supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
      supabase.from("jobs").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
      supabase.from("jobs").select("customer_postcode").not("customer_postcode", "is", null),
    ])

    const postcodeCounts: { [key: string]: number } = {}
    if (postcodesResult.data && postcodesResult.data.length > 0) {
      postcodesResult.data.forEach((job) => {
        if (job.customer_postcode) {
          const area = job.customer_postcode.split(" ")[0]
          postcodeCounts[area] = (postcodeCounts[area] || 0) + 1
        }
      })
    }

    const topPostcodes = Object.entries(postcodeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([postcode, count]) => ({ postcode, count }))

    const totalRevenue = paymentsResult.data?.length
      ? paymentsResult.data.reduce((sum, p) => sum + (p.amount || 0), 0) / 100
      : 0
    const monthlyRevenue = monthlyPaymentsResult.data?.length
      ? monthlyPaymentsResult.data.reduce((sum, p) => sum + (p.amount || 0), 0) / 100
      : 0

    const completedJobsData = completedJobsResult.data || []
    const averageJobValue =
      completedJobsData.length > 0
        ? completedJobsData.reduce((sum, job) => sum + (job.customer_price || 0), 0) / completedJobsData.length
        : 0

    const analytics = {
      totalUsers: usersResult.count || 0,
      totalCustomers: customersResult.count || 0,
      totalDealers: dealersResult.count || 0,
      totalJobs: jobsResult.count || 0,
      activeJobs: activeJobsResult.count || 0,
      completedJobs: completedJobsResult.count || 0,
      totalRevenue,
      monthlyRevenue,
      averageJobValue,
      topPostcodes,
      recentGrowth: {
        usersThisMonth: monthlyUsersResult.count || 0,
        jobsThisMonth: monthlyJobsResult.count || 0,
        revenueThisMonth: monthlyRevenue,
      },
    }

    const response = NextResponse.json({ analytics })
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return response
  } catch (error) {
    console.error("Admin analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
