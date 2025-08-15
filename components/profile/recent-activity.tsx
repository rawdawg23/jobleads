"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Clock, Briefcase, Heart } from "lucide-react"

interface Activity {
  id: string
  type: "application" | "saved_job"
  title: string
  company: string
  date: string
  status?: string
}

interface RecentActivityProps {
  userId: string
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadActivity() {
      try {
        // Get recent applications
        const { data: applications } = await supabase
          .from("applications")
          .select(`
            id,
            status,
            applied_at,
            jobs (
              title,
              companies (
                name
              )
            )
          `)
          .eq("user_id", userId)
          .order("applied_at", { ascending: false })
          .limit(5)

        // Get recent saved jobs
        const { data: savedJobs } = await supabase
          .from("saved_jobs")
          .select(`
            id,
            saved_at,
            jobs (
              title,
              companies (
                name
              )
            )
          `)
          .eq("user_id", userId)
          .order("saved_at", { ascending: false })
          .limit(5)

        // Combine and format activities
        const allActivities: Activity[] = []

        applications?.forEach((app) => {
          const job = app.jobs as any
          const company = job?.companies as any
          allActivities.push({
            id: app.id,
            type: "application",
            title: job?.title || "Unknown Job",
            company: company?.name || "Unknown Company",
            date: app.applied_at,
            status: app.status,
          })
        })

        savedJobs?.forEach((saved) => {
          const job = saved.jobs as any
          const company = job?.companies as any
          allActivities.push({
            id: saved.id,
            type: "saved_job",
            title: job?.title || "Unknown Job",
            company: company?.name || "Unknown Company",
            date: saved.saved_at,
          })
        })

        // Sort by date and take top 10
        allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setActivities(allActivities.slice(0, 10))
      } catch (error) {
        console.error("Error loading recent activity:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActivity()
  }, [userId, supabase])

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 bg-glass-light rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-glass-light rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-glass-light rounded"></div>
                <div className="h-3 bg-glass-light rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return Briefcase
      case "saved_job":
        return Heart
      default:
        return Clock
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-glass-light text-glass-text border-glass-border"
    }
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

      {activities.length === 0 ? (
        <p className="text-glass-text text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-center space-x-3 p-3 rounded-lg bg-glass-light/30 hover:bg-glass-light/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-glass-light flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{activity.title}</p>
                  <p className="text-glass-text text-sm">{activity.company}</p>
                  <p className="text-glass-text text-xs">{new Date(activity.date).toLocaleDateString()}</p>
                </div>

                <div className="flex-shrink-0">
                  {activity.status && (
                    <Badge className={`text-xs ${getStatusColor(activity.status)}`}>{activity.status}</Badge>
                  )}
                  {activity.type === "saved_job" && (
                    <Badge className="text-xs bg-glass-light text-glass-text border-glass-border">Saved</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
