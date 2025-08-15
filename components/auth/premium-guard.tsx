"use client"

import type React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Lock } from "lucide-react"

interface PremiumGuardProps {
  children: React.ReactNode
  feature?: string
  showUpgrade?: boolean
}

export function PremiumGuard({ children, feature = "this feature", showUpgrade = true }: PremiumGuardProps) {
  const { user, loading, hasPremiumAccess } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="glass-card-dark border-purple-500/20">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <CardTitle className="text-white">Sign In Required</CardTitle>
          <CardDescription>Please sign in to access {feature}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/login">
            <Button className="bg-purple-600 hover:bg-purple-700">Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (!hasPremiumAccess && showUpgrade) {
    return (
      <Card className="glass-card-dark border-orange-500/20">
        <CardHeader className="text-center">
          <Crown className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <CardTitle className="text-white">Premium Access Required</CardTitle>
          <CardDescription>
            Upgrade to premium to access {feature} and unlock advanced ECU diagnostic tools
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-gray-300">
            <p>✓ Live Dyno System Access</p>
            <p>✓ Advanced Diagnostic Tools</p>
            <p>✓ Car Meet Location Posting</p>
            <p>✓ Priority Support</p>
          </div>
          <Link href="/payment">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium - £10
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (!hasPremiumAccess) {
    return null
  }

  return <>{children}</>
}
