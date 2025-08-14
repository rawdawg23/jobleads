"use client"

import type React from "react"

import { RoleGuard } from "./role-guard"

interface DealerOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function DealerOnly({ children, fallback }: DealerOnlyProps) {
  return (
    <RoleGuard allowedRoles={["dealer"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
