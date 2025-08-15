"use client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wrench,
  User,
  MapPin,
  Clock,
  MessageSquare,
  TrendingUp,
  Bell,
  Search,
  Plus,
  Eye,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

interface RecentActivity {
  id: string
  type: "job_posted" | "application_received" | "job_completed" | "message_received"
  title: string
  description: string
  timestamp: string
  status?: "pending" | "completed" | "cancelled"
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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl float-animation"></div>
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-secondary/15 to-primary/15 rounded-full blur-3xl float-animation"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
        <div className="text-center relative z-10">
          <Wrench className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground/70 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-secondary/15 to-primary/15 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CTEK JOB LEADS
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative hover:bg-white/20 backdrop-blur-sm">
                <Bell className="h-5 w-5 text-foreground" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
              </Button>

              <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                <div className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <Badge
                    variant={isAdmin ? "destructive" : isDealer ? "default" : "secondary"}
                    className="text-xs bg-primary/10 text-primary border-primary/20"
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={signOut}
                className="border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-xl text-foreground/70">
            {isCustomer && "Manage your ECU remapping jobs and connect with certified dealers"}
            {isDealer && "View available jobs in your area and grow your business"}
            {isAdmin && "Oversee the platform and monitor all activities"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-secondary/80 to-secondary backdrop-blur-xl text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold">{loadingStats ? "..." : stats.totalJobs}</p>
                </div>
                <Wrench className="h-8 w-8 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/80 to-green-600/80 backdrop-blur-xl text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold">{loadingStats ? "..." : stats.activeJobs}</p>
                </div>
                <Clock className="h-8 w-8 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/80 to-primary backdrop-blur-xl text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{isDealer ? "Applications" : "Messages"}</p>
                  <p className="text-3xl font-bold">
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

          <Card className="bg-gradient-to-br from-orange-500/80 to-orange-600/80 backdrop-blur-xl text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">{loadingStats ? "..." : stats.successRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-white/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">Quick Actions</CardTitle>
                <CardDescription className="text-foreground/70">
                  Get started with your most common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Customer Actions */}
                  {isCustomer && (
                    <>
                      <Button
                        asChild
                        size="lg"
                        className="h-20 btn-primary hover:scale-105 transition-all duration-300"
                      >
                        <Link href="/jobs/post" className="flex flex-col items-center gap-2">
                          <Plus className="h-6 w-6" />
                          <span className="font-semibold">Post New Job</span>
                          <span className="text-sm opacity-90">£5 per posting</span>
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="h-20 border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-105 transition-all duration-300"
                      >
                        <Link href="/customer/jobs" className="flex flex-col items-center gap-2">
                          <Eye className="h-6 w-6" />
                          <span className="font-semibold">View My Jobs</span>
                          <span className="text-sm text-foreground/60">{stats.totalJobs} total</span>
                        </Link>
                      </Button>
                    </>
                  )}

                  {/* Dealer Actions */}
                  {isDealer && (
                    <>
                      <Button
                        asChild
                        size="lg"
                        className="h-20 btn-primary hover:scale-105 transition-all duration-300"
                      >
                        <Link href="/dealer/jobs" className="flex flex-col items-center gap-2">
                          <Search className="h-6 w-6" />
                          <span className="font-semibold">Browse Jobs</span>
                          <span className="text-sm opacity-90">Find work nearby</span>
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="h-20 border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-105 transition-all duration-300"
                      >
                        <Link href="/dealer/applications" className="flex flex-col items-center gap-2">
                          <User className="h-6 w-6" />
                          <span className="font-semibold">My Applications</span>
                          <span className="text-sm text-foreground/60">{stats.pendingApplications} pending</span>
                        </Link>
                      </Button>
                    </>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <>
                      <Button
                        asChild
                        size="lg"
                        className="h-20 btn-primary hover:scale-105 transition-all duration-300"
                      >
                        <Link href="/admin/users" className="flex flex-col items-center gap-2">
                          <User className="h-6 w-6" />
                          <span className="font-semibold">Manage Users</span>
                          <span className="text-sm opacity-90">Platform oversight</span>
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="h-20 border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-105 transition-all duration-300"
                      >
                        <Link href="/admin/analytics" className="flex flex-col items-center gap-2">
                          <TrendingUp className="h-6 w-6" />
                          <span className="font-semibold">Analytics</span>
                          <span className="text-sm text-foreground/60">Platform insights</span>
                        </Link>
                      </Button>
                    </>
                  )}

                  {/* Common Actions */}
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-105 transition-all duration-300"
                  >
                    <Link href="/messages" className="flex flex-col items-center gap-2">
                      <MessageSquare className="h-6 w-6" />
                      <span className="font-semibold">Messages</span>
                      <span className="text-sm text-foreground/60">{stats.totalMessages} conversations</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-105 transition-all duration-300"
                  >
                    <Link href="/dealers" className="flex flex-col items-center gap-2">
                      <MapPin className="h-6 w-6" />
                      <span className="font-semibold">Find Dealers</span>
                      <span className="text-sm text-foreground/60">Browse network</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">Success Rate</span>
                    <span className="text-sm font-bold text-foreground">{stats.successRate}%</span>
                  </div>
                  <Progress value={stats.successRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">Monthly Progress</span>
                    <span className="text-sm font-bold text-foreground">{stats.thisMonthJobs} jobs</span>
                  </div>
                  <Progress value={(stats.thisMonthJobs / Math.max(stats.totalJobs, 1)) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20"
                    >
                      <div className="p-1 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                        {activity.type === "job_posted" && <Plus className="h-4 w-4 text-secondary" />}
                        {activity.type === "application_received" && <User className="h-4 w-4 text-green-600" />}
                        {activity.type === "job_completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {activity.type === "message_received" && <MessageSquare className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                        <p className="text-sm text-foreground/70">{activity.description}</p>
                        <p className="text-xs text-foreground/50 mt-1">{activity.timestamp}</p>
                      </div>
                      {activity.status && (
                        <Badge
                          variant={activity.status === "completed" ? "default" : "secondary"}
                          className="text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-xl border border-white/20 hover:shadow-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">Completed Jobs</span>
                  <span className="font-bold text-foreground">{stats.completedJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">This Month</span>
                  <span className="font-bold text-foreground">{stats.thisMonthJobs}</span>
                </div>
                {isDealer && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70">Total Earnings</span>
                    <span className="font-bold text-green-600">£{stats.totalEarnings}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
