"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

function AdminDirectContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [adminData, setAdminData] = useState<any>(null)

  useEffect(() => {
    // Check if already logged in
    const tempSession = localStorage.getItem("temp_admin_session")
    if (tempSession) {
      const session = JSON.parse(tempSession)
      if (session.expires > Date.now()) {
        setIsLoggedIn(true)
        setAdminData(session.user)
      } else {
        localStorage.removeItem("temp_admin_session")
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()

      // Query the database directly for the user
      const { data: user, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("role", "admin")
        .single()

      if (dbError || !user) {
        setError("Invalid admin credentials")
        return
      }

      // For this temporary bypass, we'll just check if the email matches
      if (email === "ogstorage25@gmail.com" && password === "EEbony2025") {
        // Create temporary session
        const session = {
          user: user,
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        }
        localStorage.setItem("temp_admin_session", JSON.stringify(session))
        setIsLoggedIn(true)
        setAdminData(user)
      } else {
        setError("Invalid credentials")
      }
    } catch (err) {
      setError("Login failed")
      console.error("[v0] Admin login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("temp_admin_session")
    setIsLoggedIn(false)
    setAdminData(null)
    setEmail("")
    setPassword("")
  }

  if (isLoggedIn && adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Welcome Admin</CardTitle>
                <CardDescription className="text-gray-300">Logged in as: {adminData.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Role: {adminData.role}</p>
                <p className="text-gray-300">ID: {adminData.id}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-300">Manage system users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => (window.location.href = "/admin/users")}>
                  View Users
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">System Settings</CardTitle>
                <CardDescription className="text-gray-300">Configure system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => (window.location.href = "/admin/settings")}>
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-8 bg-yellow-500/20 border-yellow-500/50">
            <AlertDescription className="text-yellow-200">
              This is a temporary admin bypass. Please set up proper authentication for production use.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">Admin Direct Access</CardTitle>
          <CardDescription className="text-gray-300 text-center">Temporary admin login bypass</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter admin email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter password"
                required
              />
            </div>
            {error && (
              <Alert className="bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login as Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDirectClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading admin panel...</p>
          </div>
        </div>
      }
    >
      <AdminDirectContent />
    </Suspense>
  )
}
