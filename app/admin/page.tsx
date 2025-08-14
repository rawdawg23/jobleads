"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Users, Wrench, Settings, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface Stats {
  totalUsers: number
  activeDealers: number
  activeJobs: number
  monthlyRevenue: number
}

export default function AdminDashboardPage() {
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
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
      return
    }

    if (user && isAdmin) {
      loadStats()
    }
  }, [user, loading, isAdmin, router])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error loading admin stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">CTEK JOB LEADS Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-900">
                {user.firstName} {user.lastName}
              </span>
              <Badge variant="destructive">Admin</Badge>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Main Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Control Panel</h1>
          <p className="text-slate-600">Manage the CTEK JOB LEADS platform</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Payment Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Management
              </CardTitle>
              <CardDescription>Verify and manage bank transfer payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/payments">Manage Payments</Link>
              </Button>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                User Management
              </CardTitle>
              <CardDescription>View and manage all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Dealer Applications */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-purple-600" />
                Dealer Applications
              </CardTitle>
              <CardDescription>Review and approve dealer registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/dealers">Review Applications</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Platform Analytics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Platform Analytics
              </CardTitle>
              <CardDescription>View platform statistics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Job Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-red-600" />
                Job Management
              </CardTitle>
              <CardDescription>Monitor and manage all platform jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/jobs">Manage Jobs</Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600" />
                System Settings
              </CardTitle>
              <CardDescription>Configure platform settings and bank details</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/settings">System Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
                  <div className="text-sm text-slate-600">Total Users</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeDealers}</div>
                  <div className="text-sm text-slate-600">Active Dealers</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.activeJobs}</div>
                  <div className="text-sm text-slate-600">Active Jobs</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">£{stats.monthlyRevenue.toFixed(0)}</div>
                  <div className="text-sm text-slate-600">Monthly Revenue</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
