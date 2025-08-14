"use client"

import { useEffect, useState } from "react"

interface SessionInfo {
  id: string
  expiresAt: string
}

export function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()

    // Set up periodic session validation (every 5 minutes)
    const interval = setInterval(checkSession, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/validate", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.valid) {
          setSession(data.session)

          // Auto-refresh session if it expires within 2 hours
          const expiresAt = new Date(data.session.expiresAt)
          const now = new Date()
          const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)

          if (hoursUntilExpiry < 2) {
            refreshSession()
          }
        } else {
          setSession(null)
        }
      } else {
        setSession(null)
      }
    } catch (error) {
      console.error("Session check error:", error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        // Session refreshed successfully, check again
        checkSession()
      } else {
        setSession(null)
      }
    } catch (error) {
      console.error("Session refresh error:", error)
      setSession(null)
    }
  }

  const clearSession = () => {
    setSession(null)
  }

  return {
    session,
    loading,
    refreshSession,
    clearSession,
    isValid: !!session,
  }
}
