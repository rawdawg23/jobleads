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
  Eye,
  Settings,
  CreditCard,
  Star,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface DealerStats {
  totalApplications: number
  activeJobs: number
  completedJobs: number
  totalMessages: number
  totalEarnings: number
  averageRating: number
  responseTime: number
  successRate: number
}

export default function DealerProfilePage() {
  const { user, loading, signOut, isDealer } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DealerStats>({
    totalApplications: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalMessages: 0,
    totalEarnings: 0,
    averageRating: 0,
    responseTime: 0,
    successRate: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && (!user || !isDealer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isDealer, router])

  useEffect(() => {
    if (user && isDealer) {
      fetchDealerData()
    }
  }, [user, isDealer])

  const fetchDealerData = async () => {
    try {
      const response = await fetch("/api/profile/dealer/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch dealer data:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || !user || !isDealer) {
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
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
              </Button>

              <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                <div className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Dealer</Badge>
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
            Dealer Profile
          </h1>
          <p className="text-xl text-foreground/70">View available jobs in your area and grow your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground">{loadingStats ? "..." : stats.totalApplications}</p>
                </div>
                <User className="h-8 w-8 text-primary/60" />
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
                  <p className="text-foreground/70 text-sm font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold text-foreground">£{loadingStats ? "..." : stats.totalEarnings}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-105 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/70 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold text-foreground">{loadingStats ? "..." : stats.successRate}%</p>
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
                <CardDescription className="text-foreground/70">
                  Manage your dealer business and find new opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button asChild size="lg" className="h-20 btn-primary hover:scale-105 transition-all duration-300">
                    <Link href="/dealer/jobs" className="flex flex-col items-center gap-2">
                      <Search className="h-6 w-6" />
                      <span className="font-semibold">Browse Jobs</span>
                      <span className="text-sm opacity-90">Find work nearby</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-20 glass-button hover:scale-105 transition-all duration-300 bg-transparent"
                  >
                    <Link href="/dealer/applications" className="flex flex-col items-center gap-2">
                      <Eye className="h-6 w-6" />
                      <span className="font-semibold">My Applications</span>
                      <span className="text-sm text-foreground/60">{stats.totalApplications} total</span>
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
                    <Link href="/dealer/schedule" className="flex flex-col items-center gap-2">
                      <Calendar className="h-6 w-6" />
                      <span className="font-semibold">Schedule</span>
                      <span className="text-sm text-foreground/60">Manage availability</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Business Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/profile/dealer/settings" className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      Business Profile
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/profile/dealer/services" className="flex items-center gap-3">
                      <Wrench className="h-5 w-5" />
                      Services & Pricing
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/profile/dealer/coverage" className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" />
                      Coverage Area
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="glass-button justify-start bg-transparent">
                    <Link href="/profile/dealer/reviews" className="flex items-center gap-3">
                      <Star className="h-5 w-5" />
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
                    <span className="text-sm font-medium text-foreground/70">Success Rate</span>
                    <span className="text-sm font-bold text-foreground">{stats.successRate}%</span>
                  </div>
                  <Progress value={stats.successRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">Average Rating</span>
                    <span className="text-sm font-bold text-foreground">{stats.averageRating}/5</span>
                  </div>
                  <Progress value={(stats.averageRating / 5) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground/70">Response Time</span>
                    <span className="text-sm font-bold text-foreground">{stats.responseTime}h</span>
                  </div>
                  <Progress value={Math.max(0, 100 - stats.responseTime * 10)} className="h-2" />
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
                  <span className="text-sm text-foreground/70">Total Earnings</span>
                  <span className="font-bold text-green-600">£{stats.totalEarnings}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
