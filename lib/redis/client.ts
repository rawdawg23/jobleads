import { Redis } from "@upstash/redis"

export const isRedisConfigured =
  typeof process.env.KV_REST_API_URL === "string" &&
  process.env.KV_REST_API_URL.length > 0 &&
  typeof process.env.KV_REST_API_TOKEN === "string" &&
  process.env.KV_REST_API_TOKEN.length > 0

const dummyClient = {
  get: async (key: string) => {
    console.warn(`Redis not configured: attempted GET ${key}`)
    return null
  },
  set: async (key: string, value: any) => {
    console.warn(`Redis not configured: attempted SET ${key}`)
    return "OK"
  },
  setex: async (key: string, seconds: number, value: any) => {
    console.warn(`Redis not configured: attempted SETEX ${key}`)
    return "OK"
  },
  del: async (key: string) => {
    console.warn(`Redis not configured: attempted DEL ${key}`)
    return 0
  },
  sadd: async (key: string, ...members: any[]) => {
    console.warn(`Redis not configured: attempted SADD ${key}`)
    return 0
  },
  srem: async (key: string, ...members: any[]) => {
    console.warn(`Redis not configured: attempted SREM ${key}`)
    return 0
  },
  smembers: async (key: string) => {
    console.warn(`Redis not configured: attempted SMEMBERS ${key}`)
    return []
  },
  keys: async (pattern: string) => {
    console.warn(`Redis not configured: attempted KEYS ${pattern}`)
    return []
  },
  exists: async (key: string) => {
    console.warn(`Redis not configured: attempted EXISTS ${key}`)
    return 0
  },
  incr: async (key: string) => {
    console.warn(`Redis not configured: attempted INCR ${key}`)
    return 1
  },
  expire: async (key: string, seconds: number) => {
    console.warn(`Redis not configured: attempted EXPIRE ${key}`)
    return 1
  },
}

let redis: Redis | null = null

export function createRedisClient(): Redis | typeof dummyClient {
  if (!redis) {
    if (!isRedisConfigured) {
      console.warn("Redis environment variables are not configured, using dummy client")
      return dummyClient as any
    }

    try {
      redis = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      })
    } catch (error) {
      console.error("Failed to create Redis client:", error)
      return dummyClient as any
    }
  }

  return redis
}

export const redisClient = createRedisClient()
