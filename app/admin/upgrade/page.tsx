export const dynamic = "force-dynamic"
export const runtime = "nodejs"
;("use client")

import type React from "react"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

function AdminUpgradeContent() {
  const [email, setEmail] = useState("joshuahodson64@gmail.com")
  const [password, setPassword] = useState("ebony2025")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      console.log("[v0] Requesting admin upgrade for:", email)

      const response = await fetch("/api/admin/upgrade-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Admin upgrade successful:", data)
        setResult({ success: true, message: data.message })
      } else {
        console.log("[v0] Admin upgrade failed:", data)
        setResult({ error: data.error || "Upgrade failed" })
      }
    } catch (error) {
      console.error("[v0] Admin upgrade exception:", error)
      setResult({ error: "Network error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Account Upgrade</CardTitle>
          <CardDescription>Upgrade your account to admin privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpgrade} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                  {result.success ? result.message : result.error}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Upgrading..." : "Upgrade to Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminUpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      }
    >
      <AdminUpgradeContent />
    </Suspense>
  )
}
