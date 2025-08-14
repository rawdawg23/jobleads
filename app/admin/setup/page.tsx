import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminSetupPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is already admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (profile?.role === "admin") {
    redirect("/admin")
  }

  const makeAdmin = async () => {
    "use server"
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
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

      redirect("/admin")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>Set up your admin account for ECU Remapping Jobs platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={makeAdmin}>
            <Button type="submit" className="w-full">
              Activate Admin Access
            </Button>
          </form>
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
