"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  account_type: "customer" | "dealer" | "admin"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    name: string,
    accountType: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAdmin: boolean
  isDealer: boolean
  isCustomer: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/simple-auth/me", {
        credentials: "include",
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status === 404) {
        console.log("[v0] Simple auth API routes not yet available")
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.log("[v0] Simple auth API routes not yet created")
      } else {
        console.error("Session check failed:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/simple-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return { success: false, error: "Authentication system not yet available" }
      }
      return { success: false, error: "Network error" }
    }
  }

  const register = async (email: string, password: string, name: string, accountType: string) => {
    try {
      const response = await fetch("/api/simple-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name, account_type: accountType }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, error: data.error || "Registration failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/simple-auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.account_type === "admin",
    isDealer: user?.account_type === "dealer",
    isCustomer: user?.account_type === "customer",
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
