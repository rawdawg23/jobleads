"use client"

import { useEffect } from "react"
import { useSession } from "@/hooks/use-session"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function SessionMonitor() {
  const { session, loading } = useSession()
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If we have a user but no valid session, sign out
    if (!loading && user && !session) {
      console.warn("Invalid session detected, signing out user")
      signOut()
    }
  }, [session, loading, user, signOut])

  useEffect(() => {
    // Handle session expiration warnings
    if (session) {
      const expiresAt = new Date(session.expiresAt)
      const now = new Date()
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60)

      // Show warning 30 minutes before expiration
      if (minutesUntilExpiry > 0 && minutesUntilExpiry < 30) {
        console.warn(`Session expires in ${Math.round(minutesUntilExpiry)} minutes`)
      }
    }
  }, [session])

  // This component doesn't render anything, it just monitors sessions
  return null
}
