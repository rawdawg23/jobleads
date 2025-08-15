"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Shuffle, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DomainSuggestion {
  name: string
  tld: string
  category: string
  available?: boolean
}

export default function SupabaseDomainGenerator() {
  const [projectName, setProjectName] = useState("")
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const supabaseTerms = [
    "base",
    "data",
    "cloud",
    "sync",
    "store",
    "vault",
    "hub",
    "core",
    "stack",
    "flow",
    "edge",
    "node",
    "link",
    "grid",
    "wave",
    "spark",
  ]

  const prefixes = [
    "my",
    "get",
    "use",
    "app",
    "dev",
    "pro",
    "super",
    "smart",
    "quick",
    "fast",
    "easy",
    "auto",
    "next",
    "live",
    "real",
    "true",
    "pure",
  ]

  const suffixes = [
    "app",
    "api",
    "lab",
    "dev",
    "pro",
    "hub",
    "kit",
    "box",
    "io",
    "ly",
    "fy",
    "go",
    "up",
    "now",
    "live",
    "sync",
    "flow",
  ]

  const tlds = [".com", ".io", ".dev", ".app", ".co", ".net", ".org", ".cloud", ".tech", ".digital"]

  const generateDomains = () => {
    if (!projectName.trim()) {
      toast({
        title: "Enter a project name",
        description: "Please enter a project name to generate domain suggestions.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      const newSuggestions: DomainSuggestion[] = []
      const cleanName = projectName.toLowerCase().replace(/[^a-z0-9]/g, "")

      supabaseTerms.forEach((term) => {
        tlds.slice(0, 3).forEach((tld) => {
          newSuggestions.push({
            name: `${cleanName}${term}`,
            tld,
            category: "Brandable",
            available: Math.random() > 0.3,
          })
        })
      })

      prefixes.slice(0, 8).forEach((prefix) => {
        tlds.slice(0, 2).forEach((tld) => {
          newSuggestions.push({
            name: `${prefix}${cleanName}`,
            tld,
            category: "Prefix",
            available: Math.random() > 0.4,
          })
        })
      })

      suffixes.slice(0, 8).forEach((suffix) => {
        tlds.slice(0, 2).forEach((tld) => {
          newSuggestions.push({
            name: `${cleanName}${suffix}`,
            tld,
            category: "Suffix",
            available: Math.random() > 0.4,
          })
        })
      })

      const creativeTerms = ["stack", "cloud", "data", "sync", "hub"]
      creativeTerms.forEach((term) => {
        tlds.slice(0, 3).forEach((tld) => {
          newSuggestions.push({
            name: `${term}${cleanName}`,
            tld,
            category: "Creative",
            available: Math.random() > 0.5,
          })
        })
      })

      const shuffled = newSuggestions.sort(() => Math.random() - 0.5).slice(0, 48)
      setSuggestions(shuffled)
      setIsGenerating(false)
    }, 1000)
  }

  const copyToClipboard = (domain: string) => {
    navigator.clipboard.writeText(domain)
    toast({
      title: "Copied!",
      description: `${domain} copied to clipboard`,
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Brandable":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "Prefix":
        return "bg-green-500/10 text-green-600 border-green-200"
      case "Suffix":
        return "bg-purple-500/10 text-purple-600 border-purple-200"
      case "Creative":
        return "bg-orange-500/10 text-orange-600 border-orange-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-400" />
            Supabase Domain Generator
          </h1>
          <p className="text-slate-300 text-lg">Generate perfect domain names for your Supabase-powered applications</p>
        </div>

        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-white">Project Details</CardTitle>
            <CardDescription className="text-slate-300">
              Enter your project name to generate domain suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter your project name (e.g., myapp, dashboard, api)"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                onKeyPress={(e) => e.key === "Enter" && generateDomains()}
              />
              <Button
                onClick={generateDomains}
                disabled={isGenerating}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8"
              >
                {isGenerating ? (
                  <>
                    <Shuffle className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Domains
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {suggestions.length > 0 && (
          <div className="space-y-6">
            {["Brandable", "Prefix", "Suffix", "Creative"].map((category) => {
              const categoryDomains = suggestions.filter((s) => s.category === category)
              if (categoryDomains.length === 0) return null

              return (
                <Card key={category} className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Badge className={getCategoryColor(category)}>{category}</Badge>
                      <span className="text-slate-300 text-sm font-normal">({categoryDomains.length} suggestions)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {categoryDomains.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border transition-all hover:scale-105 cursor-pointer ${
                            suggestion.available
                              ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                              : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                          }`}
                          onClick={() => copyToClipboard(suggestion.name + suggestion.tld)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium truncate">
                              {suggestion.name}
                              {suggestion.tld}
                            </span>
                            <Copy className="w-4 h-4 text-slate-400 hover:text-white transition-colors" />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                suggestion.available ? "text-green-400 border-green-400" : "text-red-400 border-red-400"
                              }`}
                            >
                              {suggestion.available ? "Available" : "Taken"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {suggestions.length === 0 && (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate</h3>
              <p className="text-slate-300">
                Enter your project name above and click "Generate Domains" to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
