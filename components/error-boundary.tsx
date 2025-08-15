"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] ERROR BOUNDARY TRIGGERED - Homepage crashed with error:", error)
    console.error("[v0] Error details:", error.message)
    console.error("[v0] Error stack:", error.stack)
    console.error("[v0] Component stack:", errorInfo.componentStack)
    console.error("[v0] This is why you see the purple 'Something went wrong' screen")
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="glass-card p-8 w-full max-w-md text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
              <p className="text-white/70 mb-4">We're sorry, but something unexpected happened.</p>
              {this.state.error && (
                <details className="text-left mb-4 text-sm text-red-300 bg-red-900/20 p-3 rounded">
                  <summary className="cursor-pointer">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
                </details>
              )}
              <button onClick={() => window.location.reload()} className="btn-primary w-full">
                Reload Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
