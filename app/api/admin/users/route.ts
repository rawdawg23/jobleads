import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"
import { redisClient } from "@/lib/redis/client"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const result = await AuthService.getCurrentUser()

    if (!result || result.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all user keys
    const userKeys = await redisClient.keys("user:*")
    const users = []

    // Fetch all users
    for (const key of userKeys) {
      const userData = await redisClient.get(key)
      if (userData) {
        users.push(JSON.parse(userData as string))
      }
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
