import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Shield, Users, Zap, Car, CheckCircle, Star, ArrowRight, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-secondary/15 to-primary/15 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <header className="border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CTEK JOB LEADS
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-foreground/80 hover:text-primary font-medium transition-colors">
                Browse Jobs
              </Link>
              <Link href="/dealers" className="text-foreground/80 hover:text-primary font-medium transition-colors">
                Find Dealers
              </Link>
              <Link href="/auth/login" className="text-foreground/80 hover:text-primary font-medium transition-colors">
                Sign In
              </Link>
              <Button asChild className="btn-primary">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <section className="py-24 px-6 relative">
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <div className="flex justify-center items-center mb-6">
            <Badge
              variant="secondary"
              className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-0 backdrop-blur-sm shadow-lg"
            >
              🚗 Professional ECU Remapping Network
            </Badge>
          </div>

          <h2 className="text-6xl font-bold text-foreground mb-8 leading-tight">
            UK's Leading
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {" "}
              ECU Remapping Platform
            </span>
          </h2>

          <p className="text-2xl text-foreground/70 mb-8 leading-relaxed max-w-4xl mx-auto">
            Connect with certified ECU remapping specialists across the UK. We specialize in performance tuning, economy
            mapping, DPF removal, EGR deletion, and diagnostic services for all vehicle makes and models.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
              <h3 className="text-xl font-bold text-foreground mb-3">🔧 What We Specialize In</h3>
              <ul className="text-left text-foreground/70 space-y-2">
                <li>• Stage 1, 2 & 3 Performance Remapping</li>
                <li>• Economy Tuning (15-25% fuel savings)</li>
                <li>• DPF & EGR Removal Services</li>
                <li>• AdBlue Delete & SCR Removal</li>
                <li>• Speed Limiter Removal</li>
                <li>• Diagnostic & Fault Code Clearing</li>
              </ul>
            </div>
            <div className="p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
              <h3 className="text-xl font-bold text-foreground mb-3">🚙 Vehicles We Cover</h3>
              <ul className="text-left text-foreground/70 space-y-2">
                <li>• Cars: BMW, Audi, VW, Mercedes, Ford</li>
                <li>• Vans: Transit, Sprinter, Crafter, Vivaro</li>
                <li>• Trucks: DAF, Scania, Volvo, MAN, Iveco</li>
                <li>• Agricultural: Tractors & Farm Equipment</li>
                <li>• Marine: Boat & Ship Engine Tuning</li>
                <li>• Motorcycles: All Makes & Models</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              className="text-lg px-10 py-4 btn-primary shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/jobs/post" className="flex items-center gap-2">
                Get Your ECU Remapped
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-4 border-2 border-primary/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-primary hover:text-primary transition-all duration-300 hover:scale-105 shadow-lg"
              asChild
            >
              <Link href="/dealers/register" className="flex items-center gap-2">
                Join as ECU Specialist
                <Users className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="font-semibold text-foreground">500+ Certified ECU Specialists</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Star className="h-6 w-6 text-amber-500" />
              <span className="font-semibold text-foreground">10,000+ Successful Remaps</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Shield className="h-6 w-6 text-secondary" />
              <span className="font-semibold text-foreground">Lifetime Software Warranty</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/40 backdrop-blur-sm relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-6">Professional ECU Remapping Services</h3>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Our network of certified specialists use the latest ECU tools and software to unlock your vehicle's true
              potential while maintaining reliability and emissions compliance where required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
                <img
                  src="/ecu-remapping-setup.png"
                  alt="ECU Remapping Process"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-bold text-lg">Performance Remapping</h4>
                </div>
              </div>
              <CardHeader className="p-6">
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Increase power and torque by 15-35% with our Stage 1, 2 & 3 performance maps. Custom tuning for track,
                  road, or mixed use applications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation overflow-hidden"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 relative overflow-hidden">
                <img
                  src="/improved-mpg-gauge.png"
                  alt="Economy Tuning"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-bold text-lg">Economy Tuning</h4>
                </div>
              </div>
              <CardHeader className="p-6">
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Achieve 15-25% fuel savings with our economy maps. Perfect for fleet vehicles, delivery vans, and
                  daily drivers seeking better MPG.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation overflow-hidden"
              style={{ animationDelay: "1s" }}
            >
              <div className="h-48 bg-gradient-to-br from-orange-500 to-red-500 relative overflow-hidden">
                <img
                  src="/dpf-removal.png"
                  alt="DPF Removal"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-bold text-lg">DPF & EGR Services</h4>
                </div>
              </div>
              <CardHeader className="p-6">
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Professional DPF removal, EGR deletion, and AdBlue delete services. Eliminate costly regeneration
                  issues and improve reliability.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-2xl font-bold text-foreground mb-4">🔧 Professional ECU Tools We Use</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Diagnostic Tools:</p>
                    <ul className="text-foreground/70 space-y-1">
                      <li>• Alientech KESS3</li>
                      <li>• CMD Flash</li>
                      <li>• MPPS V21</li>
                      <li>• Galletto 1260</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Software:</p>
                    <ul className="text-foreground/70 space-y-1">
                      <li>• WinOLS</li>
                      <li>• ECM Titanium</li>
                      <li>• Swiftec</li>
                      <li>• Custom Maps</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <img
                  src="/ecu-remapping-workbench.png"
                  alt="ECU Remapping Tools"
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-slate-50/50 to-slate-100/50 backdrop-blur-sm relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-6">How ECU Remapping Works</h3>
            <p className="text-xl text-foreground/70">Professional 3-step process for safe and reliable ECU tuning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="p-6 bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 mx-auto mb-6 shadow-2xl border border-white/20 group-hover:scale-110 transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg">
                  <Car className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">1. Vehicle Analysis</h4>
              <p className="text-foreground/70 text-lg">
                Our specialists connect to your vehicle's OBD port, read the original ECU file, and analyze your
                engine's current parameters and limitations.
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 mx-auto mb-6 shadow-2xl border border-white/20 group-hover:scale-110 transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-secondary to-primary rounded-full shadow-lg">
                  <Zap className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">2. Custom Mapping</h4>
              <p className="text-foreground/70 text-lg">
                We create a custom map optimized for your specific requirements - performance, economy, or mixed use -
                while maintaining engine safety margins.
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 mx-auto mb-6 shadow-2xl border border-white/20 group-hover:scale-110 transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">3. Flash & Test</h4>
              <p className="text-foreground/70 text-lg">
                The new map is flashed to your ECU, followed by comprehensive testing and road trials to ensure optimal
                performance and reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/40 backdrop-blur-sm relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-6">Why Choose CTEK JOB LEADS?</h3>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Experience the future of ECU remapping with our advanced platform designed for professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation">
              <CardHeader className="p-8">
                <div className="p-4 bg-gradient-to-br from-secondary/80 to-secondary rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-4">Local Network Coverage</CardTitle>
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Connect with verified dealers within 30-60 miles of your location. Our intelligent matching system
                  ensures you find the right expertise nearby.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation"
              style={{ animationDelay: "0.5s" }}
            >
              <CardHeader className="p-8">
                <div className="p-4 bg-gradient-to-br from-primary/80 to-primary rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-4">DVLA Integration</CardTitle>
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Automatic vehicle data lookup using official DVLA API ensures accurate ECU information and seamless
                  job matching.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation"
              style={{ animationDelay: "1s" }}
            >
              <CardHeader className="p-8">
                <div className="p-4 bg-gradient-to-br from-orange-500/80 to-orange-600/80 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-4">Real-Time Tracking</CardTitle>
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Live updates when your dealer is traveling to you with estimated arrival times and job progress
                  notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation"
              style={{ animationDelay: "1.5s" }}
            >
              <CardHeader className="p-8">
                <div className="p-4 bg-gradient-to-br from-primary/80 to-secondary/80 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-4">Secure Communication</CardTitle>
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Built-in messaging system for secure communication between customers and dealers throughout the entire
                  process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation"
              style={{ animationDelay: "2s" }}
            >
              <CardHeader className="p-8">
                <div className="p-4 bg-gradient-to-br from-secondary/80 to-primary/80 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-4">Tool Compatibility</CardTitle>
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Advanced matching system connects you with dealers who have the exact ECU tools required for your
                  specific vehicle.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/20 group hover:scale-105 float-animation"
              style={{ animationDelay: "2.5s" }}
            >
              <CardHeader className="p-8">
                <div className="p-4 bg-gradient-to-br from-amber-500/80 to-amber-600/80 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-4">Secure Payments</CardTitle>
                <CardDescription className="text-foreground/70 text-base leading-relaxed">
                  Bank transfer gateway managed by our admin team ensures secure transactions for both job postings and
                  dealer subscriptions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-br from-slate-50/50 to-slate-100/50 backdrop-blur-sm relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-6">How It Works</h3>
            <p className="text-xl text-foreground/70">Simple steps to get your ECU remapped by professionals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="p-6 bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 mx-auto mb-6 shadow-2xl border border-white/20 group-hover:scale-110 transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg">
                  <Car className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">1. Post Your Job</h4>
              <p className="text-foreground/70 text-lg">
                Enter your vehicle details and requirements. Our DVLA integration automatically fills in technical
                specifications.
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 mx-auto mb-6 shadow-2xl border border-white/20 group-hover:scale-110 transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-secondary to-primary rounded-full shadow-lg">
                  <Users className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">2. Get Matched</h4>
              <p className="text-foreground/70 text-lg">
                Certified dealers in your area receive your job and submit competitive quotes with their expertise.
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-white/80 backdrop-blur-xl rounded-full w-24 h-24 mx-auto mb-6 shadow-2xl border border-white/20 group-hover:scale-110 transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white mx-auto" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">3. Get It Done</h4>
              <p className="text-foreground/70 text-lg">
                Choose your preferred dealer, track their arrival, and enjoy professional ECU remapping service.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-3xl"></div>
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h3 className="text-5xl font-bold mb-8">Ready to Get Started?</h3>
          <p className="text-2xl text-white/80 mb-12 leading-relaxed">
            Join thousands of satisfied customers and professional dealers on our trusted platform
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 py-4 bg-white/90 backdrop-blur-sm text-primary hover:bg-white shadow-2xl hover:scale-105 transition-all duration-300"
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
              className="text-lg px-10 py-4 border-2 border-white/50 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm shadow-2xl hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link href="/dealers/register" className="flex items-center gap-2">
                Apply as Dealer
                <Users className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <Phone className="h-5 w-5 text-white/80" />
              <span className="text-white/80">24/7 Customer Support</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <Mail className="h-5 w-5 text-white/80" />
              <span className="text-white/80">Instant Job Notifications</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white/80 backdrop-blur-xl border-t border-white/20 py-16 px-6 shadow-2xl">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CTEK JOB LEADS
                </span>
              </Link>
              <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                The UK's leading professional ECU remapping network, connecting customers with certified dealers
                nationwide.
              </p>
              <div className="flex gap-4">
                <Badge
                  variant="secondary"
                  className="bg-green-100/80 backdrop-blur-sm text-green-700 border border-green-200/50"
                >
                  Trusted Platform
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100/80 backdrop-blur-sm text-blue-700 border border-blue-200/50"
                >
                  500+ Dealers
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 text-lg">For Customers</h4>
              <ul className="space-y-3 text-foreground/70">
                <li>
                  <Link href="/jobs/post" className="hover:text-primary transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-primary transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/dealers" className="hover:text-primary transition-colors">
                    Find Dealers
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 text-lg">For Dealers</h4>
              <ul className="space-y-3 text-foreground/70">
                <li>
                  <Link href="/dealers/register" className="hover:text-primary transition-colors">
                    Become a Dealer
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Dealer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="hover:text-primary transition-colors">
                    Supported Tools
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-foreground/70">
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/70 mb-4 md:mb-0">&copy; 2024 CTEK JOB LEADS. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-foreground/60">
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
