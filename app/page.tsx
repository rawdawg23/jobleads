"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Zap, Gauge, MapPin, Users, TrendingUp, Settings, Car, Activity } from "lucide-react"

export default function HomePage() {
  const hasInitialized = useRef(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dynoData, setDynoData] = useState({
    power: 420 + Math.random() * 50,
    torque: 580 + Math.random() * 70,
    rpm: 6500 + Math.random() * 500,
    ecuTemp: 85 + Math.random() * 15,
    isLive: false,
  })
  const [carMeetData, setCarMeetData] = useState({
    title: "Birmingham ECU Meet",
    location: "Birmingham City Centre",
    attendees: 45,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    isLive: false,
  })
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeDealers: 89,
    completedJobs: 3456,
    monthlyRevenue: 45670,
  })
  const [isScanning, setIsScanning] = useState(false)

  const fetchAllData = useCallback(async () => {
    try {
      const [dynoResponse, carMeetResponse, statsResponse] = await Promise.allSettled([
        // Simulate dyno data fetch
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                power: 420 + Math.random() * 50,
                torque: 580 + Math.random() * 70,
                rpm: 6500 + Math.random() * 500,
                ecuTemp: 85 + Math.random() * 15,
                isLive: false,
              }),
            100,
          ),
        ),

        // Simulate car meet data fetch
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                title: "Birmingham ECU Meet",
                location: "Birmingham City Centre",
                attendees: 45 + Math.floor(Math.random() * 10),
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                isLive: false,
              }),
            150,
          ),
        ),

        // Simulate stats data fetch
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                totalUsers: 1247 + Math.floor(Math.random() * 50),
                activeDealers: 89 + Math.floor(Math.random() * 5),
                completedJobs: 3456 + Math.floor(Math.random() * 100),
                monthlyRevenue: 45670 + Math.floor(Math.random() * 10000),
              }),
            200,
          ),
        ),
      ])

      if (dynoResponse.status === "fulfilled") {
        setDynoData(dynoResponse.value as any)
      }
      if (carMeetResponse.status === "fulfilled") {
        setCarMeetData(carMeetResponse.value as any)
      }
      if (statsResponse.status === "fulfilled") {
        setStats(statsResponse.value as any)
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    }
  }, [])

  const updateDemoData = useCallback(() => {
    setDynoData({
      power: 420 + Math.random() * 50,
      torque: 580 + Math.random() * 70,
      rpm: 6500 + Math.random() * 500,
      ecuTemp: 85 + Math.random() * 15,
      isLive: false,
    })

    setStats((prev) => ({
      ...prev,
      monthlyRevenue: 45670 + Math.floor(Math.random() * 10000),
    }))
  }, [])

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    console.log("[v0] HomePage component mounting")

    fetchAllData()

    const interval = setInterval(updateDemoData, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [fetchAllData, updateDemoData])

  useEffect(() => {
    const scanningInterval = setInterval(() => {
      setIsScanning((prev) => !prev)
    }, 3000)

    return () => clearInterval(scanningInterval)
  }, [])

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
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <TrendingUp className="w-6 h-6" />
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
