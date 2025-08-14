"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, ArrowLeft, Users, Wrench, CreditCard, TrendingUp, Calendar, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Analytics {
  totalUsers: number
  totalCustomers: number
  totalDealers: number
  totalJobs: number
  activeJobs: number
  completedJobs: number
  totalRevenue: number
  monthlyRevenue: number
  averageJobValue: number
  topPostcodes: Array<{ postcode: string; count: number }>
  recentGrowth: {
    usersThisMonth: number
    jobsThisMonth: number
    revenueThisMonth: number
  }
}

export default function AdminAnalyticsPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics()
    }
  }, [user, isAdmin])

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient()
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Fetch all data in parallel
      const [
        usersResult,
        customersResult,
        dealersResult,
        jobsResult,
        activeJobsResult,
        completedJobsResult,
        paymentsResult,
        monthlyPaymentsResult,
        monthlyUsersResult,
        monthlyJobsResult,
        postcodesResult,
      ] = await Promise.all([
        supabase.from("users").select("id"),
        supabase.from("users").select("id").eq("role", "customer"),
        supabase.from("users").select("id").eq("role", "dealer"),
        supabase.from("jobs").select("id, customer_price"),
        supabase.from("jobs").select("id").in("status", ["open", "accepted", "in_progress"]),
        supabase.from("jobs").select("id, customer_price").eq("status", "completed"),
        supabase.from("payments").select("amount").eq("status", "completed"),
        supabase
          .from("payments")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", startOfMonth.toISOString()),
        supabase.from("users").select("id").gte("created_at", startOfMonth.toISOString()),
        supabase.from("jobs").select("id").gte("created_at", startOfMonth.toISOString()),
        supabase.from("jobs").select("customer_postcode").not("customer_postcode", "is", null),
      ])

      // Process postcode data
      const postcodeCounts: { [key: string]: number } = {}
      postcodesResult.data?.forEach((job) => {
        if (job.customer_postcode) {
          const area = job.customer_postcode.split(" ")[0] // Get postcode area (e.g., "SW1" from "SW1A 1AA")
          postcodeCounts[area] = (postcodeCounts[area] || 0) + 1
        }
      })

      const topPostcodes = Object.entries(postcodeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([postcode, count]) => ({ postcode, count }))

      const totalRevenue = (paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0) / 100
      const monthlyRevenue = (monthlyPaymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0) / 100
      const completedJobsData = completedJobsResult.data || []
      const averageJobValue =
        completedJobsData.length > 0
          ? completedJobsData.reduce((sum, job) => sum + (job.customer_price || 0), 0) / completedJobsData.length
          : 0

      setAnalytics({
        totalUsers: usersResult.data?.length || 0,
        totalCustomers: customersResult.data?.length || 0,
        totalDealers: dealersResult.data?.length || 0,
        totalJobs: jobsResult.data?.length || 0,
        activeJobs: activeJobsResult.data?.length || 0,
        completedJobs: completedJobsResult.data?.length || 0,
        totalRevenue,
        monthlyRevenue,
        averageJobValue,
        topPostcodes,
        recentGrowth: {
          usersThisMonth: monthlyUsersResult.data?.length || 0,
          jobsThisMonth: monthlyJobsResult.data?.length || 0,
          revenueThisMonth: monthlyRevenue,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount)
  }

  if (loading || loadingAnalytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin || !analytics) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Platform Analytics</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Analytics</h1>
          <p className="text-slate-600">Comprehensive insights into platform performance and usage</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-3xl font-bold">{analytics.totalUsers}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />+{analytics.recentGrowth.usersThisMonth} this month
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Jobs</p>
                  <p className="text-3xl font-bold">{analytics.totalJobs}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />+{analytics.recentGrowth.jobsThisMonth} this month
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {formatCurrency(analytics.recentGrowth.revenueThisMonth)} this month
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Job Value</p>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.averageJobValue)}</p>
                  <p className="text-xs text-slate-600 mt-1">Per completed job</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Breakdown
              </CardTitle>
              <CardDescription>Distribution of users by role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Customers</Badge>
                  <span className="text-sm text-slate-600">Users who post jobs</span>
                </div>
                <span className="font-bold">{analytics.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Dealers</Badge>
                  <span className="text-sm text-slate-600">Service providers</span>
                </div>
                <span className="font-bold">{analytics.totalDealers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Admins</Badge>
                  <span className="text-sm text-slate-600">Platform administrators</span>
                </div>
                <span className="font-bold">
                  {analytics.totalUsers - analytics.totalCustomers - analytics.totalDealers}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Job Statistics
              </CardTitle>
              <CardDescription>Current job status breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Active Jobs</Badge>
                  <span className="text-sm text-slate-600">Currently open or in progress</span>
                </div>
                <span className="font-bold">{analytics.activeJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  <span className="text-sm text-slate-600">Successfully finished jobs</span>
                </div>
                <span className="font-bold">{analytics.completedJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Completion Rate</span>
                </div>
                <span className="font-bold">
                  {analytics.totalJobs > 0 ? Math.round((analytics.completedJobs / analytics.totalJobs) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Top postcode areas by job volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analytics.topPostcodes.map((area, index) => (
                <div key={area.postcode} className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{area.postcode}</div>
                  <div className="text-sm text-slate-600">{area.count} jobs</div>
                  <div className="text-xs text-slate-500">#{index + 1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Growth */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              This Month's Growth
            </CardTitle>
            <CardDescription>Key metrics for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analytics.recentGrowth.usersThisMonth}</div>
                <div className="text-sm text-slate-600">New Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{analytics.recentGrowth.jobsThisMonth}</div>
                <div className="text-sm text-slate-600">New Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(analytics.recentGrowth.revenueThisMonth)}
                </div>
                <div className="text-sm text-slate-600">Revenue Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
