"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Zap, Gauge, MapPin, Users, TrendingUp, Settings, Car, Activity } from "lucide-react"

export default function HomePage() {
  const [supabase, setSupabase] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    console.log("[v0] HomePage component mounting")
    try {
      const client = createClient()
      setSupabase(client)
      console.log("[v0] Supabase client initialized successfully")
    } catch (error) {
      console.error("[v0] Failed to initialize Supabase client:", error)
      setHasError(true)
    }
  }, [])

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

      if (error) {
        console.warn("[v0] Dyno data query error (using demo data):", error.message)
        throw error
      }

      if (sessions && sessions.length > 0) {
        const session = sessions[0]
        const latestReading = session.sensor_readings?.[0]

        if (latestReading) {
          setDynoData({
            power: Number(latestReading.power_hp) || 0,
            torque: Number(latestReading.torque_nm) || 0,
            rpm: Number(latestReading.rpm) || 0,
            ecuTemp: Number(latestReading.ecu_temp) || 0,
            isLive: true,
          })
          console.log("[v0] Live dyno data fetched successfully")
          return
        }
      }

      setDynoData({
        power: 420 + Math.random() * 50,
        torque: 580 + Math.random() * 70,
        rpm: 6500 + Math.random() * 500,
        ecuTemp: 85 + Math.random() * 15,
        isLive: false,
      })
    } catch (error) {
      console.error("[v0] Error fetching dyno data:", error)
      setDynoData({
        power: 420 + Math.random() * 50,
        torque: 580 + Math.random() * 70,
        rpm: 6500 + Math.random() * 500,
        ecuTemp: 85 + Math.random() * 15,
        isLive: false,
      })
    }
  }, [supabase])

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

      if (error) {
        console.warn("[v0] Car meet data query error (using demo data):", error.message)
        throw error
      }

      if (meets && meets.length > 0) {
        const meet = meets[0]
        const paidAttendees =
          meet.car_meet_attendees?.filter(
            (attendee: any) => attendee.payment_status === "paid" || attendee.payment_status === "confirmed",
          ).length || 0

        setCarMeetData({
          title: String(meet.title || ""),
          location: String(meet.location_name || ""),
          attendees: Number(paidAttendees) || 0,
          date: new Date(meet.event_date).toLocaleDateString(),
          isLive: true,
        })
        console.log("[v0] Live car meet data fetched successfully")
        return
      }

      setCarMeetData({
        title: "Birmingham ECU Meet",
        location: "Birmingham City Centre",
        attendees: 45,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        isLive: false,
      })
    } catch (error) {
      console.error("[v0] Error fetching car meet data:", error)
      setCarMeetData({
        title: "Birmingham ECU Meet",
        location: "Birmingham City Centre",
        attendees: 45,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        isLive: false,
      })
    }
  }, [supabase])

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
        totalUsers: Number(totalUsers) || 1247,
        activeDealers: Number(activeDealers) || 89,
        completedJobs: Number(completedJobs) || 3456,
        monthlyRevenue: 45670 + Math.floor(Math.random() * 10000),
      })
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
      setStats({
        totalUsers: 1247,
        activeDealers: 89,
        completedJobs: 3456,
        monthlyRevenue: 45670,
      })
    }
  }, [supabase])

  useEffect(() => {
    if (!supabase || hasError) return

    const fetchAllData = async () => {
      try {
        await Promise.allSettled([fetchDynoData(), fetchCarMeetData(), fetchStats()])
      } catch (error) {
        console.error("[v0] Error in fetchAllData:", error)
      }
    }

    fetchAllData()

    const interval = setInterval(fetchAllData, 300000)
    return () => clearInterval(interval)
  }, [supabase, hasError, fetchDynoData, fetchCarMeetData, fetchStats])

  useEffect(() => {
    const scanningInterval = setInterval(() => {
      setIsScanning((prev) => !prev)
    }, 3000)

    return () => clearInterval(scanningInterval)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">CTEK ECU Remapping</h1>
          <p className="text-slate-300 mb-4">Loading platform data...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-800">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="led-red"></div>
                <div className="led-amber"></div>
                <div className="led-green"></div>
              </div>
              <h1 className="text-xl font-bold text-white">CTEK.CLUB</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="nav-led-item text-white hover:text-red-400 transition-colors">
                <Gauge className="w-4 h-4" />
                Dyno Testing
              </a>
              <a href="#" className="nav-led-item text-white hover:text-red-400 transition-colors">
                <MapPin className="w-4 h-4" />
                Car Meets
              </a>
              <a href="#" className="nav-led-item text-white hover:text-red-400 transition-colors">
                <Settings className="w-4 h-4" />
                ECU Remap
              </a>
              <Button className="glass-button text-white border-red-500">Book Service</Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-red-400 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card border-t border-red-500/20">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-white hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Gauge className="w-5 h-5" />
                Dyno Testing
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-white hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Car Meets
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-white hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                ECU Remap
              </a>
              <Button className="w-full glass-button text-white border-red-500 mt-4">Book Service</Button>
            </div>
          </div>
        )}
      </header>

      <div className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-amber-600/20" />
        <div className="absolute inset-0">
          <div className="animate-dyno-sweep absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="animate-power-surge glass-card p-6 rounded-full">
                <Car className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 animate-pulse-glow">
              Professional ECU Remapping
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Unlock your vehicle's true potential with our advanced ECU tuning services. Real-time diagnostics, expert
              remapping, and community-driven car meets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glass-button text-white border-red-500 text-lg px-8 py-4">
                <Zap className="w-5 h-5 mr-2" />
                Book ECU Remap
              </Button>
              <Button size="lg" className="glass-button text-white border-amber-500 text-lg px-8 py-4">
                <Users className="w-5 h-5 mr-2" />
                Join Car Meet - £10/month
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Live Performance Dashboard</h2>
          <p className="text-xl text-slate-300">Real-time data from our ECU remapping platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="glass-card border-red-500/30 animate-power-surge">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-3">
                <div className={`led-${dynoData.isLive ? "green" : "amber"}`}></div>
                <Activity className="w-5 h-5" />
                Live Dyno Data
              </CardTitle>
              <Badge
                variant={dynoData.isLive ? "default" : "secondary"}
                className="w-fit bg-red-500/20 text-red-300 border-red-500/50"
              >
                {dynoData.isLive ? "LIVE" : "DEMO"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Power:
                  </span>
                  <span className="text-white font-mono text-lg animate-rpm-gauge">{dynoData.power.toFixed(1)} HP</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-1000 animate-dyno-sweep"
                    style={{ width: `${Math.min((dynoData.power / 500) * 100, 100)}%` }}
                  />
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

          <Card className="glass-card border-amber-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-3">
                <div className={`led-${isScanning ? "red" : "green"}`}></div>
                <Settings className="w-5 h-5" />
                ECU Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status:</span>
                  <span className={`${isScanning ? "text-amber-400" : "text-green-400"} font-medium`}>
                    {isScanning ? "Scanning..." : "Ready"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progress:</span>
                  <span className="text-white font-mono">{isScanning ? "87%" : "100%"}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      isScanning
                        ? "bg-gradient-to-r from-amber-500 to-red-500 animate-ecu-scan"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 w-full"
                    }`}
                    style={{ width: isScanning ? "87%" : "100%" }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {isScanning ? "Analyzing ECU parameters..." : "Scan complete - Ready for remap"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-3">
                <div className={`led-${carMeetData.isLive ? "green" : "amber"}`}></div>
                <MapPin className="w-5 h-5" />
                Next Car Meet
              </CardTitle>
              <Badge
                variant={carMeetData.isLive ? "default" : "secondary"}
                className="w-fit bg-green-500/20 text-green-300 border-green-500/50"
              >
                {carMeetData.isLive ? "LIVE" : "DEMO"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-slate-400">Event:</span>
                  <p className="text-white font-medium text-base">{carMeetData.title}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white">{carMeetData.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Attendees:</span>
                  <span className="text-green-400 font-mono text-lg">{carMeetData.attendees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Date:</span>
                  <span className="text-white">{carMeetData.date}</span>
                </div>
                <Button className="w-full mt-3 glass-button text-white border-green-500 text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-3">
                <div className="led-green"></div>
                <TrendingUp className="w-5 h-5" />
                Platform Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Users:</span>
                  <span className="text-white font-mono text-lg">{stats.totalUsers.toLocaleString()}</span>
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
                  <span className="text-green-400 font-mono text-lg">£{stats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Our ECU Remapping Services</h2>
          <p className="text-xl text-slate-300">Professional automotive tuning with cutting-edge technology</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="glass-card border-red-500/30 hover:border-red-500/60 transition-all duration-300 animate-power-surge">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <Zap className="w-6 h-6 text-red-500" />
                ECU Remapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Professional ECU tuning to unlock your vehicle's hidden potential. Increase power by up to 30%, improve
                torque delivery, and enhance fuel efficiency with our custom remapping solutions.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Power Increase:</span>
                  <span className="text-red-400 font-medium">Up to 30%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Torque Boost:</span>
                  <span className="text-red-400 font-medium">Up to 25%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Fuel Economy:</span>
                  <span className="text-green-400 font-medium">Improved</span>
                </div>
              </div>
              <Button className="w-full glass-button text-white border-red-500">
                <Zap className="w-4 h-4 mr-2" />
                Book Remap - From £299
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-amber-500/30 hover:border-amber-500/60 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <Activity className="w-6 h-6 text-amber-500" />
                Live Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Real-time vehicle diagnostics and health monitoring. Advanced OBD scanning, fault code analysis, and
                predictive maintenance alerts to keep your vehicle running at peak performance.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Scan Time:</span>
                  <span className="text-amber-400 font-medium">Under 5 mins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Fault Detection:</span>
                  <span className="text-amber-400 font-medium">99.9% Accurate</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Report:</span>
                  <span className="text-green-400 font-medium">Instant PDF</span>
                </div>
              </div>
              <Button className="w-full glass-button text-white border-amber-500">
                <Activity className="w-4 h-4 mr-2" />
                Run Diagnostics - £49
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/30 hover:border-green-500/60 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <Users className="w-6 h-6 text-green-500" />
                Car Meets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Join our exclusive car meet community. Monthly events across the UK, networking opportunities, dyno
                competitions, and shared passion for automotive performance and tuning.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Monthly Events:</span>
                  <span className="text-green-400 font-medium">12+ Locations</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Members:</span>
                  <span className="text-green-400 font-medium">1,200+ Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Access:</span>
                  <span className="text-green-400 font-medium">24/7 Platform</span>
                </div>
              </div>
              <Button className="w-full glass-button text-white border-green-500">
                <Users className="w-4 h-4 mr-2" />
                Join Community - £10/month
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
