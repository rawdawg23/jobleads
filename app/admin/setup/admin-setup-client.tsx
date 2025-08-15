"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AdminSetupClientProps {
  user: any
}

export default function AdminSetupClient({ user }: AdminSetupClientProps) {
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

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

  return (
    <Button onClick={makeAdmin} disabled={processing} className="w-full">
      {processing ? "Setting up..." : "Activate Admin Access"}
    </Button>
  )
}
