"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, Suspense } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { EnhancedRedirectSystem } from "@/lib/enhanced-redirect"

interface RedirectContextType {
  isRedirecting: boolean
  redirectReason: string | null
  redirectHistory: Array<{ from: string; to: string; timestamp: number }>
  addRedirectRule: (rule: any) => void
  removeRedirectRule: (ruleId: string) => void
}

const RedirectContext = createContext<RedirectContextType | undefined>(undefined)

function RedirectHandler({ user, loading, pathname, router }: any) {
  const searchParams = useSearchParams()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [redirectReason, setRedirectReason] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return

    // Check for client-side redirects
    const redirectUrl = EnhancedRedirectSystem.getClientRedirectUrl(user, pathname)

    if (redirectUrl && redirectUrl !== pathname) {
      setIsRedirecting(true)
      setRedirectReason("Client-side redirect rule matched")
      router.push(redirectUrl)

      setTimeout(() => {
        setIsRedirecting(false)
        setRedirectReason(null)
      }, 1000)
    }
  }, [user, loading, pathname, router])

  // Handle redirect from URL params (when redirected from login)
  useEffect(() => {
    const redirectParam = searchParams.get("redirect")
    if (redirectParam && user) {
      if (EnhancedRedirectSystem.getClientRedirectUrl(user, redirectParam) === null) {
        router.push(redirectParam)
      }
    }
  }, [searchParams, user, router])

  return null
}

export function EnhancedRedirectProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [redirectHistory, setRedirectHistory] = useState<Array<{ from: string; to: string; timestamp: number }>>([])

  const addRedirectRule = (rule: any) => {
    EnhancedRedirectSystem.addRule(rule)
  }

  const removeRedirectRule = (ruleId: string) => {
    EnhancedRedirectSystem.removeRule(ruleId)
  }

  const value = {
    isRedirecting: false,
    redirectReason: null,
    redirectHistory,
    addRedirectRule,
    removeRedirectRule,
  }

  return (
    <RedirectContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <RedirectHandler user={user} loading={loading} pathname={pathname} router={router} />
      </Suspense>
    </RedirectContext.Provider>
  )
}

export function useEnhancedRedirect() {
  const context = useContext(RedirectContext)
  if (context === undefined) {
    throw new Error("useEnhancedRedirect must be used within an EnhancedRedirectProvider")
  }
  return context
}
