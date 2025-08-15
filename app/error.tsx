"use client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error boundary caught:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center shadow-2xl">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              We're sorry, but an unexpected error occurred while processing your request. Our team has been notified
              and is working to fix this issue.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && error.message && (
            <details className="mt-6 text-left">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-400 bg-slate-900/50 p-3 rounded-lg overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
