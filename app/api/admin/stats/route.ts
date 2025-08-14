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

    // Get basic stats from Redis
    const userKeys = await redisClient.keys("user:*")
    const users = []

    for (const key of userKeys) {
      const userData = await redisClient.get(key)
      if (userData) {
        users.push(JSON.parse(userData as string))
      }
    }

    const stats = {
      totalUsers: users.length,
      activeDealers: users.filter((u) => u.role === "dealer").length,
      activeJobs: 0, // TODO: Implement job counting when jobs are migrated to Redis
      monthlyRevenue: 0, // TODO: Implement revenue tracking when payments are migrated to Redis
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Admin stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
