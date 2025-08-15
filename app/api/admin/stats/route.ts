import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { count: totalUsers = 0 } = await supabase.from("users").select("id", { count: "exact", head: true })
    const { count: activeDealers = 0 } = await supabase
      .from("dealers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")

    const { count: activeJobs = 0 } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "accepted", "in_progress"])

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data: paymentsRows } = await supabase
      .from("payments")
      .select("amount, created_at")
      .eq("status", "completed")
      .gte("created_at", startOfMonth)

    const monthlyRevenue = (paymentsRows || []).reduce((sum, r: any) => sum + Number(r.amount || 0), 0)

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeDealers: activeDealers || 0,
        activeJobs: activeJobs || 0,
        monthlyRevenue,
      },
    })
  } catch (error) {
    console.error("Admin stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
