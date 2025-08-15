"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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

const MetricCard = ({
  title,
  value,
  growth,
  icon: Icon,
  gradient,
  color,
}: {
  title: string
  value: string | number
  growth?: string
  icon: any
  gradient: string
  color: string
}) => (
  <Card className={`shadow-xl border-0 bg-gradient-to-br ${gradient} text-white`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`${color} text-sm font-medium`}>{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {growth && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`h-4 w-4 ${color}`} />
              <span className={`text-sm ${color}`}>{growth}</span>
            </div>
          )}
        </div>
        <Icon className={`h-10 w-10 ${color}`} />
      </div>
    </CardContent>
  </Card>
)

const ProgressMetric = ({ label, value, total }: { label: string; value: number; total?: number }) => {
  const percentage = total ? Math.round((value / Math.max(total, 1)) * 100) : value

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{total ? value : `${percentage}%`}</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
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

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
    } finally {
      setLoadingAnalytics(false)
    }
  }, [])

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics()
    }
  }, [user, isAdmin, fetchAnalytics])

  const calculations = useMemo(() => {
    if (!analytics) return null

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount)
    }

    const completionRate =
      analytics.totalJobs === 0 ? 0 : Math.round((analytics.completedJobs / analytics.totalJobs) * 100)
    const getGrowthPercentage = (current: number, total: number) => {
      if (total === 0) return 0
      return Math.round((current / total) * 100)
    }

    return {
      formatCurrency,
      completionRate,
      monthlyGrowthRate: getGrowthPercentage(analytics.recentGrowth.usersThisMonth, analytics.totalUsers),
      adminCount: analytics.totalUsers - analytics.totalCustomers - analytics.totalDealers,
    }
  }, [analytics])

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

  if (!user || !isAdmin || !analytics || !calculations) {
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
          <MetricCard
            title="Total Users"
            value={analytics.totalUsers}
            growth={`+${analytics.recentGrowth.usersThisMonth} this month`}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
            color="text-blue-100"
          />
          <MetricCard
            title="Total Jobs"
            value={analytics.totalJobs}
            growth={`+${analytics.recentGrowth.jobsThisMonth} this month`}
            icon={Wrench}
            gradient="from-green-500 to-green-600"
            color="text-green-100"
          />
          <MetricCard
            title="Total Revenue"
            value={calculations.formatCurrency(analytics.totalRevenue)}
            growth={calculations.formatCurrency(analytics.recentGrowth.revenueThisMonth) + " this month"}
            icon={CreditCard}
            gradient="from-purple-500 to-purple-600"
            color="text-purple-100"
          />
          <MetricCard
            title="Avg Job Value"
            value={calculations.formatCurrency(analytics.averageJobValue)}
            growth="Per completed job"
            icon={Target}
            gradient="from-orange-500 to-orange-600"
            color="text-orange-100"
          />
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
              <ProgressMetric label="Job Completion Rate" value={calculations.completionRate} />
              <ProgressMetric label="Active Jobs" value={analytics.activeJobs} total={analytics.totalJobs} />
              <ProgressMetric label="Monthly Growth" value={calculations.monthlyGrowthRate} />
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
                <span className="font-bold text-gray-900">{calculations.adminCount}</span>
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
                  {calculations.formatCurrency(analytics.recentGrowth.revenueThisMonth)}
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
