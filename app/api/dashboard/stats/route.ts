import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"
import { JobModel, DealerModel } from "@/lib/redis/extended-models"

export async function GET(request: NextRequest) {
  try {
    const result = await AuthService.getCurrentUser()

    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = result
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

    if (user.role === "customer") {
      const jobs = await JobModel.findByCustomer(user.id)
      const completedJobs = jobs.filter((job) => job.status === "completed")
      const thisMonthJobs = jobs.filter(
        (job) => new Date(job.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      )

      stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((job) => job.status === "open" || job.status === "in_progress").length,
        completedJobs: completedJobs.length,
        totalMessages: 0, // TODO: Implement message counting
        pendingApplications: 0,
        totalEarnings: completedJobs.reduce((sum, job) => sum + (job.customerPrice || 0), 0),
        thisMonthJobs: thisMonthJobs.length,
        successRate: jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0,
      }

      recentActivity = [
        {
          id: "1",
          type: "job_posted",
          title: "New job posted",
          description: "ECU remap job posted successfully",
          timestamp: "2 hours ago",
          status: "pending",
        },
      ]
    } else if (user.role === "dealer") {
      const dealer = await DealerModel.findByUserId(user.id)
      if (dealer) {
        // TODO: Implement dealer-specific stats when job applications are implemented
        stats = {
          totalJobs: 0,
          activeJobs: 0,
          completedJobs: 0,
          totalMessages: 0,
          pendingApplications: 0,
          totalEarnings: 0,
          thisMonthJobs: 0,
          successRate: 0,
        }
      }
    }

    return NextResponse.json({ stats, recentActivity })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
