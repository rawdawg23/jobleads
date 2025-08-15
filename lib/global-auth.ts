import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

declare global {
  var __GLOBAL_AUTH_INITIALIZED__: boolean | undefined
  var __GLOBAL_SUPABASE_CLIENT__: any
  var __GLOBAL_AUTH_SUBSCRIPTION__: any
  var __GLOBAL_AUTH_STATE__: any
}

let globalSupabase: any = globalThis.__GLOBAL_SUPABASE_CLIENT__ || null
let globalAuthSubscription: any = globalThis.__GLOBAL_AUTH_SUBSCRIPTION__ || null
const globalStateListeners: Set<(state: any) => void> = new Set()

const globalAuthState = globalThis.__GLOBAL_AUTH_STATE__ || {
  user: null as User | null,
  session: null as Session | null,
  loading: true,
  initialized: false,
}

function ensureInitialized() {
  if (typeof window === "undefined") {
    return
  }

  if (globalThis.__GLOBAL_AUTH_INITIALIZED__) {
    return
  }

  globalThis.__GLOBAL_AUTH_INITIALIZED__ = true
  console.log("[v0] Initializing global auth system")

  if (!globalSupabase) {
    try {
      globalSupabase = createClient()
      globalThis.__GLOBAL_SUPABASE_CLIENT__ = globalSupabase
      console.log("[v0] Global Supabase client created")
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      globalAuthState.loading = false
      globalAuthState.initialized = true
      globalThis.__GLOBAL_AUTH_STATE__ = globalAuthState
      return
    }
  }

  if (globalSupabase && !globalAuthSubscription) {
    try {
      globalAuthSubscription = globalSupabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
        console.log("[v0] Global auth state change:", event, session ? "with session" : "no session")
        globalAuthState.session = session
        globalAuthState.user = session?.user ?? null
        globalAuthState.loading = false

        globalThis.__GLOBAL_AUTH_STATE__ = globalAuthState

        globalStateListeners.forEach((listener) => listener({ ...globalAuthState }))
      })
      globalThis.__GLOBAL_AUTH_SUBSCRIPTION__ = globalAuthSubscription
      console.log("[v0] Global auth subscription created")
    } catch (error) {
      console.error("[v0] Failed to create auth subscription:", error)
      globalAuthState.loading = false
    }
  }

  setTimeout(() => {
    if (globalAuthState.loading) {
      console.log("[v0] Auth loading timeout - setting loading to false")
      globalAuthState.loading = false
      globalAuthState.initialized = true
      globalThis.__GLOBAL_AUTH_STATE__ = globalAuthState
      globalStateListeners.forEach((listener) => listener({ ...globalAuthState }))
    }
  }, 3000) // 3 second timeout

  globalAuthState.initialized = true
  globalThis.__GLOBAL_AUTH_STATE__ = globalAuthState
}

export function subscribeToGlobalAuth(callback: (state: any) => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  ensureInitialized()

  globalStateListeners.add(callback)

  callback({ ...globalAuthState })

  return () => {
    globalStateListeners.delete(callback)
  }
}

export function getGlobalAuthState() {
  if (typeof window === "undefined") {
    return { user: null, session: null, loading: false, initialized: false }
  }

  ensureInitialized()
  return { ...globalAuthState }
}

export function getGlobalSupabase() {
  if (typeof window === "undefined") {
    return {
      auth: {
        signInWithPassword: async () => ({ data: null, error: new Error("Not available during build") }),
        signUp: async () => ({ data: null, error: new Error("Not available during build") }),
        signOut: async () => ({ error: new Error("Not available during build") }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error("Not available during build") }),
          }),
        }),
        insert: async () => ({ data: null, error: new Error("Not available during build") }),
      }),
    } as any
  }

  ensureInitialized()
  return globalSupabase
}
