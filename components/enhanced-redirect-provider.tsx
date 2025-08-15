"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
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

export function EnhancedRedirectProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [redirectReason, setRedirectReason] = useState<string | null>(null)
  const [redirectHistory, setRedirectHistory] = useState<Array<{ from: string; to: string; timestamp: number }>>([])

  useEffect(() => {
    if (loading) return

    // Check for client-side redirects
    const redirectUrl = EnhancedRedirectSystem.getClientRedirectUrl(user, pathname)

    if (redirectUrl && redirectUrl !== pathname) {
      setIsRedirecting(true)
      setRedirectReason("Client-side redirect rule matched")

      // Add to history
      const historyEntry = {
        from: pathname,
        to: redirectUrl,
        timestamp: Date.now(),
      }
      setRedirectHistory((prev) => [...prev.slice(-9), historyEntry])

      // Perform redirect
      router.push(redirectUrl)

      // Reset redirecting state after a delay
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
      // Validate and perform redirect
      if (EnhancedRedirectSystem.getClientRedirectUrl(user, redirectParam) === null) {
        router.push(redirectParam)
      }
    }
  }, [searchParams, user, router])

  const addRedirectRule = (rule: any) => {
    EnhancedRedirectSystem.addRule(rule)
  }

  const removeRedirectRule = (ruleId: string) => {
    EnhancedRedirectSystem.removeRule(ruleId)
  }

  const value = {
    isRedirecting,
    redirectReason,
    redirectHistory,
    addRedirectRule,
    removeRedirectRule,
  }

  return (
    <RedirectContext.Provider value={value}>
      {children}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium">Redirecting...</p>
                {redirectReason && <p className="text-sm text-gray-600">{redirectReason}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
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
