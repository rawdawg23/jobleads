import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Declare EdgeRuntime to avoid undeclared variable error
const EdgeRuntime = typeof process !== "undefined" ? process.env.EDGE_RUNTIME : undefined
const isEdgeRuntime = typeof EdgeRuntime !== "undefined"

// Check if Supabase environment variables are available
export const isSupabaseConfigured = (() => {
  try {
    return (
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
    )
  } catch {
    return false
  }
})()

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      },
    )

    // Check if this is an auth callback
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)
      // Redirect to profile page after successful auth
      return NextResponse.redirect(new URL("/profile", request.url))
    }

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    // Protected routes - redirect to login if not authenticated
    const isAuthRoute =
      request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth/register") ||
      request.nextUrl.pathname === "/auth/callback"

    const isPublicRoute =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/dealers") ||
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/admin-direct") ||
      request.nextUrl.pathname.startsWith("/diagnose") ||
      request.nextUrl.pathname.startsWith("/api/diagnose") ||
      request.nextUrl.pathname.startsWith("/api/create-admin") ||
      request.nextUrl.pathname.startsWith("/api/auth/register-bypass") ||
      request.nextUrl.pathname.startsWith("/api/auth/register-working") ||
      request.nextUrl.pathname.startsWith("/api/auth/login-bypass") ||
      request.nextUrl.pathname.startsWith("/api/fix-auth-trigger") ||
      request.nextUrl.pathname.startsWith("/admin/upgrade") ||
      request.nextUrl.pathname.startsWith("/api/admin/upgrade-user") ||
      request.nextUrl.pathname.startsWith("/api/auth/forgot-password") ||
      request.nextUrl.pathname.startsWith("/api/auth/reset-password") ||
      request.nextUrl.pathname.startsWith("/tools/supabase-domains") ||
      request.nextUrl.pathname.startsWith("/tools/domain-auto-sync") ||
      request.nextUrl.pathname.startsWith("/api/domains")

    if (!isAuthRoute && !isPublicRoute) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        const redirectUrl = new URL("/auth/login", request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next({
      request,
    })
  }
}
