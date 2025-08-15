import { NextResponse, type NextRequest } from "next/server"
import { SessionModel } from "./models"

export async function updateSession(request: NextRequest) {
  const res = NextResponse.next()

  // Get session ID from cookie
  const sessionId = request.cookies.get("ctek-session")?.value

  // Handle auth callback with session ID in URL
  const requestUrl = new URL(request.url)
  const callbackSessionId = requestUrl.searchParams.get("session")

  if (callbackSessionId && request.nextUrl.pathname === "/auth/callback") {
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
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/register") ||
    request.nextUrl.pathname.startsWith("/auth/forgot-password") || // Added forgot password route
    request.nextUrl.pathname.startsWith("/auth/reset-password") || // Added reset password route
    request.nextUrl.pathname === "/auth/callback"

  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/dealers") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/auth/") ||
    request.nextUrl.pathname === "/favicon.ico"

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")

  // Skip session validation for public routes and auth routes
  if (isAuthRoute || isPublicRoute) {
    return res
  }

  // Validate session for protected routes
  if (sessionId) {
    try {
      const session = await SessionModel.findById(sessionId)

      if (session) {
        // Session is valid, refresh it if it's close to expiring
        const expiresAt = new Date(session.expiresAt)
        const now = new Date()
        const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)

        // Refresh session if it expires within 24 hours
        if (hoursUntilExpiry < 24) {
          await SessionModel.refresh(sessionId)
        }

        return res
      } else {
        // Session is invalid or expired, clear cookie
        res.cookies.delete("ctek-session")
      }
    } catch (error) {
      console.error("Session validation error:", error)
      res.cookies.delete("ctek-session")
    }
  }

  // Redirect to login for protected routes without valid session
  if (!isApiRoute) {
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // For API routes, return 401
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
