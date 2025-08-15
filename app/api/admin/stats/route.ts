import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const [usersResult, companiesResult, jobsResult, paymentsResult] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    const monthlyRevenue = paymentsResult.data?.length
      ? paymentsResult.data.reduce((sum, p) => sum + (p.amount || 0), 0)
      : 0

    const stats = {
      totalUsers: usersResult.count || 0,
      activeDealers: companiesResult.count || 0,
      activeJobs: jobsResult.count || 0,
      monthlyRevenue,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Admin stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
