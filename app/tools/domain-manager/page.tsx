"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Globe, Shield, NetworkIcon as Dns, Plus, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface Domain {
  id: string
  domain_name: string
  project_name?: string
  status: "active" | "pending" | "expired" | "suspended"
  auto_detected: boolean
  ssl_enabled: boolean
  dns_configured: boolean
  created_at: string
  updated_at: string
  metadata: any
}

export default function DomainManagerPage() {
  const { user } = useAuth()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [projectName, setProjectName] = useState("")

  useEffect(() => {
    if (user) {
      fetchDomains()
    }
  }, [user])

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/domains")
      const data = await response.json()

      if (response.ok) {
        setDomains(data.domains || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching domains:", error)
    } finally {
      setLoading(false)
    }
  }

  const detectDomain = async () => {
    if (!newDomain.trim()) return

    setDetecting(true)
    try {
      const response = await fetch("/api/domains/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewDomain("")
        setProjectName("")
        await fetchDomains()
      } else {
        console.error("[v0] Domain detection failed:", data.error)
      }
    } catch (error) {
      console.error("[v0] Error detecting domain:", error)
    } finally {
      setDetecting(false)
    }
  }

  const addManualDomain = async () => {
    if (!newDomain.trim()) return

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain_name: newDomain.trim(),
          project_name: projectName.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewDomain("")
        setProjectName("")
        await fetchDomains()
      }
    } catch (error) {
      console.error("[v0] Error adding domain:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "expired":
        return "bg-red-500"
      case "suspended":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass p-6 rounded-xl border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2">Domain Manager</h1>
          <p className="text-gray-300">Auto-detect and manage your domains with Supabase integration</p>
        </div>

        {/* Add Domain */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Domain
            </CardTitle>
            <CardDescription className="text-gray-300">
              Auto-detect domain configuration or add manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
              <Input
                placeholder="Project name (optional)"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={detectDomain}
                disabled={detecting || !newDomain.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {detecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Auto-Detect
                  </>
                )}
              </Button>
              <Button
                onClick={addManualDomain}
                variant="outline"
                disabled={!newDomain.trim()}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Add Manually
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Domains List */}
        <div className="grid gap-4">
          {domains.length === 0 ? (
            <Card className="glass border-white/10">
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No domains found. Add your first domain above.</p>
              </CardContent>
            </Card>
          ) : (
            domains.map((domain) => (
              <Card key={domain.id} className="glass border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{domain.domain_name}</h3>
                      {domain.project_name && <p className="text-gray-400">{domain.project_name}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(domain.status)} text-white`}>{domain.status}</Badge>
                      {domain.auto_detected && (
                        <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                          Auto-detected
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className={`h-4 w-4 ${domain.ssl_enabled ? "text-green-400" : "text-red-400"}`} />
                      <span className="text-gray-300">SSL: {domain.ssl_enabled ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dns className={`h-4 w-4 ${domain.dns_configured ? "text-green-400" : "text-red-400"}`} />
                      <span className="text-gray-300">
                        DNS: {domain.dns_configured ? "Configured" : "Not configured"}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      Added: {new Date(domain.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
