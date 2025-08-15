"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Car, Menu, X } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Simple header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-green-400">CTEK ECU REMAPPING</h1>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-white hover:text-green-400">
                Dashboard
              </Link>
              <Link href="/dyno" className="text-white hover:text-green-400">
                Live Dyno
              </Link>
              <Link href="/car-meets" className="text-white hover:text-green-400">
                Car Meets
              </Link>
              <Link href="/auth/login" className="text-white hover:text-green-400">
                Sign In
              </Link>
              <Button className="bg-green-500 hover:bg-green-600" asChild>
                <Link href="/payment">Car Meet Access £10</Link>
              </Button>
            </nav>

            <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-700">
              <nav className="flex flex-col space-y-3">
                <Link href="/dashboard" className="text-white hover:text-green-400 py-2">
                  Dashboard
                </Link>
                <Link href="/dyno" className="text-white hover:text-green-400 py-2">
                  Live Dyno
                </Link>
                <Link href="/car-meets" className="text-white hover:text-green-400 py-2">
                  Car Meets
                </Link>
                <Link href="/auth/login" className="text-white hover:text-green-400 py-2">
                  Sign In
                </Link>
                <Button className="bg-green-500 hover:bg-green-600 mt-3" asChild>
                  <Link href="/payment">Car Meet Access £10</Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Simple main content */}
      <main className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 text-green-400">Advanced ECU Remapping Platform</h1>
          <p className="text-xl text-slate-300 mb-8">
            Professional diagnostic tools, live dyno testing, car meet locations, and premium ECU remapping services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-green-400 mb-3">Live Dyno System</h3>
              <p className="text-slate-300 mb-4">Real-time performance monitoring and testing</p>
              <Button className="bg-green-500 hover:bg-green-600" asChild>
                <Link href="/dyno">Access Dyno</Link>
              </Button>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-purple-400 mb-3">Car Meet Locations</h3>
              <p className="text-slate-300 mb-4">Secure car meet events near you</p>
              <Button className="bg-purple-500 hover:bg-purple-600" asChild>
                <Link href="/car-meets">Find Events</Link>
              </Button>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-orange-400 mb-3">Premium Access</h3>
              <p className="text-slate-300 mb-4">£10 monthly car meet access</p>
              <Button className="bg-orange-500 hover:bg-orange-600" asChild>
                <Link href="/payment">Get Access</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-500 hover:bg-green-600" asChild>
              <Link href="/dashboard">Access Dashboard</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-transparent"
              asChild
            >
              <Link href="/dealers/register">Join as Dealer</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-12 px-4">
        <div className="container mx-auto text-center">
          <p className="text-slate-400">
            © 2024 CTEK ECU REMAPPING - Professional Automotive Network. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
