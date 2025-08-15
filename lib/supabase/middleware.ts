import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      console.log("[v0] Supabase not configured, skipping middleware")
      return NextResponse.next({
        request,
      })
    }

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

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

    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      try {
        console.log("[v0] Exchanging code for session")
        await supabase.auth.exchangeCodeForSession(code)
        return NextResponse.redirect(new URL("/profile", request.url))
      } catch (error) {
        console.error("[v0] Error exchanging code for session:", error)
        // Continue with normal flow instead of crashing
      }
    }

    let session = null
    try {
      console.log("[v0] Getting session in middleware")
      const { data } = await supabase.auth.getSession()
      session = data.session
    } catch (error) {
      console.error("[v0] Error getting session in middleware:", error)
      // Continue with null session (treat as unauthenticated)
    }

    const isAuthRoute =
      request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth/register") ||
      request.nextUrl.pathname.startsWith("/auth/forgot-password") ||
      request.nextUrl.pathname.startsWith("/auth/reset-password") ||
      request.nextUrl.pathname === "/auth/callback"

    const isPublicRoute =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/dealers") ||
      request.nextUrl.pathname.startsWith("/_next")

    if (!isAuthRoute && !isPublicRoute && !session) {
      console.log("[v0] No session found, redirecting to login")
      const redirectUrl = new URL("/auth/login", request.url)
      return NextResponse.redirect(redirectUrl)
    }

    console.log("[v0] Middleware completed successfully")
    return response
  } catch (error) {
    console.error("[v0] Critical middleware error:", error)
    // Return a basic response to prevent the entire request from failing
    return NextResponse.next({
      request,
    })
  }
}
