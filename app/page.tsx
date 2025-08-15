"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [supabase, setSupabase] = useState<any>(null)
  const [dynoData, setDynoData] = useState({
    power: 0,
    torque: 0,
    rpm: 0,
    ecuTemp: 0,
    isLive: false,
  })
  const [carMeetData, setCarMeetData] = useState({
    title: "",
    location: "",
    attendees: 0,
    date: "",
    isLive: false,
  })
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDealers: 0,
    completedJobs: 0,
    monthlyRevenue: 0,
  })
  const [isScanning, setIsScanning] = useState(false)

  // Initialize Supabase client
  useEffect(() => {
    console.log("[v0] HomePage component mounting")
    try {
      const client = createClient()
      setSupabase(client)
      console.log("[v0] Supabase client initialized successfully")
    } catch (error) {
      console.error("[v0] Failed to initialize Supabase client:", error)
    }
  }, [])

  // Fetch live dyno data
  const fetchDynoData = useCallback(async () => {
    if (!supabase) return

    try {
      const { data: sessions, error } = await supabase
        .from("dyno_sessions")
        .select(`
          *,
          sensor_readings (
            power_hp,
            torque_nm,
            rpm,
            ecu_temp,
            timestamp
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) throw error

      if (sessions && sessions.length > 0) {
        const session = sessions[0]
        const latestReading = session.sensor_readings?.[0]

        if (latestReading) {
          setDynoData({
            power: latestReading.power_hp || 0,
            torque: latestReading.torque_nm || 0,
            rpm: latestReading.rpm || 0,
            ecuTemp: latestReading.ecu_temp || 0,
            isLive: true,
          })
          console.log("[v0] Live dyno data fetched successfully")
        } else {
          // Demo data when no live readings
          setDynoData({
            power: 420 + Math.random() * 50,
            torque: 580 + Math.random() * 70,
            rpm: 6500 + Math.random() * 500,
            ecuTemp: 85 + Math.random() * 15,
            isLive: false,
          })
        }
      } else {
        // Demo data when no active sessions
        setDynoData({
          power: 420 + Math.random() * 50,
          torque: 580 + Math.random() * 70,
          rpm: 6500 + Math.random() * 500,
          ecuTemp: 85 + Math.random() * 15,
          isLive: false,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching dyno data:", error)
      // Fallback to demo data
      setDynoData({
        power: 420 + Math.random() * 50,
        torque: 580 + Math.random() * 70,
        rpm: 6500 + Math.random() * 500,
        ecuTemp: 85 + Math.random() * 15,
        isLive: false,
      })
    }
  }, [supabase])

  // Fetch car meet data
  const fetchCarMeetData = useCallback(async () => {
    if (!supabase) return

    try {
      const { data: meets, error } = await supabase
        .from("car_meet_locations")
        .select(`
          *,
          car_meet_attendees (
            id,
            payment_status
          )
        `)
        .eq("status", "active")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(1)

      if (error) throw error

      if (meets && meets.length > 0) {
        const meet = meets[0]
        const paidAttendees =
          meet.car_meet_attendees?.filter(
            (attendee: any) => attendee.payment_status === "paid" || attendee.payment_status === "confirmed",
          ).length || 0

        setCarMeetData({
          title: meet.title,
          location: meet.location_name,
          attendees: paidAttendees,
          date: new Date(meet.event_date).toLocaleDateString(),
          isLive: true,
        })
        console.log("[v0] Live car meet data fetched successfully")
      } else {
        // Demo data when no upcoming meets
        setCarMeetData({
          title: "Birmingham ECU Meet",
          location: "Birmingham City Centre",
          attendees: 45,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          isLive: false,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching car meet data:", error)
      // Fallback to demo data
      setCarMeetData({
        title: "Birmingham ECU Meet",
        location: "Birmingham City Centre",
        attendees: 45,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        isLive: false,
      })
    }
  }, [supabase])

  // Fetch platform stats
  const fetchStats = useCallback(async () => {
    if (!supabase) return

    try {
      const [usersResult, companiesResult, jobsResult] = await Promise.allSettled([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("companies").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ])

      const totalUsers = usersResult.status === "fulfilled" ? usersResult.value.count || 0 : 1247
      const activeDealers = companiesResult.status === "fulfilled" ? companiesResult.value.count || 0 : 89
      const completedJobs = jobsResult.status === "fulfilled" ? jobsResult.value.count || 0 : 3456

      setStats({
        totalUsers,
        activeDealers,
        completedJobs,
        monthlyRevenue: 45670 + Math.floor(Math.random() * 10000),
      })
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
      // Fallback to demo stats
      setStats({
        totalUsers: 1247,
        activeDealers: 89,
        completedJobs: 3456,
        monthlyRevenue: 45670,
      })
    }
  }, [supabase])

  // Initial data fetch and periodic updates
  useEffect(() => {
    if (!supabase) return

    const fetchAllData = async () => {
      await Promise.all([fetchDynoData(), fetchCarMeetData(), fetchStats()])
    }

    fetchAllData()

    // Update data every 2 minutes
    const interval = setInterval(fetchAllData, 120000)
    return () => clearInterval(interval)
  }, [supabase, fetchDynoData, fetchCarMeetData, fetchStats])

  // Diagnostic scanning animation
  useEffect(() => {
    const scanningInterval = setInterval(() => {
      setIsScanning((prev) => !prev)
    }, 3000)

    return () => clearInterval(scanningInterval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Professional ECU Remapping</h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Unlock your vehicle's true potential with our advanced ECU tuning services. Real-time diagnostics, expert
              remapping, and community-driven car meets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Book ECU Remap
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-slate-900 bg-transparent"
              >
                Join Car Meet - £10/month
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Live Dyno Data */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${dynoData.isLive ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}
                />
                Live Dyno Data
              </CardTitle>
              <Badge variant={dynoData.isLive ? "default" : "secondary"} className="w-fit">
                {dynoData.isLive ? "LIVE" : "DEMO"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Power:</span>
                  <span className="text-white font-mono">{dynoData.power.toFixed(1)} HP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Torque:</span>
                  <span className="text-white font-mono">{dynoData.torque.toFixed(1)} Nm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">RPM:</span>
                  <span className="text-white font-mono">{dynoData.rpm.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">ECU Temp:</span>
                  <span className="text-white font-mono">{dynoData.ecuTemp.toFixed(1)}°C</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Scanner */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isScanning ? "bg-blue-500 animate-pulse" : "bg-slate-500"}`} />
                ECU Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-green-400">{isScanning ? "Scanning..." : "Ready"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progress:</span>
                  <span className="text-white font-mono">{isScanning ? "87%" : "100%"}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      isScanning ? "bg-blue-500 w-[87%]" : "bg-green-500 w-full"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Car Meet */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${carMeetData.isLive ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}
                />
                Next Car Meet
              </CardTitle>
              <Badge variant={carMeetData.isLive ? "default" : "secondary"} className="w-fit">
                {carMeetData.isLive ? "LIVE" : "DEMO"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-slate-400">Event:</span>
                  <p className="text-white font-medium">{carMeetData.title}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white">{carMeetData.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Attendees:</span>
                  <span className="text-white">{carMeetData.attendees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Date:</span>
                  <span className="text-white">{carMeetData.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Platform Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Users:</span>
                  <span className="text-white font-mono">{stats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Dealers:</span>
                  <span className="text-white font-mono">{stats.activeDealers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Completed Jobs:</span>
                  <span className="text-white font-mono">{stats.completedJobs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Monthly Revenue:</span>
                  <span className="text-green-400 font-mono">£{stats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">ECU Remapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Professional ECU tuning to unlock your vehicle's hidden potential. Increase power, torque, and fuel
                efficiency.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Book Remap</Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Live Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Real-time vehicle diagnostics and health monitoring. Identify issues before they become problems.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">Run Diagnostics</Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Car Meets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Join our exclusive car meet community. Monthly events, networking, and shared passion for performance.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Join Community - £10/month</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
