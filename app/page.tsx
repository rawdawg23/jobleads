"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Users,
  Car,
  ArrowRight,
  Zap,
  Settings,
  TrendingUp,
  Menu,
  X,
  Activity,
  Gauge,
  Cpu,
  Database,
  MapPin,
  CreditCard,
  BarChart3,
  Wrench,
  Thermometer,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <header className="border-b border-border glass-card sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow flex-shrink-0">
                <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent truncate">
                  CTEK ECU REMAPPING
                </h1>
                <span className="text-xs text-muted-foreground hidden sm:block">Professional Network</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/dashboard" className="nav-led-item text-sm hover:text-primary transition-colors">
                <span className="led-green"></span>
                Dashboard
              </Link>
              <Link href="/dyno" className="nav-led-item text-sm hover:text-primary transition-colors">
                <span className="led-purple"></span>
                Live Dyno System
              </Link>
              <Link href="/car-meets" className="nav-led-item text-sm hover:text-primary transition-colors">
                <span className="led-green"></span>
                Car Meet Locations
              </Link>
              <Link href="/auth/login" className="nav-led-item text-sm hover:text-primary transition-colors">
                <span className="led-red"></span>
                Sign In
              </Link>
              <Button asChild className="glass-button bg-gradient-to-r from-primary to-accent text-sm px-4 py-2">
                <Link href="/payment">Car Meet Access £10</Link>
              </Button>
            </nav>

            <button
              className="lg:hidden p-3 text-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/10 flex-shrink-0 touch-manipulation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
              <nav className="flex flex-col space-y-1">
                <Link
                  href="/dashboard"
                  className="nav-led-item flex items-center gap-3 py-4 px-4 rounded-xl hover:bg-primary/10 transition-all duration-200 text-base touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="led-green"></span>
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/dyno"
                  className="nav-led-item flex items-center gap-3 py-4 px-4 rounded-xl hover:bg-primary/10 transition-all duration-200 text-base touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="led-purple"></span>
                  <span>Live Dyno System</span>
                </Link>
                <Link
                  href="/car-meets"
                  className="nav-led-item flex items-center gap-3 py-4 px-4 rounded-xl hover:bg-primary/10 transition-all duration-200 text-base touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="led-green"></span>
                  <span>Car Meet Locations</span>
                </Link>
                <Link
                  href="/auth/login"
                  className="nav-led-item flex items-center gap-3 py-4 px-4 rounded-xl hover:bg-primary/10 transition-all duration-200 text-base touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="led-red"></span>
                  <span>Sign In</span>
                </Link>
                <div className="px-4 pt-3">
                  <Button
                    asChild
                    className="glass-button w-full bg-gradient-to-r from-primary to-accent text-base py-4 touch-manipulation"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/payment" className="flex items-center justify-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Car Meet Access - £10
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <section className="py-8 sm:py-12 md:py-20 px-3 sm:px-4 md:px-6 text-foreground relative">
          <div className="container mx-auto text-center max-w-7xl relative z-10">
            <div className="mb-6 sm:mb-8 md:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-2xl leading-tight px-2">
                Advanced ECU Remapping Platform
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 drop-shadow-lg max-w-5xl mx-auto leading-relaxed px-2">
                Professional diagnostic tools, live dyno testing, car meet locations, and premium ECU remapping
                services. Join the UK's most advanced automotive network.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {/* Live Dyno System */}
              <div className="lg:col-span-1 xl:col-span-2 glass-card p-4 sm:p-6 rounded-2xl border border-primary/30">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Gauge className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">Live Dyno System</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Real-time monitoring</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="led-green"></div>
                    <span className="text-xs text-green-400 font-medium">LIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="glass-card-grey p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-xs sm:text-sm text-muted-foreground">Power Output</span>
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">245</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">HP @ 6200 RPM</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent w-3/5"></div>
                    </div>
                  </div>

                  <div className="glass-card-grey p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-xs sm:text-sm text-muted-foreground">Torque Output</span>
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">320</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Nm @ 4500 RPM</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent to-secondary w-2/3"></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button className="flex-1 glass-button text-sm sm:text-base" asChild>
                    <Link href="/dyno">
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Full Dyno Suite
                    </Link>
                  </Button>
                </div>
              </div>

              {/* ECU Diagnostic Scanner */}
              <div className="glass-card p-6 rounded-2xl border border-accent/30">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu className="h-7 w-7 text-accent" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground">ECU Diagnostic Suite</h3>
                    <p className="text-sm text-muted-foreground">Advanced system monitoring</p>
                  </div>
                  <div className="led-purple ml-auto"></div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">System Status</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">OPTIMAL</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ECU Temp</span>
                      <span className="text-foreground font-medium">78°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel Press</span>
                      <span className="text-foreground font-medium">3.2 bar</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full glass-button" asChild>
                  <Link href="/diagnostics">
                    <Database className="h-4 w-4 mr-2" />
                    Advanced Diagnostics
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 md:mb-16">
              {/* Car Meet Locations */}
              <div className="glass-card p-6 rounded-2xl border border-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Car Meets</h3>
                  <div className="led-green ml-auto"></div>
                </div>
                <div className="h-24 bg-card rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">12</div>
                      <div className="text-xs text-muted-foreground">Secure Car Meets Near You</div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="absolute bottom-3 left-3 w-2 h-2 bg-primary rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent rounded-full"></div>
                </div>
                <Button className="w-full glass-button" size="sm" asChild>
                  <Link href="/car-meets">
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Events
                  </Link>
                </Button>
              </div>

              {/* Premium Access */}
              <div className="glass-card p-6 rounded-2xl border border-accent/30">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6 text-accent" />
                  <h3 className="text-lg font-bold text-foreground">Secure Access</h3>
                  <div className="led-purple ml-auto"></div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-accent mb-1">£10</div>
                  <div className="text-sm text-muted-foreground mb-2">Monthly Car Meet Access</div>
                  <div className="text-xs text-muted-foreground">
                    Secure car meet locations • Verified events • Safety features • Community access
                  </div>
                </div>
                <Button className="w-full glass-button bg-gradient-to-r from-accent to-primary" size="sm" asChild>
                  <Link href="/payment">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Get Car Meet Access
                  </Link>
                </Button>
              </div>

              {/* Live Sensors */}
              <div className="glass-card p-6 rounded-2xl border border-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <Thermometer className="h-6 w-6 text-secondary" />
                  <h3 className="text-lg font-bold text-foreground">Live Sensors</h3>
                  <div className="led-green ml-auto"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ECU Temperature</span>
                    <span className="text-secondary font-bold">78°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Battery Voltage</span>
                    <span className="text-green-400 font-bold">12.4V</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fuel Pressure</span>
                    <span className="text-blue-400 font-bold">3.2 bar</span>
                  </div>
                </div>
                <Button className="w-full glass-button mt-4" size="sm" asChild>
                  <Link href="/sensors">
                    <Activity className="h-4 w-4 mr-2" />
                    Monitor All
                  </Link>
                </Button>
              </div>

              {/* Professional Tools */}
              <div className="glass-card p-6 rounded-2xl border border-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <Wrench className="h-6 w-6 text-secondary" />
                  <h3 className="text-lg font-bold text-foreground">Pro Tools</h3>
                  <div className="led-purple ml-auto"></div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-muted-foreground">Stage 1-3 Maps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-muted-foreground">DPF/EGR Delete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-muted-foreground">Economy Tuning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-muted-foreground">Live Monitoring</span>
                  </div>
                </div>
                <Button className="w-full glass-button mt-4" size="sm" asChild>
                  <Link href="/tools">
                    <Wrench className="h-4 w-4 mr-2" />
                    Access Tools
                  </Link>
                </Button>
              </div>
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 justify-center mb-8 sm:mb-12 md:mb-16">
              <div className="glass-card p-4 md:p-8 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="relative mb-4 md:mb-6 overflow-hidden rounded-lg">
                  <div className="h-24 md:h-32 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Zap className="h-12 w-12 md:h-16 md:w-16 text-primary-foreground opacity-90" />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">Performance Remapping</h3>
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3 md:p-4 border border-primary/20">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Increase power and torque by 15-35% with our Stage 1, 2 & 3 performance maps.
                  </p>
                </div>
              </div>

              <div className="glass-card p-4 md:p-8 rounded-2xl border border-accent/20 hover:border-accent/40 transition-all duration-300">
                <div className="relative mb-4 md:mb-6 overflow-hidden rounded-lg">
                  <div className="h-24 md:h-32 bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                    <Settings className="h-12 w-12 md:h-16 md:w-16 text-accent-foreground opacity-90" />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">Economy Tuning</h3>
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3 md:p-4 border border-accent/20">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Achieve 15-25% fuel savings with our economy maps. Perfect for daily drivers.
                  </p>
                </div>
              </div>

              <div className="glass-card p-4 md:p-8 rounded-2xl border border-secondary/20 hover:border-secondary/40 transition-all duration-300">
                <div className="relative mb-4 md:mb-6 overflow-hidden rounded-lg">
                  <div className="h-24 md:h-32 bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 md:h-16 md:w-16 text-secondary-foreground opacity-90" />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">DPF & EGR Services</h3>
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3 md:p-4 border border-secondary/20">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Professional DPF removal, EGR deletion, and AdBlue delete services.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 justify-center mb-8 sm:mb-12 md:mb-16 px-2">
              <Button
                size="lg"
                className="glass-button text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-3 md:py-4 w-full sm:w-auto bg-gradient-to-r from-primary to-accent"
                asChild
              >
                <Link href="/dashboard" className="flex items-center justify-center gap-2 sm:gap-3">
                  Access Dashboard
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-3 md:py-4 border-2 border-primary/60 text-foreground hover:text-primary shadow-xl bg-transparent w-full sm:w-auto"
                asChild
              >
                <Link href="/dealers/register" className="flex items-center justify-center gap-2 sm:gap-3">
                  Join as Dealer
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 glass-card border-y border-border text-foreground relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md"></div>
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-lg leading-tight px-2">
              Ready to Unlock Your Car's Potential?
            </h3>
            <p className="text-lg md:text-2xl text-muted-foreground mb-8 md:mb-12 drop-shadow-md px-2">
              Join thousands of satisfied customers and certified ECU remapping professionals on the UK's most advanced
              automotive platform
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 md:mb-12">
              <Button
                size="lg"
                className="glass-button text-sm sm:text-base md:text-lg px-8 sm:px-10 md:px-12 py-3 md:py-4 bg-gradient-to-r from-primary to-accent w-full sm:w-auto"
                asChild
              >
                <Link href="/payment" className="flex items-center justify-center gap-2 sm:gap-3">
                  Get Car Meet Access - £10
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base md:text-lg px-8 sm:px-10 md:px-12 py-3 md:py-4 border-2 border-primary/40 text-foreground hover:text-primary shadow-xl bg-transparent w-full sm:w-auto"
                asChild
              >
                <Link href="/dealers/register" className="flex items-center justify-center gap-2 sm:gap-3">
                  Become ECU Specialist
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="glass-card border-t border-border py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12">
            <div className="sm:col-span-2">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-primary rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  CTEK ECU REMAPPING
                </span>
              </Link>
              <p className="text-muted-foreground text-base md:text-lg mb-4 sm:mb-6 drop-shadow-sm">
                The UK's premier ECU remapping network with live dyno systems, car meet locations, and professional
                tuning services.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3 sm:mb-4 md:mb-6 drop-shadow-sm text-sm sm:text-base">
                For Customers
              </h4>
              <ul className="space-y-1 sm:space-y-2 md:space-y-3 text-muted-foreground">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary transition-all duration-300 hover:drop-shadow-lg text-sm sm:text-base"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dyno"
                    className="hover:text-primary transition-all duration-300 hover:drop-shadow-lg text-sm sm:text-base"
                  >
                    Live Dyno System
                  </Link>
                </li>
                <li>
                  <Link
                    href="/car-meets"
                    className="hover:text-primary transition-all duration-300 hover:drop-shadow-lg text-sm sm:text-base"
                  >
                    Car Meet Locations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment"
                    className="hover:text-primary transition-all duration-300 hover:drop-shadow-lg text-sm sm:text-base"
                  >
                    Premium Access
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3 sm:mb-4 md:mb-6 drop-shadow-sm text-sm sm:text-base">
                For Dealers
              </h4>
              <ul className="space-y-1 sm:space-y-2 md:space-y-3 text-muted-foreground">
                <li>
                  <Link
                    href="/dealers/register"
                    className="hover:text-primary transition-all duration-300 hover:drop-shadow-lg text-sm sm:text-base"
                  >
                    Become a Dealer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary transition-all duration-300 hover:drop-shadow-lg text-sm sm:text-base"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/diagnostics"
                    className="hover:text-primary transition-all duration-300 hover:drop-shadow-lg text-sm sm:text-base"
                  >
                    Diagnostic Tools
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-4 sm:pt-6 md:pt-8 text-center">
            <p className="text-muted-foreground drop-shadow-sm text-xs sm:text-sm md:text-base px-2">
              &copy; 2024 CTEK ECU REMAPPING - Professional Automotive Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
