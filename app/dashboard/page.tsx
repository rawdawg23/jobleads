"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, User, MapPin, Clock, MessageSquare, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalMessages: number
  pendingApplications: number
}

export default function DashboardPage() {
  const { user, loading, signOut, isCustomer, isDealer, isAdmin } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalMessages: 0,
    pendingApplications: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const supabase = createClient()

      if (isCustomer) {
        const [jobsResult, messagesResult] = await Promise.all([
          supabase.from("jobs").select("id, status").eq("customer_id", user.id),
          supabase.from("messages").select("id").eq("job_id", user.id),
        ])

        setStats({
          totalJobs: jobsResult.data?.length || 0,
          activeJobs: jobsResult.data?.filter((job) => job.status === "open").length || 0,
          totalMessages: messagesResult.data?.length || 0,
          pendingApplications: 0,
        })
      } else if (isDealer) {
        const dealerResult = await supabase.from("dealers").select("id").eq("user_id", user.id).single()

        if (dealerResult.data) {
          const [applicationsResult, messagesResult] = await Promise.all([
            supabase.from("job_applications").select("id, status").eq("dealer_id", dealerResult.data.id),
            supabase.from("messages").select("id").eq("dealer_id", dealerResult.data.id),
          ])

          setStats({
            totalJobs: 0,
            activeJobs: applicationsResult.data?.filter((app) => app.status === "accepted").length || 0,
            totalMessages: messagesResult.data?.length || 0,
            pendingApplications: applicationsResult.data?.filter((app) => app.status === "pending").length || 0,
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">ECU Remap Pro</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-600" />
              <span className="text-slate-900">
                {user.first_name} {user.last_name}
              </span>
              <Badge variant={isAdmin ? "destructive" : isDealer ? "default" : "secondary"}>{user.role}</Badge>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.first_name}!</h1>
          <p className="text-slate-600">
            {isCustomer && "Manage your ECU remapping jobs and find local dealers"}
            {isDealer && "View available jobs in your area and manage your business"}
            {isAdmin && "Oversee the platform, manage users and monitor activity"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Customer Dashboard Cards */}
          {isCustomer && (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Post New Job
                  </CardTitle>
                  <CardDescription>Create a new ECU remapping job posting for £5</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/jobs/post">Post Job - £5</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    My Jobs
                  </CardTitle>
                  <CardDescription>
                    {loadingStats ? "Loading..." : `${stats.totalJobs} total jobs, ${stats.activeJobs} active`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/customer/jobs">View Jobs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    Find Dealers
                  </CardTitle>
                  <CardDescription>Browse verified dealers in your area</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/dealers">Browse Dealers</Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Dealer Dashboard Cards */}
          {isDealer && (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Available Jobs
                  </CardTitle>
                  <CardDescription>Browse jobs in your 30-60 mile radius</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/dealer/jobs">View Jobs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    My Applications
                  </CardTitle>
                  <CardDescription>
                    {loadingStats ? "Loading..." : `${stats.pendingApplications} pending, ${stats.activeJobs} active`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/dealer/applications">My Applications</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Business Profile
                  </CardTitle>
                  <CardDescription>Manage your dealer profile and tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/dealer/profile">Edit Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Admin Dashboard Cards */}
          {isAdmin && (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Manage Users
                  </CardTitle>
                  <CardDescription>View and manage all platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/admin/users">Manage Users</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-green-600" />
                    Dealer Applications
                  </CardTitle>
                  <CardDescription>Review and approve dealer applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/admin/dealers">Review Applications</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription>Configure payment gateway and system settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/admin/settings">Settings</Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Common Cards */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                Messages
              </CardTitle>
              <CardDescription>{loadingStats ? "Loading..." : `${stats.totalMessages} conversations`}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/messages">View Messages</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
