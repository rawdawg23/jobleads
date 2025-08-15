"use client"

import { useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { redirectManager } from "@/lib/simple-redirect"

function RedirectLogic() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    const handleRedirect = async () => {
      // Handle auth callback
      if (pathname === "/auth/callback") {
        const redirectPath = redirectManager.handleAuthCallback(searchParams)
        router.replace(redirectPath)
        return
      }

      // Handle protected routes
      if (redirectManager.requiresAuth(pathname)) {
        if (!user) {
          const loginRedirect = redirectManager.getLoginRedirect(pathname)
          router.replace(loginRedirect)
          return
        }
      }

      // Handle authenticated users on auth pages
      if (user && pathname.startsWith("/auth/") && pathname !== "/auth/callback") {
        const rolePath = redirectManager.getRoleBasedPath(user.role)
        router.replace(rolePath)
        return
      }

      // Handle return URL after login
      if (user && pathname.startsWith("/profile") && searchParams.get("returnTo")) {
        const returnTo = searchParams.get("returnTo")
        if (returnTo && !returnTo.startsWith("/auth/")) {
          router.replace(returnTo)
          return
        }
      }
    }

    handleRedirect()
  }, [user, loading, pathname, searchParams, router])

  return null
}

export function SimpleRedirectHandler() {
  return (
    <Suspense fallback={null}>
      <RedirectLogic />
    </Suspense>
  )
}
