import { Redis } from "@upstash/redis"

export const isRedisConfigured =
  typeof process.env.KV_REST_API_URL === "string" &&
  process.env.KV_REST_API_URL.length > 0 &&
  typeof process.env.KV_REST_API_TOKEN === "string" &&
  process.env.KV_REST_API_TOKEN.length > 0

const dummyClient = {
  get: async () => null,
  set: async () => "OK",
  setex: async () => "OK",
  del: async () => 0,
  sadd: async () => 0,
  srem: async () => 0,
  smembers: async () => [],
  keys: async () => [],
  exists: async () => 0,
  incr: async () => 1,
  expire: async () => 1,
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
