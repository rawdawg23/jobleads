"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function HomePage() {
  const [dynoData] = useState({
    power: 245,
    torque: 380,
    rpm: 3500,
    temp: 89,
    isLive: false,
  })

  const [nearestMeet] = useState({
    location: "Birmingham Car Park",
    distance: "2.3 miles",
    attendees: 12,
    time: "Tonight 7:00 PM",
    id: null,
    status: "active",
    lastUpdated: new Date(),
    isLiveUpdating: false,
  })

  const [diagnosticProgress, setDiagnosticProgress] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [stats] = useState({
    totalJobs: 47,
    activeDealers: 23,
    completedRemaps: 156,
  })

  useEffect(() => {
    let diagnosticInterval: NodeJS.Timeout

    if (isScanning) {
      diagnosticInterval = setInterval(() => {
        setDiagnosticProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false)
            return 0
          }
          return prev + Math.floor(Math.random() * 15) + 5
        })
      }, 800)
    }

    return () => {
      if (diagnosticInterval) {
        clearInterval(diagnosticInterval)
      }
    }
  }, [isScanning])

  const startDiagnostic = () => {
    setIsScanning(true)
    setDiagnosticProgress(0)
  }

  console.log("[v0] Minimal HomePage component rendered successfully")

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="particles-bg" />
      </div>

      <nav className="relative z-10 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                CTEK JOB LEADS
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/jobs" className="nav-led-item">
                <span className="led-green" />
                Browse Jobs
              </Link>
              <Link href="/dealers" className="nav-led-item">
                <span className="led-green" />
                Find Dealers
              </Link>
              <Link href="/car-meets" className="nav-led-item">
                <span className="led-purple" />
                Car Meets
              </Link>
              <Link href="/dyno" className="nav-led-item">
                <span className="led-green" />
                Live Dyno
              </Link>
              <Link href="/auth/login" className="nav-led-item">
                <span className="led-red" />
                Sign In
              </Link>
              <Link href="/payment">
                <Button className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  Get Premium Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                Professional ECU
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Remapping Network
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Connect with certified ECU remapping specialists across the UK. Get expert engine tuning, performance
              optimization, and fuel economy improvements from trusted professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="glass-card border-green-500/20 hover:border-green-400/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-green-400">Live Dyno System</h3>
                  <div className={`${dynoData.isLive ? "led-green animate-pulse" : "led-orange"}`} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Power:</span>
                    <span className="text-green-400 font-mono">{dynoData.power} HP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Torque:</span>
                    <span className="text-green-400 font-mono">{dynoData.torque} Nm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">RPM:</span>
                    <span className="text-green-400 font-mono">{dynoData.rpm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Temp:</span>
                    <span className="text-orange-400 font-mono">{dynoData.temp}°C</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2">{dynoData.isLive ? "🔴 Live Data" : "📊 Demo Data"}</div>
                <Link href="/dyno">
                  <Button className="w-full mt-4 glass-button">View Live Data</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-purple-400">ECU Diagnostic</h3>
                  <div className={`led-purple ${isScanning ? "animate-pulse" : ""}`} />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">System Scan</span>
                      <span className="text-purple-400">{diagnosticProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${diagnosticProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">
                    {isScanning ? "Scanning ECU modules..." : "Ready to scan"}
                  </div>
                </div>
                <Button
                  className="w-full mt-4 glass-button bg-purple-600 hover:bg-purple-700"
                  onClick={startDiagnostic}
                  disabled={isScanning}
                >
                  {isScanning ? "Scanning..." : "Start Diagnostic"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-orange-500/20 hover:border-orange-400/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-orange-400">Nearest Car Meet</h3>
                  <div className={`${nearestMeet.isLiveUpdating ? "led-green animate-pulse" : "led-orange"}`} />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-white font-medium">{nearestMeet.location}</div>
                    <div className="text-slate-400 text-sm">{nearestMeet.distance} away</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Attendees:</span>
                    <Badge
                      variant="secondary"
                      className={`${nearestMeet.isLiveUpdating ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}
                    >
                      {nearestMeet.attendees} going
                      {nearestMeet.isLiveUpdating && <span className="ml-1 animate-pulse">●</span>}
                    </Badge>
                  </div>
                  <div className="text-green-400 text-sm font-medium">{nearestMeet.time}</div>
                  <div className="text-xs text-slate-400">
                    {nearestMeet.isLiveUpdating ? "🔴 Live Updates" : "📊 Demo Data"}
                    {nearestMeet.lastUpdated && (
                      <span className="ml-2">
                        Updated{" "}
                        {nearestMeet.lastUpdated.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <Link href="/car-meets">
                  <Button className="w-full mt-4 glass-button bg-orange-600 hover:bg-orange-700">View All Meets</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="glass-card border-blue-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalJobs}</div>
                <div className="text-slate-300">Active Jobs</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-green-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{stats.activeDealers}</div>
                <div className="text-slate-300">Certified Dealers</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-purple-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{stats.completedRemaps}</div>
                <div className="text-slate-300">Completed Remaps</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="glass-card border-green-500/30 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Secure Car Meet Access
                </h2>
                <p className="text-slate-300 mb-6 text-lg">
                  Join verified car meets with enhanced security features. £10/month provides access to vetted events,
                  verified attendees, and secure location sharing for your safety.
                </p>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="led-green" />
                    <span className="text-sm text-slate-300">Verified Events</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="led-green" />
                    <span className="text-sm text-slate-300">Secure Locations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="led-green" />
                    <span className="text-sm text-slate-300">Community Safety</span>
                  </div>
                </div>
                <Link href="/payment">
                  <Button
                    size="lg"
                    className="glass-button bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg px-8 py-3"
                  >
                    Get Secure Access - £10/month
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
