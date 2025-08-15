import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-yellow-400/80">404</h1>
          <h2 className="text-3xl font-semibold text-white">Page Not Found</h2>
          <p className="text-lg text-slate-300 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3">
            <Link href="/">Return Home</Link>
          </Button>

          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/auth/login" className="text-slate-400 hover:text-yellow-400 transition-colors">
              Sign In
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/jobs" className="text-slate-400 hover:text-yellow-400 transition-colors">
              Browse Jobs
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/contact" className="text-slate-400 hover:text-yellow-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NotFound() {
  console.log("[v0] 404 Not Found page is rendering - this should not happen on homepage")

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-white mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <NotFoundContent />
    </Suspense>
  )
}
