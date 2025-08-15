"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Search, Zap, Car, Settings } from "lucide-react"

const TLD_OPTIONS = [".com", ".co.uk", ".net", ".org", ".io", ".tech", ".auto", ".car"]

const ECU_KEYWORDS = [
  "ecu",
  "remap",
  "tune",
  "chip",
  "boost",
  "power",
  "torque",
  "performance",
  "stage",
  "dyno",
  "turbo",
  "engine",
  "auto",
  "car",
  "motor",
  "speed",
  "pro",
  "max",
  "plus",
  "elite",
  "premium",
  "custom",
  "specialist",
]

const PREFIXES = ["get", "my", "the", "pro", "auto", "fast", "quick", "smart", "best", "top"]
const SUFFIXES = ["hub", "zone", "lab", "works", "garage", "tuning", "performance", "solutions", "services", "experts"]

export default function DomainGeneratorPage() {
  const [keywords, setKeywords] = useState("")
  const [generatedDomains, setGeneratedDomains] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDomains = () => {
    setIsGenerating(true)

    setTimeout(() => {
      const inputKeywords = keywords
        .toLowerCase()
        .split(" ")
        .filter((k) => k.length > 0)
      const allKeywords = [...inputKeywords, ...ECU_KEYWORDS]
      const domains = new Set<string>()

      // Brandable combinations
      for (let i = 0; i < 15; i++) {
        const word1 = allKeywords[Math.floor(Math.random() * allKeywords.length)]
        const word2 = allKeywords[Math.floor(Math.random() * allKeywords.length)]
        if (word1 !== word2) {
          domains.add(`${word1}${word2}`)
          domains.add(`${word1}-${word2}`)
        }
      }

      // Prefix + keyword combinations
      for (let i = 0; i < 10; i++) {
        const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)]
        const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)]
        domains.add(`${prefix}${keyword}`)
        domains.add(`${prefix}-${keyword}`)
      }

      // Keyword + suffix combinations
      for (let i = 0; i < 10; i++) {
        const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)]
        const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]
        domains.add(`${keyword}${suffix}`)
        domains.add(`${keyword}-${suffix}`)
      }

      // Creative variations
      inputKeywords.forEach((keyword) => {
        domains.add(`${keyword}pro`)
        domains.add(`${keyword}hub`)
        domains.add(`${keyword}zone`)
        domains.add(`my${keyword}`)
        domains.add(`get${keyword}`)
      })

      setGeneratedDomains(Array.from(domains).slice(0, 50))
      setIsGenerating(false)
    }, 1000)
  }

  const copyToClipboard = (domain: string, tld: string) => {
    navigator.clipboard.writeText(`${domain}${tld}`)
  }

  const getRandomColor = () => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Auto Domain Generator</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Generate perfect domain names for your ECU remapping and automotive business
          </p>
        </div>

        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-yellow-400" />
              Enter Keywords
            </CardTitle>
            <CardDescription className="text-slate-300">
              Enter keywords related to your business (e.g., "performance tuning", "eco remap", "stage 2")
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter keywords separated by spaces..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                onKeyPress={(e) => e.key === "Enter" && generateDomains()}
              />
              <Button
                onClick={generateDomains}
                disabled={isGenerating}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Generate"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-400">Quick suggestions:</span>
              {["performance", "eco", "stage2", "turbo", "custom"].map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                  onClick={() => setKeywords((prev) => (prev ? `${prev} ${suggestion}` : suggestion))}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {generatedDomains.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Car className="h-5 w-5 text-yellow-400" />
                Generated Domains ({generatedDomains.length})
              </CardTitle>
              <CardDescription className="text-slate-300">
                Click on any domain + TLD combination to copy to clipboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {generatedDomains.map((domain, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium text-lg">{domain}</span>
                      <Badge className={getRandomColor()}>{domain.length} chars</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TLD_OPTIONS.map((tld) => (
                        <Button
                          key={tld}
                          variant="outline"
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-yellow-500/20 hover:border-yellow-500/30"
                          onClick={() => copyToClipboard(domain, tld)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {domain}
                          {tld}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-400" />
              Domain Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-slate-300">
              <div>
                <h4 className="font-semibold text-white mb-2">Best Practices:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Keep it short and memorable</li>
                  <li>• Avoid hyphens if possible</li>
                  <li>• Choose .com for global reach</li>
                  <li>• Use .co.uk for UK-focused business</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">ECU Industry Tips:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Include "remap" or "tune" for SEO</li>
                  <li>• "Performance" appeals to enthusiasts</li>
                  <li>• "Eco" targets fuel economy customers</li>
                  <li>• Location-based names build trust</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
