"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Users, Wrench, Settings, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  totalUsers: number
  activeDealers: number
  activeJobs: number
  monthlyRevenue: number
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [isBuildTime, setIsBuildTime] = useState(typeof window === "undefined")
  const { user, loading, isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeDealers: 0,
    activeJobs: 0,
    monthlyRevenue: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setIsBuildTime(false)
  }, [])

  useEffect(() => {
    if (!mounted || isBuildTime) return

    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
      return
    }

    if (user && isAdmin) {
      loadStats()
    }
  }, [user, loading, isAdmin, router, mounted, isBuildTime])

  const loadStats = async () => {
    try {
      const supabase = createClient()

      const [usersResult, companiesResult, jobsResult] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "active"),
      ])

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .eq("status", "completed")

      const monthlyRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      setStats({
        totalUsers: usersResult.count || 0,
        activeDealers: companiesResult.count || 0,
        activeJobs: jobsResult.count || 0,
        monthlyRevenue,
      })
    } catch (error) {
      console.error("Error loading admin stats:", error)
      setStats({
        totalUsers: 0,
        activeDealers: 0,
        activeJobs: 0,
        monthlyRevenue: 0,
      })
    } finally {
      setLoadingStats(false)
    }
  }

  if (!mounted || loading || loadingStats || isBuildTime) {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CTEK JOB LEADS Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
              <span className="text-foreground font-medium">
                {user.firstName} {user.lastName}
              </span>
              <Badge variant="destructive" className="bg-red-500/80 backdrop-blur-sm">
                Admin
              </Badge>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            >
              <Link href="/dashboard">Main Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Admin Control Panel
          </h1>
          <p className="text-foreground/70">Manage the CTEK JOB LEADS platform</p>
        </div>

        {/* Admin Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Payment Management */}
          <Card className="hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 hover:scale-105 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-secondary/80 to-secondary rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                Payment Management
              </CardTitle>
              <CardDescription className="text-foreground/70">Verify and manage bank transfer payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full btn-primary">
                <Link href="/admin/payments">Manage Payments</Link>
              </Button>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 hover:scale-105 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-500/80 to-green-600/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-white" />
                </div>
                User Management
              </CardTitle>
              <CardDescription className="text-foreground/70">View and manage all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                asChild
                className="w-full border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Dealer Applications */}
          <Card className="hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 hover:scale-105 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary/80 to-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                Dealer Applications
              </CardTitle>
              <CardDescription className="text-foreground/70">Review and approve dealer registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                asChild
                className="w-full border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Link href="/admin/dealers">Review Applications</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Platform Analytics */}
          <Card className="hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 hover:scale-105 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-orange-500/80 to-orange-600/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Platform Analytics
              </CardTitle>
              <CardDescription className="text-foreground/70">View platform statistics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                asChild
                className="w-full border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Link href="/admin/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Job Management */}
          <Card className="hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 hover:scale-105 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-red-500/80 to-red-600/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                Job Management
              </CardTitle>
              <CardDescription className="text-foreground/70">Monitor and manage all platform jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                asChild
                className="w-full border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Link href="/admin/jobs">Manage Jobs</Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 hover:scale-105 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-slate-500/80 to-slate-600/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                System Settings
              </CardTitle>
              <CardDescription className="text-foreground/70">
                Configure platform settings and bank details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                asChild
                className="w-full border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Link href="/admin/settings">System Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Platform Overview</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">{stats.totalUsers}</div>
                  <div className="text-sm text-foreground/70">Total Users</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeDealers}</div>
                  <div className="text-sm text-foreground/70">Active Dealers</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.activeJobs}</div>
                  <div className="text-sm text-foreground/70">Active Jobs</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">£{stats.monthlyRevenue.toFixed(0)}</div>
                  <div className="text-sm text-foreground/70">Monthly Revenue</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
