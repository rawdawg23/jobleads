"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Lock, UserX, ArrowRight } from "lucide-react"
import Link from "next/link"

interface EnhancedRoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("customer" | "dealer" | "admin")[]
  fallback?: React.ReactNode
  showForGuests?: boolean
  requireVerification?: boolean
  customMessage?: string
  redirectPath?: string
}

export function EnhancedRoleGuard({
  children,
  allowedRoles,
  fallback,
  showForGuests = false,
  requireVerification = false,
  customMessage,
  redirectPath,
}: EnhancedRoleGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="glass-card p-8 animate-pulse">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 bg-primary/30 rounded-full animate-bounce"></div>
          <div className="w-6 h-6 bg-secondary/30 rounded-full animate-bounce delay-100"></div>
          <div className="w-6 h-6 bg-accent/30 rounded-full animate-bounce delay-200"></div>
        </div>
        <p className="text-center text-glass-text mt-4">Verifying permissions...</p>
      </div>
    )
  }

  // Show for guests if specified and no user
  if (!user && showForGuests) {
    return <>{children}</>
  }

  if (!user) {
    return (
      fallback || (
        <div className="glass-card p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 glass-avatar">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
            <p className="text-glass-text">{customMessage || "You need to sign in to access this content."}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="glass-button-primary">
              <Link href="/auth/login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="glass-button-secondary bg-transparent">
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
      )
    )
  }

  if (!allowedRoles.includes(user.role)) {
    const getRoleDisplayName = (role: string) => {
      switch (role) {
        case "customer":
          return "Customer"
        case "dealer":
          return "Certified Dealer"
        case "admin":
          return "Administrator"
        default:
          return role
      }
    }

    return (
      fallback || (
        <div className="glass-card p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 glass-avatar">
            <UserX className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Access Restricted</h3>
            <p className="text-glass-text mb-4">
              {customMessage || "You don't have the required permissions to access this content."}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-glass-text">
                <span className="text-white font-medium">Your role:</span> {getRoleDisplayName(user.role)}
              </p>
              <p className="text-sm text-glass-text">
                <span className="text-white font-medium">Required roles:</span>{" "}
                {allowedRoles.map(getRoleDisplayName).join(", ")}
              </p>
            </div>
          </div>
          {redirectPath && (
            <Button asChild className="glass-button-secondary">
              <Link href={redirectPath}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )
    )
  }

  return <>{children}</>
}
