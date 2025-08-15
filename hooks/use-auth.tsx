"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { subscribeToGlobalAuth, getGlobalSupabase } from "@/lib/global-auth"
import type { User as SupabaseUser } from "@supabase/supabase-js"

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
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] AuthProvider mounting...")

    const unsubscribe = subscribeToGlobalAuth(async (globalState) => {
      setLoading(globalState.loading)

      if (globalState.session?.user && !user) {
        await loadUserProfile(globalState.session.user)
      } else if (!globalState.session?.user) {
        setUser(null)
      }
    })

    return () => {
      console.log("[v0] AuthProvider cleanup")
      unsubscribe()
    }
  }, [])

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log("[v0] Loading user profile for:", authUser.id)
      const client = getGlobalSupabase()
      const { data: profile } = await client.from("users").select("*").eq("id", authUser.id).single()

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
    const client = getGlobalSupabase()
    if (!client) return { error: "Authentication service not available" }

    try {
      const { error } = await client.auth.signInWithPassword({
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
    const client = getGlobalSupabase()
    if (!client) return { error: "Authentication service not available" }

    try {
      const { data, error } = await client.auth.signUp({
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

      if (data.user) {
        const { error: profileError } = await client.from("users").insert({
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
    const client = getGlobalSupabase()
    if (!client) return

    try {
      await client.auth.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
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
