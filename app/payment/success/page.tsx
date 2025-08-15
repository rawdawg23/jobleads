"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Activity, MapPin, Database, Award, Download, Mail } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Track successful payment
    console.log("Payment completed successfully")
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Message */}
        <Card className="glass-card border-green-500/30 text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-500 mb-2">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">Welcome to CTEK ECU Remapping Premium Access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 glass-card-grey rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Transaction ID</div>
              <div className="font-mono text-primary">TXN-{Date.now()}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">£10.00</div>
                <div className="text-sm text-muted-foreground">Monthly Subscription</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">Active</div>
                <div className="text-sm text-muted-foreground">Account Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Premium Features Are Now Active
            </CardTitle>
            <CardDescription>Start exploring your new capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 glass-card-grey rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-medium">Live Dyno System</div>
                  <div className="text-sm text-muted-foreground">Real-time performance testing</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 glass-card-grey rounded-lg">
                <Database className="h-6 w-6 text-accent" />
                <div>
                  <div className="font-medium">Advanced Diagnostics</div>
                  <div className="text-sm text-muted-foreground">Professional ECU analysis</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 glass-card-grey rounded-lg">
                <MapPin className="h-6 w-6 text-secondary" />
                <div>
                  <div className="font-medium">Car Meet Locations</div>
                  <div className="text-sm text-muted-foreground">Find and create events</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 glass-card-grey rounded-lg">
                <Award className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-medium">Professional Tools</div>
                  <div className="text-sm text-muted-foreground">Complete ECU suite</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 glass-button bg-gradient-to-r from-primary to-accent">
                <Link href="/dashboard">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 glass-button bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="glass-card border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our support team is here to help you get the most out of your premium access.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="glass-button bg-transparent">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="glass-button bg-transparent">
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
