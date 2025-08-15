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
  if (globalThis.__GLOBAL_AUTH_INITIALIZED__) {
    console.log("[v0] Global auth already initialized, skipping...")
    return
  }

  globalThis.__GLOBAL_AUTH_INITIALIZED__ = true

  console.log("[v0] Initializing global auth system")

  if (!globalSupabase) {
    globalSupabase = createClient()
    globalThis.__GLOBAL_SUPABASE_CLIENT__ = globalSupabase
    console.log("[v0] Global Supabase client created")
  }

  if (!globalAuthSubscription) {
    globalAuthSubscription = globalSupabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      console.log("[v0] Global auth state change:", event)

      globalAuthState.session = session
      globalAuthState.user = session?.user ?? null
      globalAuthState.loading = false

      globalThis.__GLOBAL_AUTH_STATE__ = globalAuthState

      globalStateListeners.forEach((listener) => listener({ ...globalAuthState }))
    })
    globalThis.__GLOBAL_AUTH_SUBSCRIPTION__ = globalAuthSubscription
    console.log("[v0] Global auth subscription created")
  }

  globalAuthState.initialized = true
  globalThis.__GLOBAL_AUTH_STATE__ = globalAuthState
}

export function subscribeToGlobalAuth(callback: (state: any) => void) {
  ensureInitialized()

  globalStateListeners.add(callback)

  callback({ ...globalAuthState })

  return () => {
    globalStateListeners.delete(callback)
  }
}

export function getGlobalAuthState() {
  ensureInitialized()
  return { ...globalAuthState }
}

export function getGlobalSupabase() {
  ensureInitialized()
  return globalSupabase
}
