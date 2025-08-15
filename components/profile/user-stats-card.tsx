"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Briefcase, Heart, Building, TrendingUp } from "lucide-react"

interface UserStats {
  totalApplications: number
  savedJobs: number
  companiesAppliedTo: number
  applicationSuccessRate: number
}

interface UserStatsCardProps {
  userId: string
}

export function UserStatsCard({ userId }: UserStatsCardProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      try {
        // Get total applications
        const { count: totalApplications } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)

        // Get saved jobs count
        const { count: savedJobs } = await supabase
          .from("saved_jobs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)

        // Get unique companies applied to
        const { data: applications } = await supabase
          .from("applications")
          .select("job_id, jobs(company_id)")
          .eq("user_id", userId)

        const uniqueCompanies = new Set(applications?.map((app) => (app.jobs as any)?.company_id).filter(Boolean) || [])

        // Calculate success rate (accepted applications)
        const { count: acceptedApplications } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "accepted")

        const successRate =
          totalApplications && totalApplications > 0
            ? Math.round(((acceptedApplications || 0) / totalApplications) * 100)
            : 0

        setStats({
          totalApplications: totalApplications || 0,
          savedJobs: savedJobs || 0,
          companiesAppliedTo: uniqueCompanies.size,
          applicationSuccessRate: successRate,
        })
      } catch (error) {
        console.error("Error loading user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [userId, supabase])

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-8 bg-glass-light rounded"></div>
              <div className="h-4 bg-glass-light rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      icon: Briefcase,
      label: "Applications",
      value: stats.totalApplications,
      color: "text-primary",
    },
    {
      icon: Heart,
      label: "Saved Jobs",
      value: stats.savedJobs,
      color: "text-secondary",
    },
    {
      icon: Building,
      label: "Companies",
      value: stats.companiesAppliedTo,
      color: "text-accent",
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: `${stats.applicationSuccessRate}%`,
      color: "text-success",
    },
  ]

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Your Activity</h3>
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="text-center space-y-2">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-glass-light ${item.color}`}
            >
              <item.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-sm text-glass-text">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
