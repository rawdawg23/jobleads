"use client"

import { useEffect, useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

function AdminSetupContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        setUser(authUser)

        // Check if user is already admin
        const { data: profileData } = await supabase.from("users").select("role").eq("id", authUser.id).single()

        setProfile(profileData)

        if (profileData?.role === "admin") {
          router.push("/admin")
          return
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const makeAdmin = async () => {
    if (!user) return

    setProcessing(true)
    try {
      const supabase = createClient()

      await supabase.from("users").upsert({
        id: user.id,
        email: user.email || "ogstorage25@gmail.com",
        first_name: "System",
        last_name: "Administrator",
        role: "admin",
        phone: "+44 1234 567890",
        address: "Admin Office",
        postcode: "SW1A 1AA",
      })

      router.push("/admin")
    } catch (error) {
      console.error("Error making admin:", error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>Set up your admin account for ECU Remapping Jobs platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={makeAdmin} disabled={processing} className="w-full">
            {processing ? "Setting up..." : "Activate Admin Access"}
          </Button>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Current User:</strong> {user?.email}
            </p>
            <p>Click the button above to grant admin privileges to this account.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AdminSetupContent />
    </Suspense>
  )
}
