"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRealtimeStats } from "@/hooks/use-realtime-data"

interface RealtimeContextType {
  stats: any
  isConnected: boolean
  lastUpdate: Date | null
}

const RealtimeContext = createContext<RealtimeContextType>({
  stats: {},
  isConnected: false,
  lastUpdate: null,
})

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { stats } = useRealtimeStats()

  const supabase = createClient()

  useEffect(() => {
    // Monitor connection status
    const channel = supabase.channel("connection-status")

    channel
      .on("presence", { event: "sync" }, () => {
        setIsConnected(true)
        setLastUpdate(new Date())
      })
      .on("presence", { event: "join" }, () => {
        setIsConnected(true)
        setLastUpdate(new Date())
      })
      .on("presence", { event: "leave" }, () => {
        setIsConnected(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <RealtimeContext.Provider value={{ stats, isConnected, lastUpdate }}>{children}</RealtimeContext.Provider>
}

export const useRealtime = () => useContext(RealtimeContext)
