"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle } from "lucide-react"

interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

interface PermissionBoundaryProps {
  children: React.ReactNode
  permissions: Permission[]
  fallback?: React.ReactNode
  onError?: (error: string) => void
}

export function PermissionBoundary({ children, permissions, fallback, onError }: PermissionBoundaryProps) {
  const { user, loading } = useAuth()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkPermissions() {
      if (!user || loading) {
        setChecking(false)
        return
      }

      try {
        const permissionChecks = await Promise.all(
          permissions.map(async (permission) => {
            // Check role-based permissions
            if (permission.resource === "admin" && user.role !== "admin") {
              return false
            }
            if (permission.resource === "dealer" && !["dealer", "admin"].includes(user.role)) {
              return false
            }

            // Check resource-specific permissions
            if (permission.conditions) {
              // Example: Check if user owns the resource
              if (permission.conditions.owner && permission.conditions.resourceId) {
                const { data } = await supabase
                  .from(permission.resource)
                  .select("user_id")
                  .eq("id", permission.conditions.resourceId)
                  .single()

                return data?.user_id === user.id
              }
            }

            return true
          }),
        )

        const allPermissionsGranted = permissionChecks.every(Boolean)
        setHasPermission(allPermissionsGranted)

        if (!allPermissionsGranted && onError) {
          onError("Insufficient permissions")
        }
      } catch (error) {
        console.error("Permission check error:", error)
        setHasPermission(false)
        if (onError) {
          onError("Permission check failed")
        }
      } finally {
        setChecking(false)
      }
    }

    checkPermissions()
  }, [user, loading, permissions, onError, supabase])

  if (loading || checking) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-primary animate-spin" />
          <span className="text-glass-text">Checking permissions...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      fallback || (
        <Alert className="glass-alert-error">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Authentication required to access this resource.</AlertDescription>
        </Alert>
      )
    )
  }

  if (hasPermission === false) {
    return (
      fallback || (
        <Alert className="glass-alert-error">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access this resource.</AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
