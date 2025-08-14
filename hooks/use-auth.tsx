"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.warn("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [mounted])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Sign in failed" }
      }

      setUser(data.user)
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          ...userData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Sign up failed" }
      }

      setUser(data.user)
      return {}
    } catch (error) {
      return { error: "An unexpected error occurred during registration." }
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })

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
