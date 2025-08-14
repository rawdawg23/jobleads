import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Shield, Users, Zap, Car, CheckCircle, Star, ArrowRight, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Header */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">CTEK JOB LEADS</h1>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Browse Jobs
              </Link>
              <Link href="/dealers" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Find Dealers
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </Link>
              <Button asChild className="bg-gray-800 hover:bg-gray-900 text-white shadow-lg">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="flex justify-center items-center mb-6">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-800 border-0"
            >
              🚀 Professional ECU Remapping Network
            </Badge>
          </div>

          <h2 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Connecting You with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              {" "}
              Certified Experts
            </span>
          </h2>

          <p className="text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Post your ECU remapping jobs and find trusted dealers effortlessly. Join a community of certified
            professionals dedicated to quality and excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              className="text-lg px-10 py-4 bg-gray-800 hover:bg-gray-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              asChild
            >
              <Link href="/jobs/post" className="flex items-center gap-2">
                Get Started Today
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-4 border-2 border-gray-300 bg-transparent hover:bg-gray-50 transition-all duration-300"
              asChild
            >
              <Link href="/dealers/register" className="flex items-center gap-2">
                Become a Dealer
                <Users className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-gray-900">500+ Certified Dealers</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
              <Star className="h-6 w-6 text-yellow-500" />
              <span className="font-semibold text-gray-900">4.9/5 Customer Rating</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Fully Insured Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Why Choose CTEK JOB LEADS?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of ECU remapping with our advanced platform designed for professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 group">
              <CardHeader className="p-8">
                <div className="p-3 bg-blue-600 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Local Network Coverage</CardTitle>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  Connect with verified dealers within 30-60 miles of your location. Our intelligent matching system
                  ensures you find the right expertise nearby.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 group">
              <CardHeader className="p-8">
                <div className="p-3 bg-green-600 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">DVLA Integration</CardTitle>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  Automatic vehicle data lookup using official DVLA API ensures accurate ECU information and seamless
                  job matching.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 group">
              <CardHeader className="p-8">
                <div className="p-3 bg-orange-600 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Real-Time Tracking</CardTitle>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  Live updates when your dealer is traveling to you with estimated arrival times and job progress
                  notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 group">
              <CardHeader className="p-8">
                <div className="p-3 bg-purple-600 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Secure Communication</CardTitle>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  Built-in messaging system for secure communication between customers and dealers throughout the entire
                  process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 group">
              <CardHeader className="p-8">
                <div className="p-3 bg-indigo-600 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Tool Compatibility</CardTitle>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  Advanced matching system connects you with dealers who have the exact ECU tools required for your
                  specific vehicle.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100 group">
              <CardHeader className="p-8">
                <div className="p-3 bg-yellow-600 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Secure Payments</CardTitle>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  Bank transfer gateway managed by our admin team ensures secure transactions for both job postings and
                  dealer subscriptions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h3>
            <p className="text-xl text-gray-600">Simple steps to get your ECU remapped by professionals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="p-6 bg-white rounded-full w-24 h-24 mx-auto mb-6 shadow-lg">
                <div className="p-3 bg-gray-800 rounded-full">
                  <Car className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">1. Post Your Job</h4>
              <p className="text-gray-600 text-lg">
                Enter your vehicle details and requirements. Our DVLA integration automatically fills in technical
                specifications.
              </p>
            </div>

            <div className="text-center">
              <div className="p-6 bg-white rounded-full w-24 h-24 mx-auto mb-6 shadow-lg">
                <div className="p-3 bg-purple-600 rounded-full">
                  <Users className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">2. Get Matched</h4>
              <p className="text-gray-600 text-lg">
                Certified dealers in your area receive your job and submit competitive quotes with their expertise.
              </p>
            </div>

            <div className="text-center">
              <div className="p-6 bg-white rounded-full w-24 h-24 mx-auto mb-6 shadow-lg">
                <div className="p-3 bg-green-600 rounded-full">
                  <CheckCircle className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">3. Get It Done</h4>
              <p className="text-gray-600 text-lg">
                Choose your preferred dealer, track their arrival, and enjoy professional ECU remapping service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h3 className="text-5xl font-bold mb-8">Ready to Get Started?</h3>
          <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
            Join thousands of satisfied customers and professional dealers on our trusted platform
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 py-4 bg-white text-gray-900 hover:bg-gray-100 shadow-xl"
              asChild
            >
              <Link href="/jobs/post" className="flex items-center gap-2">
                Post Your First Job
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 bg-transparent shadow-xl"
              asChild
            >
              <Link href="/dealers/register" className="flex items-center gap-2">
                Apply as Dealer
                <Users className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-300" />
              <span className="text-gray-300">24/7 Customer Support</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-300" />
              <span className="text-gray-300">Instant Job Notifications</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200 py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">CTEK JOB LEADS</span>
              </Link>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                The UK's leading professional ECU remapping network, connecting customers with certified dealers
                nationwide.
              </p>
              <div className="flex gap-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Trusted Platform
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  500+ Dealers
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">For Customers</h4>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link href="/jobs/post" className="hover:text-gray-900 transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-gray-900 transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/dealers" className="hover:text-gray-900 transition-colors">
                    Find Dealers
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-gray-900 transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">For Dealers</h4>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link href="/dealers/register" className="hover:text-gray-900 transition-colors">
                    Become a Dealer
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
                    Dealer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="hover:text-gray-900 transition-colors">
                    Supported Tools
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-gray-900 transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-gray-900 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-gray-900 transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">&copy; 2024 CTEK JOB LEADS. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Made in the UK</span>
              <span>•</span>
              <span>Professional Service</span>
              <span>•</span>
              <span>Trusted by 1000+ Users</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
