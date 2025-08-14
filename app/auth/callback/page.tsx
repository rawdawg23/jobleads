"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")

  useEffect(() => {
    const handleCallback = async () => {
      if (code) {
        try {
          const supabase = createClient()
          await supabase.auth.exchangeCodeForSession(code)
        } catch (error) {
          console.error("Error exchanging code for session:", error)
        }
      }

      // Redirect to dashboard after processing
      router.push("/dashboard")
    }

    handleCallback()
  }, [code, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}
