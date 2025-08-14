"use client"

import type React from "react"

import { RoleGuard } from "./role-guard"

interface AuthenticatedOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthenticatedOnly({ children, fallback }: AuthenticatedOnlyProps) {
  return (
    <RoleGuard allowedRoles={["admin", "dealer", "customer"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
