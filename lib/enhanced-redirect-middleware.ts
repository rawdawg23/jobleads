import type { NextRequest } from "next/server"
import { EnhancedRedirectSystem } from "./enhanced-redirect"
import { updateSession } from "@/lib/supabase/middleware"

export async function enhancedMiddleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // For API routes, just handle session without redirects
    return await updateSession(request)
  }

  // First, handle Supabase session management
  const sessionResponse = await updateSession(request)

  // If session middleware already redirected, return that response
  if (sessionResponse.status === 307 || sessionResponse.status === 308) {
    return sessionResponse
  }

  // Process enhanced redirects
  const redirectResponse = await EnhancedRedirectSystem.processRedirect(request)

  if (redirectResponse) {
    return redirectResponse
  }

  // No redirect needed, continue with session response
  return sessionResponse
}
