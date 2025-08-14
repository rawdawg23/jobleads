import { AuthService } from "@/lib/redis/auth"
import { redirect } from "next/navigation"

export async function getUser() {
  const result = await AuthService.getCurrentUser()
  return result?.user || null
}

export async function getUserWithRole() {
  const result = await AuthService.getCurrentUser()
  return result?.user || null
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await getUserWithRole()
  if (!user) {
    redirect("/auth/login")
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/") // Redirect to home if role not allowed
  }

  return user
}

export function getRedirectPath(role: string) {
  switch (role) {
    case "admin":
      return "/admin"
    case "dealer":
      return "/dealer"
    case "customer":
    default:
      return "/dashboard"
  }
}
