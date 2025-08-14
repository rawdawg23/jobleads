import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Shield, Users, Zap } from "lucide-react"
import Link from "next/link"
import { BMWLogo } from "@/components/animations/bmw-logo"
import { ECUWithLED } from "@/components/animations/ecu-led"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BMWLogo />
            <h1 className="text-2xl font-bold text-slate-900">CTEK JOB LEADS</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/jobs" className="text-slate-600 hover:text-slate-900">
              Browse Jobs
            </Link>
            <Link href="/dealers" className="text-slate-600 hover:text-slate-900">
              Find Dealers
            </Link>
            <Link href="/auth/login" className="text-slate-600 hover:text-slate-900">
              Login
            </Link>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center items-center mb-4">
            <ECUWithLED />
            <Badge variant="secondary" className="mx-4">
              Professional ECU Remapping Network
            </Badge>
            <ECUWithLED />
          </div>
          <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Connect with Certified
            <span className="text-blue-600"> ECU Specialists</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Post your ECU remapping job and get matched with verified dealers in your area. Professional service,
            competitive pricing, real-time tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" asChild>
              <Link href="/jobs/post">Post a Job - £5</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent" asChild>
              <Link href="/dealers/register">Become a Dealer - £100/month</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Why Choose CTEK JOB LEADS?</h3>
            <p className="text-slate-600 text-lg">Professional ECU remapping made simple and secure</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Local Dealers Only</CardTitle>
                <CardDescription>
                  Jobs are only shown to verified dealers within 30-60 miles of your location
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>DVLA Integration</CardTitle>
                <CardDescription>
                  Automatic vehicle data lookup using DVLA API for accurate ECU information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Live Tracking</CardTitle>
                <CardDescription>
                  Real-time updates when your dealer is traveling to you and estimated arrival times
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Direct Messaging</CardTitle>
                <CardDescription>
                  Secure messaging system between customers and dealers for job coordination
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <ECUWithLED />
                </div>
                <CardTitle>ECU Tool Compatibility</CardTitle>
                <CardDescription>
                  Match jobs with dealers who have the right ECU tools for your specific vehicle
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Bank transfer gateway managed by admin for secure job posting and dealer subscriptions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of satisfied customers and professional dealers on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
              <Link href="/jobs/post">Post Your First Job</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-slate-900 bg-transparent"
              asChild
            >
              <Link href="/dealers/register">Apply as Dealer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BMWLogo />
                <span className="font-bold text-slate-900">CTEK JOB LEADS</span>
              </div>
              <p className="text-slate-600">
                Professional ECU remapping network connecting customers with certified dealers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">For Customers</h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <Link href="/jobs/post" className="hover:text-slate-900">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-slate-900">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/dealers" className="hover:text-slate-900">
                    Find Dealers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">For Dealers</h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <Link href="/dealers/register" className="hover:text-slate-900">
                    Become a Dealer
                  </Link>
                </li>
                <li>
                  <Link href="/dealers/dashboard" className="hover:text-slate-900">
                    Dealer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="hover:text-slate-900">
                    Supported Tools
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <Link href="/help" className="hover:text-slate-900">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-slate-900">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-slate-900">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-slate-600">
            <p>&copy; 2024 CTEK JOB LEADS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
