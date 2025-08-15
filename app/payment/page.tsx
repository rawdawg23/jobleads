"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Activity,
  MapPin,
  Database,
  Award,
  Clock,
  Users,
  Star,
  Lock,
} from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface PaymentPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  features: string[]
  popular?: boolean
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    name: "",
    phone: "",
  })

  const plans: PaymentPlan[] = [
    {
      id: "premium_monthly",
      name: "Premium Access",
      price: 10,
      currency: "GBP",
      interval: "month",
      features: [
        "Live Dyno System Access",
        "Advanced ECU Diagnostics",
        "Car Meet Location Posting",
        "Premium Support",
        "Data Export & Reports",
        "Priority Event Booking",
        "Professional Tools Suite",
        "Mobile App Access",
      ],
      popular: true,
    },
    {
      id: "professional_monthly",
      name: "Professional",
      price: 25,
      currency: "GBP",
      interval: "month",
      features: [
        "Everything in Premium",
        "Advanced Analytics Dashboard",
        "Custom ECU Map Library",
        "White-label Solutions",
        "API Access",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Priority Technical Support",
      ],
    },
  ]

  useEffect(() => {
    // Auto-select the premium plan
    setSelectedPlan(plans[0])
  }, [])

  const handlePayment = async () => {
    if (!selectedPlan) return

    setIsProcessing(true)

    try {
      // Create payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: selectedPlan.price * 100, // Convert to pence
          currency: selectedPlan.currency.toLowerCase(),
          customerInfo,
        }),
      })

      const { clientSecret, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Checkout or handle client-side payment
      window.location.href = `/payment/checkout?client_secret=${clientSecret}`
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
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
                  <CreditCard className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Premium Access
                  </h1>
                  <p className="text-sm text-muted-foreground">Unlock advanced ECU remapping tools</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Secure Payment</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Select the perfect plan for your ECU remapping and automotive needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`glass-card cursor-pointer transition-all duration-300 ${
                    selectedPlan?.id === plan.id
                      ? "border-primary/50 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  } ${plan.popular ? "relative" : ""}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">£{plan.price}</div>
                        <div className="text-sm text-muted-foreground">per {plan.interval}</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full mt-6 glass-button ${
                        selectedPlan?.id === plan.id
                          ? "bg-gradient-to-r from-primary to-accent"
                          : "bg-transparent border-primary/30"
                      }`}
                      variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                    >
                      {selectedPlan?.id === plan.id ? "Selected" : "Select Plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Customer Information */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Customer Information
                </CardTitle>
                <CardDescription>We'll use this information for your account and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      placeholder="John Smith"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="glass-card border-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="glass-card border-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number (Optional)</label>
                  <Input
                    type="tel"
                    placeholder="+44 7700 900123"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="glass-card border-primary/30"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="glass-card border-accent/30 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{selectedPlan.name}</span>
                      <span className="font-bold text-accent">£{selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Billing cycle</span>
                      <span>Monthly</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>VAT (20%)</span>
                      <span>£{(selectedPlan.price * 0.2).toFixed(2)}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">£{(selectedPlan.price * 1.2).toFixed(2)}</span>
                    </div>

                    <div className="space-y-3 pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Secure payment with Stripe</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4 text-green-500" />
                        <span>256-bit SSL encryption</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Cancel anytime</span>
                      </div>
                    </div>

                    <Button
                      className="w-full glass-button bg-gradient-to-r from-primary to-accent text-lg py-6"
                      onClick={handlePayment}
                      disabled={isProcessing || !customerInfo.email || !customerInfo.name}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Complete Payment
                        </div>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Features Highlight */}
            <Card className="glass-card border-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-secondary" />
                  What You Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-sm">Live dyno system access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-accent" />
                  <span className="text-sm">Advanced diagnostics</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-secondary" />
                  <span className="text-sm">Car meet locations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm">Professional tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-accent" />
                  <span className="text-sm">24/7 platform access</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 glass-card p-4 rounded-xl border border-primary/10">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="text-left">
                <div className="font-bold text-foreground">Secure Payments</div>
                <div className="text-sm text-muted-foreground">PCI DSS Compliant</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 glass-card p-4 rounded-xl border border-accent/10">
              <Award className="h-8 w-8 text-accent" />
              <div className="text-left">
                <div className="font-bold text-foreground">Trusted Platform</div>
                <div className="text-sm text-muted-foreground">1000+ Happy Customers</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 glass-card p-4 rounded-xl border border-secondary/10">
              <Clock className="h-8 w-8 text-secondary" />
              <div className="text-left">
                <div className="font-bold text-foreground">Instant Access</div>
                <div className="text-sm text-muted-foreground">Activate Immediately</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
