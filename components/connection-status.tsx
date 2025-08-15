"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { useRealtime } from "./realtime-provider"

export function ConnectionStatus() {
  const { isConnected, lastUpdate } = useRealtime()

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className={`${isConnected ? "bg-green-500" : "bg-red-500"} text-white`}
      >
        {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
        {isConnected ? "Live" : "Offline"}
      </Badge>
      {lastUpdate && <span className="text-xs text-slate-400">Updated {lastUpdate.toLocaleTimeString()}</span>}
    </div>
  )
}
