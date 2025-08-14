"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  ArrowLeft,
  Users,
  Wrench,
  CreditCard,
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
  Target,
} from "lucide-react"
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

  const getCompletionRate = () => {
    if (!analytics || analytics.totalJobs === 0) return 0
    return Math.round((analytics.completedJobs / analytics.totalJobs) * 100)
  }

  const getGrowthPercentage = (current: number, total: number) => {
    if (total === 0) return 0
    return Math.round((current / total) * 100)
  }

  if (loading || loadingAnalytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-800 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin || !analytics) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Admin</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Platform Analytics</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Platform Analytics</h1>
          <p className="text-xl text-gray-600">Comprehensive insights into platform performance and growth</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{analytics.totalUsers}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-blue-200" />
                    <span className="text-sm text-blue-100">+{analytics.recentGrowth.usersThisMonth} this month</span>
                  </div>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold">{analytics.totalJobs}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-200" />
                    <span className="text-sm text-green-100">+{analytics.recentGrowth.jobsThisMonth} this month</span>
                  </div>
                </div>
                <Wrench className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-purple-200" />
                    <span className="text-sm text-purple-100">
                      {formatCurrency(analytics.recentGrowth.revenueThisMonth)} this month
                    </span>
                  </div>
                </div>
                <CreditCard className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Job Value</p>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.averageJobValue)}</p>
                  <p className="text-sm text-orange-100 mt-2">Per completed job</p>
                </div>
                <Target className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Activity className="h-5 w-5 text-blue-600" />
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Job Completion Rate</span>
                  <span className="text-sm font-bold text-gray-900">{getCompletionRate()}%</span>
                </div>
                <Progress value={getCompletionRate()} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Jobs</span>
                  <span className="text-sm font-bold text-gray-900">{analytics.activeJobs}</span>
                </div>
                <Progress value={(analytics.activeJobs / Math.max(analytics.totalJobs, 1)) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Growth</span>
                  <span className="text-sm font-bold text-gray-900">
                    {getGrowthPercentage(analytics.recentGrowth.usersThisMonth, analytics.totalUsers)}%
                  </span>
                </div>
                <Progress
                  value={getGrowthPercentage(analytics.recentGrowth.usersThisMonth, analytics.totalUsers)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Users className="h-5 w-5 text-green-600" />
                User Distribution
              </CardTitle>
              <CardDescription className="text-gray-600">Breakdown by user role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 text-blue-800">Customers</Badge>
                  <span className="text-sm text-gray-600">Job posters</span>
                </div>
                <span className="font-bold text-gray-900">{analytics.totalCustomers}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800">Dealers</Badge>
                  <span className="text-sm text-gray-600">Service providers</span>
                </div>
                <span className="font-bold text-gray-900">{analytics.totalDealers}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-100 text-red-800">Admins</Badge>
                  <span className="text-sm text-gray-600">Platform managers</span>
                </div>
                <span className="font-bold text-gray-900">
                  {analytics.totalUsers - analytics.totalCustomers - analytics.totalDealers}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Calendar className="h-5 w-5 text-purple-600" />
                This Month
              </CardTitle>
              <CardDescription className="text-gray-600">Current month performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.recentGrowth.usersThisMonth}</div>
                <div className="text-sm text-blue-700 font-medium">New Users</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.recentGrowth.jobsThisMonth}</div>
                <div className="text-sm text-green-700 font-medium">New Jobs</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analytics.recentGrowth.revenueThisMonth)}
                </div>
                <div className="text-sm text-purple-700 font-medium">Revenue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <MapPin className="h-6 w-6 text-blue-600" />
              Geographic Distribution
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Top postcode areas by job volume across the UK
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analytics.topPostcodes.map((area, index) => (
                <div
                  key={area.postcode}
                  className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl font-bold text-gray-800 mb-2">{area.postcode}</div>
                  <div className="text-lg font-semibold text-gray-600 mb-1">{area.count} jobs</div>
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1} most active
                  </Badge>
                </div>
              ))}
            </div>

            {analytics.topPostcodes.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No geographic data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
