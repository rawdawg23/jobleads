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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    let stats = {
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      totalMessages: 0,
      pendingApplications: 0,
      totalEarnings: 0,
      thisMonthJobs: 0,
      successRate: 0,
    }

    let recentActivity = []
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    if (profile.role === "customer") {
      const [jobsResult, messagesResult, paymentsResult] = await Promise.all([
        supabase.from("jobs").select("id, status, customer_price, created_at").eq("customer_id", user.id),
        supabase.from("messages").select("id").eq("customer_id", user.id),
        supabase.from("payments").select("amount").eq("customer_id", user.id).eq("status", "completed"),
      ])

      const jobs = jobsResult.data || []
      const completedJobs = jobs.filter((job) => job.status === "completed")
      const activeJobs = jobs.filter((job) => ["open", "accepted", "in_progress"].includes(job.status))
      const thisMonthJobs = jobs.filter((job) => new Date(job.created_at) > new Date(thirtyDaysAgo))

      stats = {
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        completedJobs: completedJobs.length,
        totalMessages: messagesResult.data?.length || 0,
        pendingApplications: 0,
        totalEarnings: (paymentsResult.data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0) / 100,
        thisMonthJobs: thisMonthJobs.length,
        successRate: jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0,
      }

      // Get recent activity
      const { data: recentJobs } = await supabase
        .from("jobs")
        .select("id, status, created_at, make, model")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      recentActivity = (recentJobs || []).map((job) => ({
        id: job.id,
        type: "job_posted" as const,
        title: `${job.make} ${job.model} ECU Remap`,
        description: `Job status: ${job.status}`,
        timestamp: new Date(job.created_at).toLocaleDateString(),
        status: job.status,
      }))
    } else if (profile.role === "dealer") {
      const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", user.id).single()

      if (dealer) {
        const [applicationsResult, messagesResult] = await Promise.all([
          supabase
            .from("job_applications")
            .select(`
              id, quote, created_at, status,
              job:jobs(id, status, make, model, customer_price)
            `)
            .eq("dealer_id", dealer.id),
          supabase.from("messages").select("id").eq("dealer_id", dealer.id),
        ])

        const applications = applicationsResult.data || []
        const completedApplications = applications.filter((app) => app.job?.status === "completed")
        const activeApplications = applications.filter((app) =>
          ["accepted", "in_progress"].includes(app.job?.status || ""),
        )
        const thisMonthApplications = applications.filter((app) => new Date(app.created_at) > new Date(thirtyDaysAgo))

        stats = {
          totalJobs: applications.length,
          activeJobs: activeApplications.length,
          completedJobs: completedApplications.length,
          totalMessages: messagesResult.data?.length || 0,
          pendingApplications: applications.filter((app) => app.status === "pending").length,
          totalEarnings: completedApplications.reduce((sum, app) => sum + (app.quote || 0), 0),
          thisMonthJobs: thisMonthApplications.length,
          successRate:
            applications.length > 0 ? Math.round((completedApplications.length / applications.length) * 100) : 0,
        }

        // Get recent activity
        recentActivity = applications.slice(0, 5).map((app) => ({
          id: app.id,
          type: "application_received" as const,
          title: `Applied for ${app.job?.make} ${app.job?.model}`,
          description: `Quote: £${app.quote || 0}`,
          timestamp: new Date(app.created_at).toLocaleDateString(),
          status: app.status,
        }))
      }
    } else if (profile.role === "admin") {
      // Admin gets platform-wide stats
      const [usersResult, jobsResult, paymentsResult, dealersResult] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount").eq("status", "completed"),
        supabase.from("dealers").select("*", { count: "exact", head: true }),
      ])

      const totalRevenue = (paymentsResult.data || []).reduce((sum, payment) => sum + (payment.amount || 0), 0) / 100

      stats = {
        totalJobs: jobsResult.count || 0,
        activeJobs: 0, // Will be calculated separately if needed
        completedJobs: 0, // Will be calculated separately if needed
        totalMessages: 0,
        pendingApplications: 0,
        totalEarnings: totalRevenue,
        thisMonthJobs: 0,
        successRate: 100,
      }

      recentActivity = [
        {
          id: "admin-1",
          type: "job_posted" as const,
          title: "Platform Overview",
          description: `${usersResult.count || 0} users, ${dealersResult.count || 0} dealers`,
          timestamp: "Today",
          status: "active",
        },
      ]
    }

    const response = NextResponse.json({ stats, recentActivity })
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return response
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
