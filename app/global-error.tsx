"use client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Global error boundary caught:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center shadow-2xl">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">ECU Remap Jobs</h1>
                <h2 className="text-lg font-semibold text-slate-300 mb-3">Application Error</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  A critical error occurred in the ECU remapping platform. Please try refreshing the page or contact
                  support if the problem persists.
                </p>
              </div>

              <Button
                onClick={reset}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
