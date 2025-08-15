"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CreditCard, Shield, CheckCircle, ArrowLeft, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const clientSecret = searchParams.get("client_secret")

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })

  const handlePayment = async () => {
    if (!clientSecret) {
      setPaymentStatus("error")
      return
    }

    setIsProcessing(true)
    setPaymentStatus("processing")

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock successful payment
      setPaymentStatus("success")

      // Redirect to success page after delay
      setTimeout(() => {
        window.location.href = "/payment/success"
      }, 2000)
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("error")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card border-destructive/30 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Payment Error
            </CardTitle>
            <CardDescription>Invalid payment session. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/payment">Return to Payment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass-card sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/payment">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Payment
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg animate-pulse-glow">
                  <CreditCard className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Secure Checkout
                  </h1>
                  <p className="text-sm text-muted-foreground">Complete your premium access purchase</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">SSL Secured</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {paymentStatus === "success" ? (
            <Card className="glass-card border-green-500/30">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-500">Payment Successful!</CardTitle>
                <CardDescription>Your premium access has been activated</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">Redirecting you to the dashboard...</p>
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Details
                </CardTitle>
                <CardDescription>Enter your card information to complete the purchase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Card Number</label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="glass-card border-primary/30"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                      <Input
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="glass-card border-primary/30"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">CVC</label>
                      <Input
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="glass-card border-primary/30"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Cardholder Name</label>
                    <Input
                      placeholder="John Smith"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="glass-card border-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 glass-card-grey rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Your payment information is encrypted and secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Protected by Stripe's advanced security</span>
                  </div>
                </div>

                <Button
                  className="w-full glass-button bg-gradient-to-r from-primary to-accent text-lg py-6"
                  onClick={handlePayment}
                  disabled={isProcessing || paymentStatus === "processing"}
                >
                  {paymentStatus === "processing" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Pay £12.00 (inc. VAT)
                    </div>
                  )}
                </Button>

                {paymentStatus === "error" && (
                  <div className="p-4 bg-destructive/20 border border-destructive/30 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Payment failed. Please try again.</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
