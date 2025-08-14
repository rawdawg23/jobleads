import { requireRole } from "@/lib/auth-utils"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export async function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  try {
    await requireRole(allowedRoles)
    return <>{children}</>
  } catch {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    )
  }
}
