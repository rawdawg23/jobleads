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
  Plus,
  Eye,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface CustomerStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  totalMessages: number
  totalSpent: number
  averageRating: number
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function CustomerProfilePage() {
  const { user, loading, signOut, isCustomer } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<CustomerStats>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalMessages: 0,
    totalSpent: 0,
    averageRating: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!loading && (!user || !isCustomer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isCustomer, router])

  useEffect(() => {
    if (user && isCustomer) {
      fetchCustomerData()
    }
  }, [user, isCustomer])

  useEffect(() => {
    if (!user || !isCustomer) return

    const jobsSubscription = supabase
      .channel("customer-jobs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
          filter: `customer_id=eq.${user.id}`,
        },
        () => {
          fetchCustomerData() // Refresh stats when jobs change
        },
      )
      .subscribe()

    const paymentsSubscription = supabase
      .channel("customer-payments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `customer_id=eq.${user.id}`,
        },
        () => {
          fetchCustomerData() // Refresh stats when payments change
        },
      )
      .subscribe()

    const messagesSubscription = supabase
      .channel("customer-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `customer_id=eq.${user.id}`,
        },
        () => {
          fetchCustomerData() // Refresh stats when messages change
        },
      )
      .subscribe()

    return () => {
      jobsSubscription.unsubscribe()
      paymentsSubscription.unsubscribe()
      messagesSubscription.unsubscribe()
    }
  }, [user, isCustomer])

  const fetchCustomerData = async () => {
    try {
      const response = await fetch("/api/profile/customer/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch customer data:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || !user || !isCustomer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground/70 text-lg">Loading your profile...</p>
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
                {stats.totalMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></span>
                )}
              </Button>

              <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                <div className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <Badge className="text-xs bg-secondary/10 text-secondary border-secondary/20">Customer</Badge>
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
            Customer Profile
          </h1>
          <p className="text-xl text-foreground/70">
            Manage your ECU remapping jobs and connect with certified dealers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold text-foreground">{loadingStats ? "..." : stats.totalJobs}</p>
                </div>
                <Wrench className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold text-foreground">{loadingStats ? "..." : stats.activeJobs}</p>
                </div>
                <Clock className="h-8 w-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Total Spent</p>
                  <p className="text-3xl font-bold text-foreground">£{loadingStats ? "..." : stats.totalSpent}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Average Rating</p>
                  <p className="text-3xl font-bold text-foreground">{loadingStats ? "..." : stats.averageRating}/5</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">Quick Actions</CardTitle>
                <CardDescription className="text-foreground/70">Manage your ECU remapping needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button asChild size="lg" className="h-20 btn-primary hover:scale-105 transition-all duration-300">
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
                    className="h-20 glass-button hover:scale-105 transition-all duration-300 bg-transparent"
                  >
                    <Link href="/customer/jobs" className="flex flex-col items-center gap-2">
                      <Eye className="h-6 w-6" />
                      <span className="font-semibold">View My Jobs</span>
                      <span className="text-sm text-foreground/60">{stats.totalJobs} total</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 glass-button hover:scale-105 transition-all duration-300 bg-transparent"
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
                    className="h-20 glass-button hover:scale-105 transition-all duration-300 bg-transparent"
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

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/profile/customer/settings" className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      Account Settings
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/profile/customer/billing" className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      Billing & Payments
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/profile/customer/history" className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      Job History
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/profile/customer/reviews" className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5" />
                      Reviews & Ratings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">Job Completion Rate</span>
                    <span className="text-sm font-bold text-foreground">
                      {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={stats.totalJobs > 0 ? (stats.completedJobs / stats.totalJobs) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">Average Rating</span>
                    <span className="text-sm font-bold text-foreground">{stats.averageRating}/5</span>
                  </div>
                  <Progress value={(stats.averageRating / 5) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">Completed Jobs</span>
                  <span className="font-bold text-foreground">{stats.completedJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">Active Jobs</span>
                  <span className="font-bold text-foreground">{stats.activeJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">Total Messages</span>
                  <span className="font-bold text-foreground">{stats.totalMessages}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
