"use client"

import type React from "react"

import { RoleGuard } from "./role-guard"

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  return (
    <RoleGuard allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
