"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Users,
  Wrench,
  Settings,
  BarChart3,
  Shield,
  Car,
  Zap,
  MessageSquare,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
  Database,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"

interface Stats {
  totalUsers: number
  activeDealers: number
  activeJobs: number
  monthlyRevenue: number
  totalVehicles: number
  activeDynoSessions: number
  carMeetEvents: number
  totalBookings: number
  pendingApplications: number
  unreadMessages: number
}

interface RecentActivity {
  id: string
  type: "user_registration" | "job_posted" | "booking_created" | "dyno_session" | "car_meet"
  description: string
  timestamp: string
  user_name?: string
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [isBuildTime, setIsBuildTime] = useState(typeof window === "undefined")
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeDealers: 0,
    activeJobs: 0,
    monthlyRevenue: 0,
    totalVehicles: 0,
    activeDynoSessions: 0,
    carMeetEvents: 0,
    totalBookings: 0,
    pendingApplications: 0,
    unreadMessages: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setIsBuildTime(false)
  }, [])

  useEffect(() => {
    if (!mounted || isBuildTime) return
    loadAdminData()
  }, [mounted, isBuildTime])

  const loadAdminData = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      const [
        usersResult,
        companiesResult,
        jobsResult,
        vehiclesResult,
        dynoSessionsResult,
        carMeetsResult,
        bookingsResult,
        applicationsResult,
        messagesResult,
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("vehicles").select("id", { count: "exact", head: true }),
        supabase.from("dyno_sessions").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("car_meet_locations").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
      ])

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .eq("status", "completed")

      const monthlyRevenue =
        paymentsData?.reduce((sum: number, payment: { amount: string | number }) => sum + Number(payment.amount), 0) ||
        0

      setStats({
        totalUsers: usersResult.count || 0,
        activeDealers: companiesResult.count || 0,
        activeJobs: jobsResult.count || 0,
        monthlyRevenue,
        totalVehicles: vehiclesResult.count || 0,
        activeDynoSessions: dynoSessionsResult.count || 0,
        carMeetEvents: carMeetsResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        pendingApplications: applicationsResult.count || 0,
        unreadMessages: messagesResult.count || 0,
      })

      await loadRecentActivity()
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const supabase = createClient()

      // Get recent activities from different tables
      const activities: RecentActivity[] = []

      // Recent user registrations
      const { data: recentUsers } = await supabase
        .from("users")
        .select("id, first_name, last_name, created_at, role")
        .order("created_at", { ascending: false })
        .limit(5)

      recentUsers?.forEach((user) => {
        activities.push({
          id: `user_${user.id}`,
          type: "user_registration",
          description: `New ${user.role} registered: ${user.first_name} ${user.last_name}`,
          timestamp: user.created_at,
          user_name: `${user.first_name} ${user.last_name}`,
        })
      })

      // Recent job postings
      const { data: recentJobs } = await supabase
        .from("jobs")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(3)

      recentJobs?.forEach((job) => {
        activities.push({
          id: `job_${job.id}`,
          type: "job_posted",
          description: `New job posted: ${job.title}`,
          timestamp: job.created_at,
        })
      })

      // Recent bookings
      const { data: recentBookings } = await supabase
        .from("bookings")
        .select("id, created_at, users!customer_id(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(3)

      recentBookings?.forEach((booking) => {
        activities.push({
          id: `booking_${booking.id}`,
          type: "booking_created",
          description: `New ECU remapping booking by ${booking.users?.first_name} ${booking.users?.last_name}`,
          timestamp: booking.created_at,
        })
      })

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 10))
    } catch (error) {
      console.error("Error loading recent activity:", error)
    }
  }

  if (!mounted || loadingStats || isBuildTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              CTEK ECU Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600 shadow-lg">
              <span className="text-white font-medium">{user?.email?.split("@")[0]}</span>
              <Badge className="bg-red-500/80 backdrop-blur-sm">Admin</Badge>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-slate-600 bg-slate-700/20 backdrop-blur-sm hover:bg-slate-700/30 text-white"
            >
              <Link href="/">Main Site</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent mb-2">
            ECU Remapping Platform Admin
          </h1>
          <p className="text-slate-300">Manage the complete ECU remapping ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-slate-400">Platform members</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Dealers</CardTitle>
              <Wrench className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeDealers}</div>
              <p className="text-xs text-slate-400">ECU specialists</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Registered Vehicles</CardTitle>
              <Car className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalVehicles}</div>
              <p className="text-xs text-slate-400">In database</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">£{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-slate-400">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Dyno Sessions</CardTitle>
              <Zap className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeDynoSessions}</div>
              <p className="text-xs text-slate-400">Live testing</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Car Meet Events</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.carMeetEvents}</div>
              <p className="text-xs text-slate-400">Upcoming events</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pending Applications</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pendingApplications}</div>
              <p className="text-xs text-slate-400">Need review</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.unreadMessages}</div>
              <p className="text-xs text-slate-400">Platform messages</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="management" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="management" className="data-[state=active]:bg-red-500">
              Platform Management
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-red-500">
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-red-500">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    User Management
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Manage customers, dealers, and admin accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-red-500 hover:bg-red-600">
                    <Link href="/admin/users">Manage Users</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    Dealer Applications
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Review and approve ECU specialist applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-amber-500 hover:bg-amber-600">
                    <Link href="/admin/dealers">Review Applications</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                    Vehicle Database
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Manage registered vehicles and DVLA integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                    <Link href="/admin/vehicles">Manage Vehicles</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    Dyno Sessions
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Monitor live dyno testing and performance data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-purple-500 hover:bg-purple-600">
                    <Link href="/admin/dyno">Monitor Sessions</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    Car Meet Events
                  </CardTitle>
                  <CardDescription className="text-slate-300">Manage car meet locations and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                    <Link href="/admin/car-meets">Manage Events</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    Payment Management
                  </CardTitle>
                  <CardDescription className="text-slate-300">Process payments and manage transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                    <Link href="/admin/payments">Manage Payments</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-500" />
                  Recent Platform Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            activity.type === "user_registration"
                              ? "bg-blue-500/20"
                              : activity.type === "job_posted"
                                ? "bg-green-500/20"
                                : activity.type === "booking_created"
                                  ? "bg-purple-500/20"
                                  : "bg-gray-500/20"
                          }`}
                        >
                          {activity.type === "user_registration" && <UserCheck className="h-4 w-4 text-blue-400" />}
                          {activity.type === "job_posted" && <Wrench className="h-4 w-4 text-green-400" />}
                          {activity.type === "booking_created" && <Calendar className="h-4 w-4 text-purple-400" />}
                        </div>
                        <div>
                          <p className="text-white text-sm">{activity.description}</p>
                          <p className="text-slate-400 text-xs">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-500" />
                  Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button asChild className="w-full bg-red-500 hover:bg-red-600 justify-start">
                        <Link href="/admin/analytics">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Detailed Analytics
                        </Link>
                      </Button>
                      <Button asChild className="w-full bg-slate-700 hover:bg-slate-600 justify-start">
                        <Link href="/admin/reports">
                          <Database className="h-4 w-4 mr-2" />
                          Generate Reports
                        </Link>
                      </Button>
                      <Button asChild className="w-full bg-slate-700 hover:bg-slate-600 justify-start">
                        <Link href="/admin/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Platform Settings
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Database</span>
                        <Badge className="bg-green-500">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">DVLA Integration</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Payment System</span>
                        <Badge className="bg-green-500">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Real-time Updates</span>
                        <Badge className="bg-green-500">Connected</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
