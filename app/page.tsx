"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Car, ArrowRight, Zap, Settings, TrendingUp, Shield, Award, Clock, Menu, X } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative overflow-hidden">
      <header className="border-b border-white/20 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <Car className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                CTEK JOB LEADS
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/jobs"
                className="text-white/90 hover:text-yellow-300 font-medium transition-all duration-300 hover:drop-shadow-lg"
              >
                Browse Jobs
              </Link>
              <Link
                href="/dealers"
                className="text-white/90 hover:text-yellow-300 font-medium transition-all duration-300 hover:drop-shadow-lg"
              >
                Find Dealers
              </Link>
              <Link
                href="/auth/login"
                className="text-white/90 hover:text-yellow-300 font-medium transition-all duration-300 hover:drop-shadow-lg"
              >
                Sign In
              </Link>
              <Button
                asChild
                className="bg-gradient-to-r from-yellow-500/80 to-amber-600/80 hover:from-yellow-400/90 hover:to-amber-500/90 text-white shadow-xl hover:shadow-2xl transition-all"
              >
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </nav>

            <button
              className="md:hidden p-2 text-white/90 hover:text-yellow-300 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/jobs"
                  className="text-white/90 hover:text-yellow-300 font-medium transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/dealers"
                  className="text-white/90 hover:text-yellow-300 font-medium transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Dealers
                </Link>
                <Link
                  href="/auth/login"
                  className="text-white/90 hover:text-yellow-300 font-medium transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  className="bg-gradient-to-r from-yellow-500/80 to-amber-600/80 hover:from-yellow-400/90 hover:to-amber-500/90 text-white shadow-xl mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <section className="py-16 md:py-32 px-4 md:px-6 text-white relative">
          <div className="container mx-auto text-center max-w-6xl relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              Professional ECU Remapping Network
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 md:mb-12 drop-shadow-lg max-w-4xl mx-auto leading-relaxed px-2">
              Connect with certified ECU remapping specialists across the UK. Get expert engine tuning, performance
              optimization, and fuel economy improvements from trusted professionals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12 md:mb-16 items-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 md:p-8 rounded-2xl border border-white/20 hover:border-yellow-400/40 transition-all">
                <img
                  src="/ecu-remapping-technician.png"
                  alt="Professional ECU Remapping Service"
                  className="w-full h-48 md:h-64 object-cover rounded-xl mb-4 md:mb-6 shadow-2xl"
                />
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-yellow-300">Expert ECU Tuning</h3>
                <p className="text-white/80 text-base md:text-lg">
                  Our certified specialists use the latest diagnostic equipment and mapping software to optimize your
                  vehicle's performance safely and reliably.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 md:p-8 rounded-2xl border border-white/20 hover:border-yellow-400/40 transition-all">
                <img
                  src="/car-dyno-results.png"
                  alt="Performance Testing and Results"
                  className="w-full h-48 md:h-64 object-cover rounded-xl mb-4 md:mb-6 shadow-2xl"
                />
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-yellow-300">Proven Results</h3>
                <p className="text-white/80 text-base md:text-lg">
                  See real performance gains with dyno-tested results. Our remaps deliver measurable improvements in
                  power, torque, and fuel efficiency.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
              <div className="bg-white/10 backdrop-blur-sm p-4 md:p-8 rounded-2xl border border-white/20 hover:border-yellow-400/40 transition-all duration-300 group">
                <div className="relative mb-4 md:mb-6 overflow-hidden rounded-lg">
                  <div className="h-24 md:h-32 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Zap className="h-12 w-12 md:h-16 md:w-16 text-white opacity-90" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">Performance Remapping</h3>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
                  <p className="text-white/90 text-sm leading-relaxed">
                    Increase power and torque by 15-35% with our Stage 1, 2 & 3 performance maps. Professional ECU
                    optimization for maximum performance gains.
                  </p>
                  <ul className="mt-2 md:mt-3 text-xs text-white/70 space-y-1">
                    <li>• Stage 1: +15-25% power increase</li>
                    <li>• Stage 2: +20-30% performance boost</li>
                    <li>• Stage 3: +25-35% maximum gains</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 md:p-8 rounded-2xl border border-white/20 hover:border-yellow-400/40 transition-all duration-300 group">
                <div className="relative mb-4 md:mb-6 overflow-hidden rounded-lg">
                  <div className="h-24 md:h-32 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Settings className="h-12 w-12 md:h-16 md:w-16 text-white opacity-90" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">Economy Tuning</h3>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
                  <p className="text-white/90 text-sm leading-relaxed">
                    Achieve 15-25% fuel savings with our economy maps. Perfect for fleet vehicles and daily drivers
                    seeking better MPG.
                  </p>
                  <ul className="mt-2 md:mt-3 text-xs text-white/70 space-y-1">
                    <li>• Up to 25% better fuel economy</li>
                    <li>• Optimized for daily driving</li>
                    <li>• Fleet vehicle specialists</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 md:p-8 rounded-2xl border border-white/20 hover:border-yellow-400/40 transition-all duration-300 group">
                <div className="relative mb-4 md:mb-6 overflow-hidden rounded-lg">
                  <div className="h-24 md:h-32 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 md:h-16 md:w-16 text-white opacity-90" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-2">
                    <h3 className="text-lg md:text-xl font-bold text-white">DPF & EGR Services</h3>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20">
                  <p className="text-white/90 text-sm leading-relaxed">
                    Professional DPF removal, EGR deletion, and AdBlue delete services. Resolve diesel issues
                    permanently with expert solutions.
                  </p>
                  <ul className="mt-2 md:mt-3 text-xs text-white/70 space-y-1">
                    <li>• DPF removal & mapping</li>
                    <li>• EGR valve solutions</li>
                    <li>• AdBlue system removal</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 justify-center mb-8 md:mb-12">
              <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-white/10">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-white text-sm md:text-base">Fully Insured</div>
                  <div className="text-xs md:text-sm text-white/70">£2M Public Liability</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-white/10">
                <Award className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-white text-sm md:text-base">Certified Specialists</div>
                  <div className="text-xs md:text-sm text-white/70">IMI Qualified Technicians</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-white/10">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-white text-sm md:text-base">Same Day Service</div>
                  <div className="text-xs md:text-sm text-white/70">Mobile & Workshop Available</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-8 md:mb-12">
              <Button
                size="lg"
                className="text-base md:text-lg px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-yellow-500/80 to-amber-600/80 hover:from-yellow-400/90 hover:to-amber-500/90 text-white shadow-2xl w-full sm:w-auto"
                asChild
              >
                <Link href="/jobs/post" className="flex items-center justify-center gap-3">
                  Find ECU Specialists
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base md:text-lg px-8 md:px-12 py-3 md:py-4 border-2 border-yellow-400/60 text-white hover:text-yellow-200 shadow-xl bg-transparent w-full sm:w-auto"
                asChild
              >
                <Link href="/dealers/register" className="flex items-center justify-center gap-3">
                  Join as Dealer
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 md:px-6 bg-white/5 backdrop-blur-sm border-y border-white/20 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 backdrop-blur-md"></div>
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <div className="mb-8 md:mb-12">
              <img
                src="/professional-workshop.png"
                alt="Professional ECU Remapping Workshop"
                className="w-full h-32 md:h-48 object-cover rounded-2xl shadow-2xl mx-auto mb-6 md:mb-8"
              />
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent drop-shadow-lg leading-tight">
              Ready to Unlock Your Car's Potential?
            </h3>
            <p className="text-lg md:text-2xl text-white/90 mb-8 md:mb-12 drop-shadow-md px-2">
              Join thousands of satisfied customers and certified ECU remapping professionals on the UK's most trusted
              automotive tuning platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-8 md:mb-12">
              <Button
                size="lg"
                variant="secondary"
                className="text-base md:text-lg px-8 md:px-10 py-3 md:py-4 text-white hover:text-yellow-200 shadow-xl w-full sm:w-auto"
                asChild
              >
                <Link href="/jobs/post" className="flex items-center justify-center gap-2">
                  Get Your Car Remapped
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base md:text-lg px-8 md:px-10 py-3 md:py-4 border-2 border-yellow-400/40 text-white hover:text-yellow-200 shadow-xl bg-transparent w-full sm:w-auto"
                asChild
              >
                <Link href="/dealers/register" className="flex items-center justify-center gap-2">
                  Become ECU Specialist
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black/20 backdrop-blur-md border-t border-white/20 py-12 md:py-16 px-4 md:px-6 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <Car className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                  CTEK JOB LEADS
                </span>
              </Link>
              <p className="text-white/80 text-base md:text-lg mb-4 md:mb-6 drop-shadow-sm">
                The UK's premier ECU remapping network, connecting vehicle owners with certified tuning specialists.
                Professional engine optimization, performance tuning, and fuel economy solutions nationwide.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 md:mb-6 drop-shadow-sm">For Customers</h4>
              <ul className="space-y-2 md:space-y-3 text-white/80">
                <li>
                  <Link
                    href="/jobs/post"
                    className="hover:text-yellow-300 transition-all duration-300 hover:drop-shadow-lg text-sm md:text-base"
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs"
                    className="hover:text-yellow-300 transition-all duration-300 hover:drop-shadow-lg text-sm md:text-base"
                  >
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dealers"
                    className="hover:text-yellow-300 transition-all duration-300 hover:drop-shadow-lg text-sm md:text-base"
                  >
                    Find Dealers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 md:mb-6 drop-shadow-sm">For Dealers</h4>
              <ul className="space-y-2 md:space-y-3 text-white/80">
                <li>
                  <Link
                    href="/dealers/register"
                    className="hover:text-yellow-300 transition-all duration-300 hover:drop-shadow-lg text-sm md:text-base"
                  >
                    Become a Dealer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-yellow-300 transition-all duration-300 hover:drop-shadow-lg text-sm md:text-base"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-yellow-300 transition-all duration-300 hover:drop-shadow-lg text-sm md:text-base"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 md:pt-8 text-center">
            <p className="text-white/80 drop-shadow-sm text-sm md:text-base">
              &copy; 2024 CTEK JOB LEADS - Professional ECU Remapping Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
