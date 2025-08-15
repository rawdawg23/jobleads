import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { type NextRequest, NextResponse } from "next/server"

export interface RedirectRule {
  id: string
  name: string
  condition: (context: RedirectContext) => boolean
  destination: string | ((context: RedirectContext) => string)
  priority: number
  enabled: boolean
}

export interface RedirectContext {
  user: any
  pathname: string
  searchParams: URLSearchParams
  headers: Headers
  userAgent: string
  referrer: string
  timestamp: number
  sessionData?: any
}

export interface RedirectHistory {
  from: string
  to: string
  timestamp: number
  reason: string
  userId?: string
}

export class EnhancedRedirectSystem {
  private static rules: RedirectRule[] = [
    // Authentication-based redirects
    {
      id: "auth-required",
      name: "Authentication Required",
      condition: (ctx) => !ctx.user && this.isProtectedRoute(ctx.pathname),
      destination: (ctx) => `/auth/login?redirect=${encodeURIComponent(ctx.pathname)}`,
      priority: 100,
      enabled: true,
    },
    {
      id: "already-authenticated",
      name: "Already Authenticated",
      condition: (ctx) => !!ctx.user && this.isAuthRoute(ctx.pathname),
      destination: (ctx) => this.getRoleBasedDashboard(ctx.user?.role || "customer"),
      priority: 90,
      enabled: true,
    },
    // Role-based redirects
    {
      id: "admin-only",
      name: "Admin Only Access",
      condition: (ctx) => ctx.user?.role !== "admin" && ctx.pathname.startsWith("/admin"),
      destination: "/unauthorized?reason=admin_required",
      priority: 80,
      enabled: true,
    },
    {
      id: "dealer-only",
      name: "Dealer Only Access",
      condition: (ctx) => ctx.user?.role !== "dealer" && ctx.pathname.startsWith("/dealer"),
      destination: "/unauthorized?reason=dealer_required",
      priority: 80,
      enabled: true,
    },
    // Profile completion redirects
    {
      id: "profile-incomplete",
      name: "Profile Completion Required",
      condition: (ctx) =>
        ctx.user && !this.isProfileComplete(ctx.user) && !ctx.pathname.startsWith("/profile/complete"),
      destination: "/profile/complete",
      priority: 70,
      enabled: true,
    },
    // Onboarding redirects
    {
      id: "first-time-user",
      name: "First Time User Onboarding",
      condition: (ctx) => ctx.user && this.isFirstTimeUser(ctx.user) && !ctx.pathname.startsWith("/onboarding"),
      destination: (ctx) => `/onboarding/${ctx.user.role}`,
      priority: 60,
      enabled: true,
    },
    // Maintenance redirects
    {
      id: "maintenance-mode",
      name: "Maintenance Mode",
      condition: (ctx) => this.isMaintenanceMode() && !ctx.pathname.startsWith("/maintenance"),
      destination: "/maintenance",
      priority: 200,
      enabled: false, // Disabled by default
    },
    // Feature flag redirects
    {
      id: "feature-disabled",
      name: "Feature Disabled",
      condition: (ctx) => this.isFeatureDisabled(ctx.pathname),
      destination: "/feature-unavailable",
      priority: 50,
      enabled: true,
    },
  ]

  private static history: RedirectHistory[] = []

  // Main redirect processing function
  static async processRedirect(request: NextRequest): Promise<NextResponse | null> {
    const context = await this.buildContext(request)

    // Sort rules by priority (highest first)
    const enabledRules = this.rules.filter((rule) => rule.enabled).sort((a, b) => b.priority - a.priority)

    // Find first matching rule
    for (const rule of enabledRules) {
      if (rule.condition(context)) {
        const destination = typeof rule.destination === "function" ? rule.destination(context) : rule.destination

        // Log redirect
        this.logRedirect({
          from: context.pathname,
          to: destination,
          timestamp: Date.now(),
          reason: rule.name,
          userId: context.user?.id,
        })

        // Create redirect response
        const response = NextResponse.redirect(new URL(destination, request.url))

        // Add redirect metadata headers
        response.headers.set("X-Redirect-Rule", rule.id)
        response.headers.set("X-Redirect-Reason", rule.name)
        response.headers.set("X-Redirect-Timestamp", Date.now().toString())

        return response
      }
    }

    return null // No redirect needed
  }

  // Server action for role-based redirects after authentication
  static async handleAuthSuccess(userId: string, role: string, intendedDestination?: string) {
    const supabase = createClient()

    // Get user profile for additional context
    const { data: profile } = await supabase.from("users").select("*").eq("id", userId).single()

    // Check if user has intended destination from login redirect
    if (intendedDestination && this.isValidRedirectDestination(intendedDestination, role)) {
      redirect(intendedDestination)
    }

    // Check for profile completion
    if (!this.isProfileComplete(profile)) {
      redirect("/profile/complete")
    }

    // Check for first-time user onboarding
    if (this.isFirstTimeUser(profile)) {
      redirect(`/onboarding/${role}`)
    }

    // Default role-based redirect
    redirect(this.getRoleBasedDashboard(role))
  }

