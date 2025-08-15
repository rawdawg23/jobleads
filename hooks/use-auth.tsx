"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

let createClient: any = null

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: "customer" | "dealer" | "admin"
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (
    email: string,
    password: string,
    userData: {
      firstName: string
      lastName: string
      phoneNumber: string
      role: "customer" | "dealer" | "admin"
    },
  ) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isCustomer: boolean
  isDealer: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const initializeClient = async () => {
      try {
        setMounted(true)
        console.log("[v0] AuthProvider mounting...")

        if (!createClient) {
          const { createClient: importedCreateClient } = await import("@/lib/supabase/client")
          createClient = importedCreateClient
        }

        const client = createClient()
        setSupabase(client)
        console.log("[v0] Supabase client created successfully")
      } catch (error) {
        console.error("[v0] Failed to create Supabase client:", error)
        setError("Authentication service unavailable")
        setLoading(false)
      }
    }

    initializeClient()
  }, [])

  useEffect(() => {
    if (!mounted || !supabase || error) return

    const initializeAuth = async () => {
      try {
        console.log("[v0] Initializing auth...")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          await loadUserProfile(session.user)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[v0] Auth state change:", event)
          if (event === "SIGNED_IN" && session?.user) {
            await loadUserProfile(session.user)
          } else if (event === "SIGNED_OUT") {
            setUser(null)
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        setError("Authentication initialization failed")
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [mounted, supabase, error])

  useEffect(() => {
    if (!mounted || !user || !supabase) return

    // Subscribe to real-time profile updates
    const profileSubscription = supabase
      .channel("profile-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    firstName: payload.new.first_name || prev.firstName,
                    lastName: payload.new.last_name || prev.lastName,
                    phoneNumber: payload.new.phone_number || prev.phoneNumber,
                    role: payload.new.role || prev.role,
                    updatedAt: payload.new.updated_at || prev.updatedAt,
                  }
                : null,
            )
          }
        },
      )
      .subscribe()

    return () => {
      profileSubscription.unsubscribe()
    }
  }, [mounted, user, supabase])

  const loadUserProfile = async (authUser: SupabaseUser) => {
    if (!supabase) return

    try {
      console.log("[v0] Loading user profile for:", authUser.id)
      // Get user profile from users table
      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      const userData: User = {
        id: authUser.id,
        email: authUser.email || "",
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        phoneNumber: profile?.phone_number || "",
        role: profile?.role || "customer",
        createdAt: authUser.created_at,
        updatedAt: profile?.updated_at || authUser.updated_at || authUser.created_at,
      }

      setUser(userData)
      console.log("[v0] User profile loaded successfully")
    } catch (error) {
      console.error("[v0] Error loading user profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Authentication service not available" }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: "An unexpected error occurred. Please try again." }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: {
      firstName: string
      lastName: string
      phoneNumber: string
      role: "customer" | "dealer" | "admin"
    },
  ) => {
    if (!supabase) return { error: "Authentication service not available" }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/profile`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone_number: userData.phoneNumber,
            role: userData.role,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      // If user is created, also create profile in users table
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }
      }

      return {}
    } catch (error) {
      return { error: "An unexpected error occurred during registration." }
    }
  }

  const signOut = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Authentication Unavailable</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!mounted || !supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-pulse text-center">
            <div className="h-6 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isCustomer: user?.role === "customer",
    isDealer: user?.role === "dealer",
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
