"use client"

import type React from "react"

import { RoleGuard } from "./role-guard"

interface CustomerOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function CustomerOnly({ children, fallback }: CustomerOnlyProps) {
  return (
    <RoleGuard allowedRoles={["customer"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
