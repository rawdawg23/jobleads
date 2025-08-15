"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeAuth = async () => {
      try {
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
          if (event === "SIGNED_IN" && session?.user) {
            await loadUserProfile(session.user)
          } else if (event === "SIGNED_OUT") {
            setUser(null)
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.warn("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [mounted, supabase.auth])

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
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
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
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
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (!mounted) {
    return null
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
