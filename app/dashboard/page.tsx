"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, User, Clock, MessageSquare, TrendingUp, Bell, Activity, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserProfileCard } from "@/components/profile/user-profile-card"
import { UserStatsCard } from "@/components/profile/user-stats-card"
import { RecentActivity } from "@/components/profile/recent-activity"
import { RoleBasedNavigation } from "@/components/auth/role-based-navigation"

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  totalMessages: number
  pendingApplications: number
  totalEarnings: number
  thisMonthJobs: number
  successRate: number
}

interface LiveNotification {
  id: string
  type: "job" | "application" | "message" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
}

export default function DashboardPage() {
  const { user, loading, signOut, isCustomer, isDealer, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalMessages: 0,
    pendingApplications: 0,
    totalEarnings: 0,
    thisMonthJobs: 0,
    successRate: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [notifications, setNotifications] = useState<LiveNotification[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        // Fetch user-specific stats from database
        const { data: applications } = await supabase.from("applications").select("*").eq("user_id", user.id)

        const { data: savedJobs } = await supabase.from("saved_jobs").select("*").eq("user_id", user.id)

        const { data: jobs } = await supabase.from("jobs").select("*").eq("created_by", user.id)

        // Calculate real stats from live data
        const totalApplications = applications?.length || 0
        const totalSavedJobs = savedJobs?.length || 0
        const totalUserJobs = jobs?.length || 0
        const activeUserJobs = jobs?.filter((job) => job.status === "active")?.length || 0
        const completedUserJobs = jobs?.filter((job) => job.status === "completed")?.length || 0

        const successRate =
          totalApplications > 0
            ? Math.round(
                ((applications?.filter((app) => app.status === "accepted")?.length || 0) / totalApplications) * 100,
              )
            : 0

        setStats({
          totalJobs: isCustomer ? totalUserJobs : totalApplications,
          activeJobs: isCustomer
            ? activeUserJobs
            : applications?.filter((app) => app.status === "pending")?.length || 0,
          completedJobs: isCustomer
            ? completedUserJobs
            : applications?.filter((app) => app.status === "accepted")?.length || 0,
          totalMessages: 0, // Will be calculated from messages table
          pendingApplications: isDealer ? applications?.filter((app) => app.status === "pending")?.length || 0 : 0,
          totalEarnings: 0, // Will be calculated from payments
          thisMonthJobs: 0, // Will be calculated from current month data
          successRate,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchDashboardData()

    const setupRealtimeSubscriptions = () => {
      const channels: any[] = []

      // Subscribe to applications changes
      if (isDealer) {
        const applicationsChannel = supabase
          .channel("applications_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` },
            (payload) => {
              console.log("[v0] Applications change detected:", payload)
              fetchDashboardData() // Refresh stats

              // Add notification for new applications
              if (payload.eventType === "INSERT") {
                const newNotification: LiveNotification = {
                  id: Date.now().toString(),
                  type: "application",
                  title: "New Application Status",
                  message: "Your application status has been updated",
                  timestamp: new Date().toISOString(),
                  read: false,
                }
                setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
              }
            },
          )
          .subscribe()

        channels.push(applicationsChannel)
      }

      // Subscribe to jobs changes for customers
      if (isCustomer) {
        const jobsChannel = supabase
          .channel("jobs_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "jobs", filter: `created_by=eq.${user.id}` },
            (payload) => {
              console.log("[v0] Jobs change detected:", payload)
              fetchDashboardData()

              if (payload.eventType === "UPDATE") {
                const newNotification: LiveNotification = {
                  id: Date.now().toString(),
                  type: "job",
                  title: "Job Updated",
                  message: "One of your jobs has been updated",
                  timestamp: new Date().toISOString(),
                  read: false,
                }
                setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
              }
            },
          )
          .subscribe()

        channels.push(jobsChannel)
      }

      return () => {
        channels.forEach((channel) => supabase.removeChannel(channel))
      }
    }

    const cleanup = setupRealtimeSubscriptions()
    return cleanup
  }, [user, isCustomer, isDealer, supabase])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen glass-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float-delayed"></div>

        <div className="text-center relative z-10">
          <div className="glass-avatar mx-auto mb-6">
            <Wrench className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-white text-lg font-medium">Loading your dashboard...</p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen glass-background relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-accent/10 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2"></div>

      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="glass-avatar group-hover:scale-110 transition-transform duration-300">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-white">CTEK JOB LEADS</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
                <span className="text-xs text-glass-text">{isOnline ? "Live" : "Offline"}</span>
              </div>

              <Button variant="ghost" size="sm" className="glass-button-ghost relative">
                <Bell className="h-5 w-5 text-white" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs text-white font-bold animate-bounce">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </Button>

              <div className="glass-card px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="glass-avatar">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <Badge className="glass-badge text-xs">{user.role}</Badge>
                  </div>
                </div>
              </div>

              <Button variant="outline" onClick={signOut} className="glass-button-secondary bg-transparent">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
              Welcome back, {user.firstName}!
              <Activity className="h-8 w-8 text-primary animate-pulse" />
            </h1>
            <p className="text-xl text-glass-text">
              {isCustomer && "Manage your ECU remapping jobs and connect with certified dealers"}
              {isDealer && "View available jobs in your area and grow your business"}
              {isAdmin && "Oversee the platform and monitor all activities"}
            </p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-white font-medium">Live Updates Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <RoleBasedNavigation />
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* Real-time stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card-gradient-primary hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">Total Jobs</p>
                      <p className="text-3xl font-bold text-white">{loadingStats ? "..." : stats.totalJobs}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-white/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card-gradient-success hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">Active Jobs</p>
                      <p className="text-3xl font-bold text-white">{loadingStats ? "..." : stats.activeJobs}</p>
                    </div>
                    <Clock className="h-8 w-8 text-white/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card-gradient-secondary hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{isDealer ? "Applications" : "Messages"}</p>
                      <p className="text-3xl font-bold text-white">
                        {loadingStats ? "..." : isDealer ? stats.pendingApplications : stats.totalMessages}
                      </p>
                    </div>
                    {isDealer ? (
                      <User className="h-8 w-8 text-white/60" />
                    ) : (
                      <MessageSquare className="h-8 w-8 text-white/60" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card-gradient-accent hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">Success Rate</p>
                      <p className="text-3xl font-bold text-white">{loadingStats ? "..." : stats.successRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-white/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <UserProfileCard userId={user.id} isEditable={true} />
              <UserStatsCard userId={user.id} />
            </div>

            <RecentActivity userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
