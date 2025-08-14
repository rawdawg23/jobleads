import { Redis } from "@upstash/redis"

export const isRedisConfigured =
  typeof process.env.KV_REST_API_URL === "string" &&
  process.env.KV_REST_API_URL.length > 0 &&
  typeof process.env.KV_REST_API_TOKEN === "string" &&
  process.env.KV_REST_API_TOKEN.length > 0

let redis: Redis | null = null

export function createRedisClient(): Redis {
  if (!redis) {
    if (!isRedisConfigured) {
      throw new Error("Redis environment variables are not configured")
    }

    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  }

  return redis
}

export const redisClient = createRedisClient()
