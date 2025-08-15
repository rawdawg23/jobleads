"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Globe, Shield, NetworkIcon as Dns } from "lucide-react"

export default function DomainAutoSyncPage() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)

  useEffect(() => {
    loadDomains()
  }, [])

  useEffect(() => {
    if (autoSyncEnabled) {
      const interval = setInterval(
        () => {
          bulkUpdateDomains()
        },
        5 * 60 * 1000,
      ) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [autoSyncEnabled])

  const loadDomains = async () => {
    try {
      const response = await fetch("/api/domains")
      const data = await response.json()
      if (data.success) {
        setDomains(data.domains)
      }
    } catch (error) {
      console.error("Failed to load domains:", error)
    }
  }

  const updateSingleDomain = async (domain: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/domains/auto-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, force: true }),
      })

      const data = await response.json()
      if (data.success) {
        await loadDomains() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update domain:", error)
    } finally {
      setLoading(false)
    }
  }

  const bulkUpdateDomains = async () => {
    setBulkLoading(true)
    try {
      const response = await fetch("/api/domains/auto-update", {
        method: "PUT",
      })

      const data = await response.json()
      if (data.success) {
        await loadDomains() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to bulk update domains:", error)
    } finally {
      setBulkLoading(false)
    }
  }

  const addDomainForTracking = async () => {
    if (!newDomain.trim()) return

    await updateSingleDomain(newDomain.trim())
    setNewDomain("")
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      available: "bg-green-500",
      registered: "bg-blue-500",
      expired: "bg-red-500",
      pending: "bg-yellow-500",
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass p-6 rounded-xl border border-yellow-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">Domain Auto-Sync</h1>
          <p className="text-gray-300">Automatically monitor and update domain status in Supabase</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white">Add Domain</CardTitle>
              <CardDescription className="text-gray-300">Add a domain to auto-sync tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
                <Button
                  onClick={addDomainForTracking}
                  disabled={loading || !newDomain.trim()}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white">Auto-Sync Controls</CardTitle>
              <CardDescription className="text-gray-300">Manage automatic domain updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                  variant={autoSyncEnabled ? "destructive" : "default"}
                  className="flex-1"
                >
                  {autoSyncEnabled ? "Disable Auto-Sync" : "Enable Auto-Sync"}
                </Button>
                <Button
                  onClick={bulkUpdateDomains}
                  disabled={bulkLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
              </div>
              {autoSyncEnabled && (
                <div className="text-sm text-green-400">✓ Auto-sync enabled (updates every 5 minutes)</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Domains List */}
        <Card className="glass border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white">Tracked Domains</CardTitle>
            <CardDescription className="text-gray-300">
              Domains being automatically monitored and updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {domains.map((domain: any) => (
                <div key={domain.id} className="glass-card p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-yellow-500" />
                      <div>
                        <h3 className="text-white font-medium">{domain.domain}</h3>
                        <p className="text-sm text-gray-400">
                          Last checked: {new Date(domain.last_checked).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusBadge(domain.status)} text-white`}>{domain.status}</Badge>

                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          SSL: {domain.ssl_status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Dns className="w-3 h-3 mr-1" />
                          DNS: {domain.dns_status}
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => updateSingleDomain(domain.domain)}
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {domains.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No domains being tracked. Add a domain above to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