  // Client-side redirect utilities
  static getClientRedirectUrl(user: any, currentPath: string): string | null {
    const context: RedirectContext = {
      user,
      pathname: currentPath,
      searchParams: new URLSearchParams(window.location.search),
      headers: new Headers(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      timestamp: Date.now(),
    }

    const enabledRules = this.rules.filter((rule) => rule.enabled).sort((a, b) => b.priority - a.priority)

    for (const rule of enabledRules) {
      if (rule.condition(context)) {
        return typeof rule.destination === "function" ? rule.destination(context) : rule.destination
      }
    }

    return null
  }

  // Rule management
  static addRule(rule: RedirectRule) {
    this.rules.push(rule)
  }

  static removeRule(ruleId: string) {
    this.rules = this.rules.filter((rule) => rule.id !== ruleId)
  }

  static enableRule(ruleId: string) {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (rule) rule.enabled = true
  }

  static disableRule(ruleId: string) {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (rule) rule.enabled = false
  }

  static updateRule(ruleId: string, updates: Partial<RedirectRule>) {
    const ruleIndex = this.rules.findIndex((r) => r.id === ruleId)
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates }
    }
  }

  // Helper methods
  private static async buildContext(request: NextRequest): Promise<RedirectContext> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userProfile = null
    if (user) {
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
      userProfile = data
    }

    return {
      user: userProfile,
      pathname: request.nextUrl.pathname,
      searchParams: request.nextUrl.searchParams,
      headers: request.headers,
      userAgent: request.headers.get("user-agent") || "",
      referrer: request.headers.get("referer") || "",
      timestamp: Date.now(),
    }
  }

  private static isProtectedRoute(pathname: string): boolean {
    const protectedPaths = ["/profile", "/admin", "/dealer", "/dashboard", "/jobs/post", "/jobs/manage", "/settings"]
    return protectedPaths.some((path) => pathname.startsWith(path))
  }

  private static isAuthRoute(pathname: string): boolean {
    return pathname.startsWith("/auth/")
  }

  private static getRoleBasedDashboard(role: string): string {
    switch (role) {
      case "admin":
        return "/profile/admin"
      case "dealer":
        return "/profile/dealer"
      case "customer":
      default:
        return "/profile/customer"
    }
  }

  private static isProfileComplete(user: any): boolean {
    if (!user) return false
    return !!(user.first_name && user.last_name && user.email)
  }

  private static isFirstTimeUser(user: any): boolean {
    if (!user) return false
    // Check if user was created less than 24 hours ago and hasn't completed onboarding
    const createdAt = new Date(user.created_at)
    const now = new Date()
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    return hoursSinceCreation < 24 && !user.onboarding_completed
  }

  private static isMaintenanceMode(): boolean {
    return process.env.MAINTENANCE_MODE === "true"
  }

  private static isFeatureDisabled(pathname: string): boolean {
    // Check feature flags for specific paths
    const featureFlags = {
      "/jobs/post": process.env.FEATURE_JOB_POSTING === "false",
      "/dealer/apply": process.env.FEATURE_DEALER_APPLICATIONS === "false",
    }

    return Object.entries(featureFlags).some(([path, disabled]) => pathname.startsWith(path) && disabled)
  }

  private static isValidRedirectDestination(destination: string, userRole: string): boolean {
    // Validate that the intended destination is accessible for the user's role
    if (destination.startsWith("/admin") && userRole !== "admin") return false
    if (destination.startsWith("/dealer") && userRole !== "dealer") return false
    return true
  }

  private static logRedirect(entry: RedirectHistory) {
    this.history.push(entry)
    // Keep only last 1000 entries
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000)
    }
    console.log(`[Enhanced Redirect] ${entry.from} → ${entry.to} (${entry.reason})`)
  }

  // Analytics and monitoring
  static getRedirectHistory(): RedirectHistory[] {
    return [...this.history]
  }

  static getRedirectStats() {
    const stats = {
      totalRedirects: this.history.length,
      byReason: {} as Record<string, number>,
      byDestination: {} as Record<string, number>,
      recentRedirects: this.history.slice(-10),
    }

    this.history.forEach((entry) => {
      stats.byReason[entry.reason] = (stats.byReason[entry.reason] || 0) + 1
      stats.byDestination[entry.to] = (stats.byDestination[entry.to] || 0) + 1
    })

    return stats
  }
}
