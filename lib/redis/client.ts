import { Redis } from "@upstash/redis"

export const isRedisConfigured =
  typeof process.env.KV_REST_API_URL === "string" &&
  process.env.KV_REST_API_URL.length > 0 &&
  typeof process.env.KV_REST_API_TOKEN === "string" &&
  process.env.KV_REST_API_TOKEN.length > 0

const dummyClient = {
  get: async (key: string) => {
    console.warn(`Redis not configured - attempting to get key: ${key}`)
    return null
  },
  set: async (key: string, value: string) => {
    console.warn(`Redis not configured - attempting to set key: ${key}`)
    return "OK"
  },
  setex: async (key: string, ttl: number, value: string) => {
    console.warn(`Redis not configured - attempting to setex key: ${key} with TTL: ${ttl}`)
    return "OK"
  },
  del: async (key: string) => {
    console.warn(`Redis not configured - attempting to delete key: ${key}`)
    return 0
  },
  sadd: async (key: string, member: string) => {
    console.warn(`Redis not configured - attempting to sadd key: ${key}, member: ${member}`)
    return 0
  },
  srem: async (key: string, member: string) => {
    console.warn(`Redis not configured - attempting to srem key: ${key}, member: ${member}`)
    return 0
  },
  smembers: async (key: string) => {
    console.warn(`Redis not configured - attempting to get smembers for key: ${key}`)
    return []
  },
  keys: async (pattern: string) => {
    console.warn(`Redis not configured - attempting to get keys for pattern: ${pattern}`)
    return []
  },
  exists: async (key: string) => {
    console.warn(`Redis not configured - attempting to check existence of key: ${key}`)
    return 0
  },
  incr: async (key: string) => {
    console.warn(`Redis not configured - attempting to increment key: ${key}`)
    return 1
  },
  expire: async (key: string, ttl: number) => {
    console.warn(`Redis not configured - attempting to set expire for key: ${key} with TTL: ${ttl}`)
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

    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  }

  return redis
}

export const redisClient = createRedisClient()

// Check configuration on module load
checkRedisConfig()

// Utility function to check Redis configuration status
export function checkRedisConfig() {
  console.log("Redis Configuration Status:")
  console.log("- KV_REST_API_URL:", process.env.KV_REST_API_URL ? "Set" : "Not set")
  console.log("- KV_REST_API_TOKEN:", process.env.KV_REST_API_TOKEN ? "Set" : "Not set")
  console.log("- isRedisConfigured:", isRedisConfigured)
  console.log("- Using:", isRedisConfigured ? "Redis Client" : "Dummy Client")
  
  if (!isRedisConfigured) {
    console.warn("⚠️  Redis is not configured. Authentication will not work.")
    console.warn("   Please set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.")
  }
}
