"use client"

import { IntegrationTest } from "@/components/test/integration-test"

export default function TestPage() {
  return (
    <div className="min-h-screen glass-background relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float-delayed"></div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Integration Test Suite</h1>
          <p className="text-xl text-glass-text">
            Comprehensive testing of live data integration and authentication system
          </p>
        </div>

        <IntegrationTest />
      </div>
    </div>
  )
}
