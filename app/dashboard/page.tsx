"use client"

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-gray-800 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CTEK JOB LEADS</span>
            </Link>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-purple-600 rounded-full"></span>
              </Button>

              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="p-1 bg-white rounded-full">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <Badge variant={isAdmin ? "destructive" : isDealer ? "default" : "secondary"} className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <Button variant="outline" onClick={signOut} className="border-gray-300 bg-transparent">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome back, {user.first_name}! 👋</h1>
          <p className="text-xl text-gray-600">
            {isCustomer && "Manage your ECU remapping jobs and connect with certified dealers"}
            {isDealer && "View available jobs in your area and grow your business"}
            {isAdmin && "Oversee the platform and monitor all activities"}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold">{loadingStats ? "..." : stats.totalJobs}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold">{loadingStats ? "..." : stats.activeJobs}</p>
                </div>
                <Clock className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">{isDealer ? "Applications" : "Messages"}</p>
                  <p className="text-3xl font-bold">
                    {loadingStats ? "..." : isDealer ? stats.pendingApplications : stats.totalMessages}
                  </p>
                </div>
                {isDealer ? (
                  <User className="h-8 w-8 text-purple-200" />
                ) : (
                  <MessageSquare className="h-8 w-8 text-purple-200" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">{loadingStats ? "..." : stats.successRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600">Get started with your most common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Customer Actions */}
                  {isCustomer && (
                    <>
                      <Button asChild size="lg" className="h-20 bg-gray-800 hover:bg-gray-900 text-white">
                        <Link href="/jobs/post" className="flex flex-col items-center gap-2">
                          <Plus className="h-6 w-6" />
                          <span className="font-semibold">Post New Job</span>
                          <span className="text-sm opacity-90">£5 per posting</span>
                        </Link>
                      </Button>

                      <Button asChild variant="outline" size="lg" className="h-20 border-gray-300 bg-transparent">
                        <Link href="/customer/jobs" className="flex flex-col items-center gap-2">
                          <Eye className="h-6 w-6" />
                          <span className="font-semibold">View My Jobs</span>
                          <span className="text-sm text-gray-500">{stats.totalJobs} total</span>
                        </Link>
                      </Button>
                    </>
                  )}

                  {/* Dealer Actions */}
                  {isDealer && (
                    <>
                      <Button asChild size="lg" className="h-20 bg-gray-800 hover:bg-gray-900 text-white">
                        <Link href="/dealer/jobs" className="flex flex-col items-center gap-2">
                          <Search className="h-6 w-6" />
                          <span className="font-semibold">Browse Jobs</span>
                          <span className="text-sm opacity-90">Find work nearby</span>
                        </Link>
                      </Button>

                      <Button asChild variant="outline" size="lg" className="h-20 border-gray-300 bg-transparent">
                        <Link href="/dealer/applications" className="flex flex-col items-center gap-2">
                          <User className="h-6 w-6" />
                          <span className="font-semibold">My Applications</span>
                          <span className="text-sm text-gray-500">{stats.pendingApplications} pending</span>
                        </Link>
                      </Button>
                    </>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <>
                      <Button asChild size="lg" className="h-20 bg-gray-800 hover:bg-gray-900 text-white">
                        <Link href="/admin/users" className="flex flex-col items-center gap-2">
                          <User className="h-6 w-6" />
                          <span className="font-semibold">Manage Users</span>
                          <span className="text-sm opacity-90">Platform oversight</span>
                        </Link>
                      </Button>

                      <Button asChild variant="outline" size="lg" className="h-20 border-gray-300 bg-transparent">
                        <Link href="/admin/analytics" className="flex flex-col items-center gap-2">
                          <TrendingUp className="h-6 w-6" />
                          <span className="font-semibold">Analytics</span>
                          <span className="text-sm text-gray-500">Platform insights</span>
                        </Link>
                      </Button>
                    </>
                  )}

                  {/* Common Actions */}
                  <Button asChild variant="outline" size="lg" className="h-20 border-gray-300 bg-transparent">
                    <Link href="/messages" className="flex flex-col items-center gap-2">
                      <MessageSquare className="h-6 w-6" />
                      <span className="font-semibold">Messages</span>
                      <span className="text-sm text-gray-500">{stats.totalMessages} conversations</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="lg" className="h-20 border-gray-300 bg-transparent">
                    <Link href="/dealers" className="flex flex-col items-center gap-2">
                      <MapPin className="h-6 w-6" />
                      <span className="font-semibold">Find Dealers</span>
                      <span className="text-sm text-gray-500">Browse network</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Success Rate</span>
                    <span className="text-sm font-bold text-gray-900">{stats.successRate}%</span>
                  </div>
                  <Progress value={stats.successRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
                    <span className="text-sm font-bold text-gray-900">{stats.thisMonthJobs} jobs</span>
                  </div>
                  <Progress value={(stats.thisMonthJobs / Math.max(stats.totalJobs, 1)) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="p-1 rounded-full bg-white">
                        {activity.type === "job_posted" && <Plus className="h-4 w-4 text-blue-600" />}
                        {activity.type === "application_received" && <User className="h-4 w-4 text-green-600" />}
                        {activity.type === "job_completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {activity.type === "message_received" && <MessageSquare className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                      {activity.status && (
                        <Badge variant={activity.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Jobs</span>
                  <span className="font-bold text-gray-900">{stats.completedJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-bold text-gray-900">{stats.thisMonthJobs}</span>
                </div>
                {isDealer && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Earnings</span>
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
