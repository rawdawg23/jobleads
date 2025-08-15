export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminSetupClient from "./admin-setup-client"

export default async function AdminSetupPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (profile?.role === "admin") {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>Set up your admin account for ECU Remapping Jobs platform</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminSetupClient user={user} />
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Current User:</strong> {user.email}
            </p>
            <p>Click the button above to grant admin privileges to this account.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
