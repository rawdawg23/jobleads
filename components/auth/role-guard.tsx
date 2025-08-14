"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
  showForGuests?: boolean
}

export function RoleGuard({ children, allowedRoles, fallback = null, showForGuests = false }: RoleGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  // Show for guests if specified and no user
  if (!user && showForGuests) {
    return <>{children}</>
  }

  // Don't show if no user and not for guests
  if (!user) {
    return <>{fallback}</>
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
