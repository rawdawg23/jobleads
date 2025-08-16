import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Completely disabled - let all requests pass through to Next.js
  return
}

export const config = {
  matcher: [],
}
