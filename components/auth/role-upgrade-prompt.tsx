"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Star, ArrowRight, Check } from "lucide-react"
import Link from "next/link"

interface RoleUpgradePromptProps {
  targetRole: "dealer" | "admin"
  feature: string
  onUpgrade?: () => void
}

export function RoleUpgradePrompt({ targetRole, feature, onUpgrade }: RoleUpgradePromptProps) {
  const { user } = useAuth()
  const [isUpgrading, setIsUpgrading] = useState(false)

  if (!user || user.role === targetRole || user.role === "admin") {
    return null
  }

  const roleFeatures = {
    dealer: [
      "Apply for ECU remapping jobs",
      "Build your professional profile",
      "Direct messaging with customers",
      "Payment processing integration",
      "Performance analytics dashboard",
    ],
    admin: [
      "Full platform management",
      "User and dealer oversight",
      "Advanced analytics and reporting",
      "Payment and subscription management",
      "System configuration access",
    ],
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      if (onUpgrade) {
        onUpgrade()
      }
    } catch (error) {
      console.error("Upgrade error:", error)
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="relative">
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-float"></div>

      <Card className="glass-card max-w-md mx-auto shadow-2xl relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 glass-avatar mb-4">
            {targetRole === "dealer" ? (
              <Star className="h-8 w-8 text-primary" />
            ) : (
              <Crown className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Upgrade to {targetRole === "dealer" ? "Dealer" : "Admin"}
          </CardTitle>
          <CardDescription className="text-glass-text">Unlock {feature} and more advanced features</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="glass-alert-info">
            <AlertDescription className="text-blue-300">
              You need {targetRole} access to use {feature}.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="text-white font-medium">What you'll get:</h4>
            <ul className="space-y-2">
              {roleFeatures[targetRole].map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-glass-text">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            {targetRole === "dealer" ? (
              <Button asChild className="glass-button-primary" disabled={isUpgrading}>
                <Link href="/dealer/register">
                  {isUpgrading ? "Processing..." : "Become a Dealer"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button onClick={handleUpgrade} className="glass-button-primary" disabled={isUpgrading}>
                {isUpgrading ? "Processing..." : "Request Admin Access"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            <Button variant="outline" className="glass-button-secondary bg-transparent">
              <Link href="/dashboard">Maybe Later</Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-glass-border">
            <Badge className="glass-badge">
              Current Role: <span className="capitalize ml-1">{user.role}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
