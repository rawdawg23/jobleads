import { createClient } from "@/lib/supabase/client"

export interface RedirectConfig {
  customer: string
  dealer: string
  admin: string
  default: string
  login: string
}

export const REDIRECT_PATHS: RedirectConfig = {
  customer: "/profile/customer",
  dealer: "/profile/dealer",
  admin: "/profile/admin",
  default: "/profile",
  login: "/auth/login",
}

export class SimpleRedirectManager {
  private static instance: SimpleRedirectManager

  static getInstance(): SimpleRedirectManager {
    if (!SimpleRedirectManager.instance) {
      SimpleRedirectManager.instance = new SimpleRedirectManager()
    }
    return SimpleRedirectManager.instance
  }

  // Get redirect path based on user role
  getRoleBasedPath(role: string | null): string {
    switch (role) {
      case "customer":
        return REDIRECT_PATHS.customer
      case "dealer":
        return REDIRECT_PATHS.dealer
      case "admin":
        return REDIRECT_PATHS.admin
      default:
        return REDIRECT_PATHS.default
    }
  }

  // Handle post-login redirect
  async handlePostLoginRedirect(): Promise<string> {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return REDIRECT_PATHS.login
      }

      // Get user profile to determine role
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

      const role = profile?.role || null
      return this.getRoleBasedPath(role)
    } catch (error) {
      console.error("[v0] Redirect error:", error)
      return REDIRECT_PATHS.default
    }
  }

  // Handle auth callback redirect
  handleAuthCallback(searchParams: URLSearchParams): string {
    const error = searchParams.get("error")
    const type = searchParams.get("type")

    if (error) {
      console.error("[v0] Auth callback error:", error)
      return `${REDIRECT_PATHS.login}?error=${encodeURIComponent(error)}`
    }

    // For password recovery, redirect to reset password page
    if (type === "recovery") {
      return "/auth/reset-password"
    }

    // For email confirmation, show success and redirect to login
    if (type === "signup") {
      return `${REDIRECT_PATHS.login}?message=Email confirmed successfully`
    }

    // Default: redirect based on user role
    return REDIRECT_PATHS.default
  }

  // Check if path requires authentication
  requiresAuth(pathname: string): boolean {
    const publicPaths = [
      "/",
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/callback",
      "/auth/password-reset-success",
    ]

    const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path))
    const isApiRoute = pathname.startsWith("/api/")
    const isStaticFile = pathname.includes(".")

    return !isPublicPath && !isApiRoute && !isStaticFile
  }

  // Get login redirect with return URL
  getLoginRedirect(currentPath: string): string {
    if (currentPath === "/" || currentPath.startsWith("/auth/")) {
      return REDIRECT_PATHS.login
    }
    return `${REDIRECT_PATHS.login}?returnTo=${encodeURIComponent(currentPath)}`
  }
}

export const redirectManager = SimpleRedirectManager.getInstance()
