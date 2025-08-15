"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wrench,
  Users,
  MessageSquare,
  TrendingUp,
  Bell,
  Settings,
  Shield,
  BarChart3,
  Database,
  AlertTriangle,
  Activity,
  DollarSign,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface AdminStats {
  totalUsers: number
  totalDealers: number
  totalCustomers: number
  totalJobs: number
  totalRevenue: number
  activeJobs: number
  pendingApprovals: number
  systemHealth: number
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function AdminProfilePage() {
  const { user, loading, signOut, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDealers: 0,
    totalCustomers: 0,
    totalJobs: 0,
    totalRevenue: 0,
    activeJobs: 0,
    pendingApprovals: 0,
    systemHealth: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin) {
      fetchAdminData()
    }
  }, [user, isAdmin])

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/profile/admin/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground/70 text-lg">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-secondary/15 to-primary/15 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
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
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></span>
              </Button>

              <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                <div className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <Badge className="text-xs bg-red-600/10 text-red-600 border-red-600/20">Administrator</Badge>
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
            Admin Control Panel
          </h1>
          <p className="text-xl text-foreground/70">Oversee the platform and monitor all activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{loadingStats ? "..." : stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold text-foreground">{loadingStats ? "..." : stats.totalJobs}</p>
                </div>
                <Wrench className="h-8 w-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Platform Revenue</p>
                  <p className="text-3xl font-bold text-foreground">£{loadingStats ? "..." : stats.totalRevenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">System Health</p>
                  <p className="text-3xl font-bold text-foreground">{loadingStats ? "..." : stats.systemHealth}%</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">Admin Actions</CardTitle>
                <CardDescription className="text-foreground/70">
                  Platform management and oversight tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button asChild size="lg" className="h-20 btn-primary hover:scale-105 transition-all duration-300">
                    <Link href="/admin/users" className="flex flex-col items-center gap-2">
                      <Users className="h-6 w-6" />
                      <span className="font-semibold">Manage Users</span>
                      <span className="text-sm opacity-90">{stats.totalUsers} total</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 glass-button hover:scale-105 transition-all duration-300 bg-transparent"
                  >
                    <Link href="/admin/analytics" className="flex flex-col items-center gap-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="font-semibold">Analytics</span>
                      <span className="text-sm text-foreground/60">Platform insights</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 glass-button hover:scale-105 transition-all duration-300 bg-transparent"
                  >
                    <Link href="/admin/messages" className="flex flex-col items-center gap-2">
                      <MessageSquare className="h-6 w-6" />
                      <span className="font-semibold">Broadcast Messages</span>
                      <span className="text-sm text-foreground/60">Site-wide alerts</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 glass-button hover:scale-105 transition-all duration-300 bg-transparent"
                  >
                    <Link href="/admin/system" className="flex flex-col items-center gap-2">
                      <Database className="h-6 w-6" />
                      <span className="font-semibold">System Status</span>
                      <span className="text-sm text-foreground/60">{stats.systemHealth}% health</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">System Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/admin/settings" className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      Platform Settings
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/admin/dealers" className="flex items-center gap-3">
                      <Eye className="h-5 w-5" />
                      Dealer Management
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/admin/payments" className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5" />
                      Payment Management
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/admin/reports" className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5" />
                      Reports & Logs
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Platform Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">System Health</span>
                    <span className="text-sm font-bold text-foreground">{stats.systemHealth}%</span>
                  </div>
                  <Progress value={stats.systemHealth} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">User Growth</span>
                    <span className="text-sm font-bold text-foreground">+12%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">Job Completion Rate</span>
                    <span className="text-sm font-bold text-foreground">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">Active Dealers</span>
                  <span className="font-bold text-foreground">{stats.totalDealers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">Active Customers</span>
                  <span className="font-bold text-foreground">{stats.totalCustomers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">Pending Approvals</span>
                  <span className="font-bold text-orange-600">{stats.pendingApprovals}</span>
                </div>
              </CardContent>
            </Card>

            {stats.pendingApprovals > 0 && (
              <Card className="glass-card border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-orange-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 mb-3">
                    You have {stats.pendingApprovals} items requiring approval.
                  </p>
                  <Button asChild size="sm" variant="outline" className="glass-button bg-transparent">
                    <Link href="/admin/approvals">Review Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
