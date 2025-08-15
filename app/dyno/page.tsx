"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  Gauge,
  Thermometer,
  Zap,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  TrendingUp,
  Clock,
  Database,
  CheckCircle,
  Car,
  ArrowLeft,
  Maximize2,
  Save,
  Award,
} from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface DynoReading {
  rpm: number
  power: number
  torque: number
  timestamp: number
  temp: number
  airFuelRatio: number
}

export default function DynoPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentRpm, setCurrentRpm] = useState(1000)
  const [currentPower, setCurrentPower] = useState(0)
  const [currentTorque, setCurrentTorque] = useState(0)
  const [currentTemp, setCurrentTemp] = useState(78)
  const [airFuelRatio, setAirFuelRatio] = useState(14.7)
  const [testDuration, setTestDuration] = useState(0)
  const [maxPower, setMaxPower] = useState(0)
  const [maxTorque, setMaxTorque] = useState(0)
  const [readings, setReadings] = useState<DynoReading[]>([])
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "completed">("idle")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Simulate dyno test progression
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && testStatus === "running") {
      interval = setInterval(() => {
        setTestDuration((prev) => prev + 0.1)

        // Simulate RPM progression during test
        setCurrentRpm((prev) => {
          const targetRpm = Math.min(7000, 1000 + testDuration * 100)
          return Math.min(targetRpm, prev + 50 + Math.random() * 100)
        })

        // Calculate power and torque based on RPM with realistic curves
        const rpmFactor = currentRpm / 7000
        const powerCurve = Math.sin(rpmFactor * Math.PI) * (1 + Math.random() * 0.1)
        const torqueCurve = Math.sin(rpmFactor * Math.PI * 0.8) * (1 + Math.random() * 0.08)

        const newPower = Math.round(powerCurve * 350 * (0.8 + rpmFactor * 0.4))
        const newTorque = Math.round(torqueCurve * 420 * (1.2 - rpmFactor * 0.3))

        setCurrentPower(newPower)
        setCurrentTorque(newTorque)
        setMaxPower((prev) => Math.max(prev, newPower))
        setMaxTorque((prev) => Math.max(prev, newTorque))

        // Temperature increases during test
        setCurrentTemp((prev) => Math.min(105, prev + 0.2 + Math.random() * 0.3))

        // Air-fuel ratio variations
        setAirFuelRatio((prev) => 14.7 + (Math.random() - 0.5) * 0.8)

        // Store reading
        const newReading: DynoReading = {
          rpm: currentRpm,
          power: newPower,
          torque: newTorque,
          timestamp: Date.now(),
          temp: currentTemp,
          airFuelRatio: airFuelRatio,
        }

        setReadings((prev) => [...prev.slice(-200), newReading])

        // Auto-complete test after reaching high RPM
        if (currentRpm >= 6800) {
          setIsRunning(false)
          setTestStatus("completed")
        }
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isRunning, testStatus, testDuration, currentRpm, currentTemp, airFuelRatio])

  // Canvas animation for real-time graphs
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "rgba(139, 92, 246, 0.1)"
      ctx.lineWidth = 1

      for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i
        const y = (canvas.height / 10) * i

        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      if (readings.length > 1) {
        // Draw power curve
        ctx.strokeStyle = "#8b5cf6"
        ctx.lineWidth = 3
        ctx.beginPath()

        readings.forEach((reading, index) => {
          const x = (index / readings.length) * canvas.width
          const y = canvas.height - (reading.power / 400) * canvas.height

          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()

        // Draw torque curve
        ctx.strokeStyle = "#ec4899"
        ctx.lineWidth = 2
        ctx.beginPath()

        readings.forEach((reading, index) => {
          const x = (index / readings.length) * canvas.width
          const y = canvas.height - (reading.torque / 500) * canvas.height

          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [readings])

  const startTest = () => {
    setIsRunning(true)
    setTestStatus("running")
    setTestDuration(0)
    setCurrentRpm(1000)
    setCurrentPower(0)
    setCurrentTorque(0)
    setMaxPower(0)
    setMaxTorque(0)
    setReadings([])
  }

  const stopTest = () => {
    setIsRunning(false)
    setTestStatus("completed")
  }

  const resetTest = () => {
    setIsRunning(false)
    setTestStatus("idle")
    setTestDuration(0)
    setCurrentRpm(1000)
    setCurrentPower(0)
    setCurrentTorque(0)
    setCurrentTemp(78)
    setMaxPower(0)
    setMaxTorque(0)
    setReadings([])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass-card sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg animate-pulse-glow">
                  <Gauge className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Live Dyno System
                  </h1>
                  <p className="text-sm text-muted-foreground">Professional ECU Performance Testing</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`led-${testStatus === "running" ? "green" : testStatus === "completed" ? "purple" : "red"}`}
                ></div>
                <span className="text-sm font-medium capitalize">{testStatus}</span>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Play className="h-5 w-5 text-primary" />
                Test Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full glass-button bg-gradient-to-r from-primary to-accent"
                onClick={startTest}
                disabled={isRunning}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Test
              </Button>
              <Button
                className="w-full glass-button bg-transparent"
                variant="outline"
                onClick={stopTest}
                disabled={!isRunning}
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop Test
              </Button>
              <Button className="w-full glass-button bg-transparent" variant="outline" onClick={resetTest}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-accent" />
                Power Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">{currentPower}</div>
              <div className="text-sm text-muted-foreground mb-3">HP @ {currentRpm} RPM</div>
              <div className="text-xs text-muted-foreground">Peak: {maxPower} HP</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-300"
                  style={{ width: `${(currentPower / 400) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Torque Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-2">{currentTorque}</div>
              <div className="text-sm text-muted-foreground mb-3">Nm @ {Math.round(currentRpm * 0.7)} RPM</div>
              <div className="text-xs text-muted-foreground">Peak: {maxTorque} Nm</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-300"
                  style={{ width: `${(currentTorque / 500) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Test Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">{testDuration.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current RPM</span>
                  <span className="text-sm font-medium text-primary">{currentRpm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data Points</span>
                  <span className="text-sm font-medium">{readings.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Graph Display */}
        <Card className="glass-card border-primary/20 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Real-Time Performance Graph
                </CardTitle>
                <CardDescription>Live power and torque curves</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-64 md:h-80 border border-border rounded-lg bg-card/50"
              />
              <div className="absolute top-4 right-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-0.5 bg-primary"></div>
                  <span className="text-muted-foreground">Power (HP)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-0.5 bg-accent"></div>
                  <span className="text-muted-foreground">Torque (Nm)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensor Monitoring */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-orange-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Thermometer className="h-5 w-5 text-orange-500" />
                Engine Temp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500 mb-2">{Math.round(currentTemp)}°C</div>
              <div className="text-sm text-muted-foreground mb-3">
                {currentTemp > 95 ? "High" : currentTemp > 85 ? "Normal" : "Cool"}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentTemp > 95 ? "bg-red-500" : currentTemp > 85 ? "bg-orange-500" : "bg-green-500"
                  }`}
                  style={{ width: `${(currentTemp / 120) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-blue-500" />
                Air/Fuel Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500 mb-2">{airFuelRatio.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground mb-3">
                {Math.abs(airFuelRatio - 14.7) < 0.5 ? "Optimal" : "Adjusting"}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((airFuelRatio - 12) / 6) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ECU Connection</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dyno Calibration</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Safety Systems</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5 text-purple-500" />
                Data Logging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recording</span>
                  <span className={`text-sm font-medium ${isRunning ? "text-green-500" : "text-muted-foreground"}`}>
                    {isRunning ? "Active" : "Stopped"}
                  </span>
                </div>
                <Button className="w-full glass-button" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results Summary */}
        {testStatus === "completed" && (
          <Card className="glass-card border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                Test Results Summary
              </CardTitle>
              <CardDescription>Performance analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">{maxPower}</div>
                  <div className="text-sm text-muted-foreground">Peak Power (HP)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">{maxTorque}</div>
                  <div className="text-sm text-muted-foreground">Peak Torque (Nm)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{testDuration.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Test Duration (s)</div>
                </div>
              </div>

              <div className="mt-6 p-4 glass-card-grey rounded-lg">
                <h4 className="font-semibold mb-2">Performance Analysis</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • Power curve shows {maxPower > 300 ? "excellent" : maxPower > 200 ? "good" : "moderate"}{" "}
                    performance characteristics
                  </li>
                  <li>
                    • Torque delivery is {maxTorque > 400 ? "outstanding" : maxTorque > 300 ? "strong" : "adequate"}{" "}
                    across the RPM range
                  </li>
                  <li>
                    • Engine temperature remained within {currentTemp < 95 ? "safe" : "elevated"} operating limits
                  </li>
                  <li>• Air/fuel ratio maintained optimal combustion efficiency</li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="glass-button bg-gradient-to-r from-primary to-accent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" className="glass-button bg-transparent">
                  <Car className="h-4 w-4 mr-2" />
                  Book Remap Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
