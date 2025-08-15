import type { NextRequest } from "next/server"
// import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // This allows users to access the ECU remapping platform without authentication interference
  return new Response(null, { status: 200 })

  // try {
  //   return await updateSession(request)
  // } catch (error) {
  //   console.error("[Middleware] Error updating session:", error)
  //   // Return a simple response to prevent middleware failures
  //   return new Response(null, { status: 200 })
  // }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
