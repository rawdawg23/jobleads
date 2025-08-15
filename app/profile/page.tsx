export const dynamic = "force-dynamic"
export const runtime = "nodejs"
;("use client")

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { user, loading, isCustomer, isDealer, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      if (isCustomer) {
        router.push("/profile/customer")
      } else if (isDealer) {
        router.push("/profile/dealer")
      } else if (isAdmin) {
        router.push("/profile/admin")
      }
    }
  }, [user, loading, isCustomer, isDealer, isAdmin, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-foreground/70 text-lg">Redirecting to your profile...</p>
      </div>
    </div>
  )
}
