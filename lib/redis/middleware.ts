import { NextResponse, type NextRequest } from "next/server"
import { SessionModel } from "./models"
import { isRedisConfigured } from "./client"

export async function updateSession(request: NextRequest) {
  const res = NextResponse.next()
  const pathname = request.nextUrl.pathname
  const requestId = Math.random().toString(36).substring(7)

  // Debug logging
  console.log(`[Middleware:${requestId}] Processing: ${pathname}`)

  // Check if Redis is configured
  if (!isRedisConfigured) {
    console.warn(`[Middleware:${requestId}] Redis is not configured - allowing all routes`)
    return res
  }

  // Prevent redirect loops by checking if we're already on the login page
  if (pathname === "/auth/login") {
    console.log(`[Middleware:${requestId}] Already on login page, skipping middleware`)
    return res
  }

  // Get session ID from cookie
  const sessionId = request.cookies.get("ctek-session")?.value

  // Handle auth callback with session ID in URL
  const requestUrl = new URL(request.url)
  const callbackSessionId = requestUrl.searchParams.get("session")

  if (callbackSessionId && pathname === "/auth/callback") {
    console.log(`[Middleware:${requestId}] Handling auth callback`)
    // Set session cookie and redirect
    res.cookies.set("ctek-session", callbackSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Define route types
  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password") ||
    pathname === "/auth/callback"

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/dealers") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/favicon.ico"

  const isApiRoute = pathname.startsWith("/api/")

  // Define protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dealer") ||
    pathname.startsWith("/customer") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/messages")

  console.log(`[Middleware:${requestId}] Route analysis:`, {
    pathname,
    isAuthRoute,
    isPublicRoute,
    isApiRoute,
    isProtectedRoute,
    hasSession: !!sessionId
  })

  // Skip session validation for public routes and auth routes
  if (isAuthRoute || isPublicRoute) {
    console.log(`[Middleware:${requestId}] Skipping session validation for ${isAuthRoute ? 'auth' : 'public'} route`)
    return res
  }

  // For API routes, handle authentication separately
  if (isApiRoute) {
    if (!sessionId) {
      console.log(`[Middleware:${requestId}] API route without session - returning 401`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Continue with session validation for API routes
  }

  // Validate session for protected routes
  if (sessionId) {
    try {
      console.log(`[Middleware:${requestId}] Validating session: ${sessionId}`)
      const session = await SessionModel.findById(sessionId)

      if (session) {
        // Session is valid, refresh it if it's close to expiring
        const expiresAt = new Date(session.expiresAt)
        const now = new Date()
        const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)

        console.log(`[Middleware:${requestId}] Session expires in ${hoursUntilExpiry.toFixed(2)} hours`)

        // Refresh session if it expires within 24 hours
        if (hoursUntilExpiry < 24) {
          console.log(`[Middleware:${requestId}] Refreshing session`)
          await SessionModel.refresh(sessionId)
        }

        console.log(`[Middleware:${requestId}] Session valid for ${pathname}`)
        return res
      } else {
        // Session is invalid or expired, clear cookie
        console.log(`[Middleware:${requestId}] Session invalid/expired, clearing cookie`)
        res.cookies.delete("ctek-session")
      }
    } catch (error) {
      console.error(`[Middleware:${requestId}] Session validation error:`, error)
      // Clear the invalid session cookie
      res.cookies.delete("ctek-session")
    }
  } else {
    console.log(`[Middleware:${requestId}] No session cookie found`)
  }

  // Redirect to login for protected routes without valid session
  if (isProtectedRoute && !isApiRoute) {
    console.log(`[Middleware:${requestId}] Redirecting to login from ${pathname}`)
    
    // Check if we're not already redirecting to avoid loops
    const redirectUrl = new URL("/auth/login", request.url)
    if (pathname !== "/auth/login") {
      redirectUrl.searchParams.set("redirect", pathname)
    }
    
    return NextResponse.redirect(redirectUrl)
  }

  // For other routes, allow access
  console.log(`[Middleware:${requestId}] Allowing access to ${pathname}`)
  return res
}
