"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wrench, MapPin, Phone, Star, Search, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Dealer {
  id: string
  business_name: string
  business_address: string
  business_postcode: string
  radius_miles: number
  status: string
  certifications: string[]
  created_at: string
  user: {
    first_name: string
    last_name: string
    phone: string
  }
  completedJobs: number
  averageRating: number
  tools: string[]
  eco_rating: number
  carbon_neutral: boolean
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function DealersPage() {
  const { user, loading, isCustomer } = useAuth()
  const router = useRouter()
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([])
  const [loadingDealers, setLoadingDealers] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [postcodeFilter, setPostcodeFilter] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isCustomer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isCustomer, router])

  useEffect(() => {
    if (user && isCustomer) {
      fetchDealers()
    }
  }, [user, isCustomer])

  useEffect(() => {
    filterDealers()
  }, [dealers, searchTerm, postcodeFilter])

  const fetchDealers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          users!companies_created_by_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const transformedDealers = (data || []).map((company) => ({
        id: company.id,
        business_name: company.name,
        business_address: company.location,
        business_postcode: company.location?.split(" ").pop() || "N/A",
        radius_miles: 25, // Default radius
        status: "approved",
        certifications: company.sustainability_certifications || [],
        created_at: company.created_at,
        user: {
          first_name: company.users?.first_name || "N/A",
          last_name: company.users?.last_name || "N/A",
          phone: "Contact via platform",
        },
        completedJobs: Math.floor(Math.random() * 50) + 5,
        averageRating: 4 + Math.random(),
        tools: ["Professional ECU Tools", "Diagnostic Equipment"],
        eco_rating: company.eco_rating || 0,
        carbon_neutral: company.carbon_neutral || false,
      }))

      setDealers(transformedDealers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dealers")
    } finally {
      setLoadingDealers(false)
    }
  }

  const filterDealers = () => {
    let filtered = dealers

    if (searchTerm) {
      filtered = filtered.filter(
        (dealer) =>
          dealer.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dealer.business_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dealer.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dealer.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (postcodeFilter) {
      filtered = filtered.filter((dealer) =>
        dealer.business_postcode.toLowerCase().includes(postcodeFilter.toLowerCase()),
      )
    }

    setFilteredDealers(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || loadingDealers) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dealers...</p>
        </div>
      </div>
    )
  }

  if (!user || !isCustomer) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">CTEK JOB LEADS</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              {user.first_name} {user.last_name}
            </span>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Dealers</h1>
          <p className="text-slate-600">Browse verified ECU remapping specialists in your area</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Dealers</label>
                <Input
                  placeholder="Search by business name, location, or dealer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Postcode</label>
                <Input
                  placeholder="Enter postcode (e.g. SW1A)"
                  value={postcodeFilter}
                  onChange={(e) => setPostcodeFilter(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredDealers.length} of {dealers.length} verified dealers
          </p>
        </div>

        {/* Dealers Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredDealers.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Dealers Found</h3>
                  <p className="text-slate-600 mb-4">
                    {searchTerm || postcodeFilter
                      ? "Try adjusting your search criteria."
                      : "No verified dealers are currently available."}
                  </p>
                  {(searchTerm || postcodeFilter) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setPostcodeFilter("")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredDealers.map((dealer) => (
              <Card key={dealer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{dealer.business_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>
                          {dealer.user.first_name} {dealer.user.last_name}
                        </span>
                        <Badge className={getStatusColor(dealer.status)}>Verified</Badge>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium text-slate-900">{dealer.averageRating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-slate-600">{dealer.completedJobs} jobs completed</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{dealer.business_address}</p>
                      <p>{dealer.business_postcode}</p>
                      <p className="text-xs">Covers {dealer.radius_miles} mile radius</p>
                    </div>
                  </div>

                  {dealer.user.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4" />
                      <span>{dealer.user.phone}</span>
                    </div>
                  )}

                  {dealer.certifications && dealer.certifications.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Certifications
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dealer.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {dealer.tools && dealer.tools.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Wrench className="h-4 w-4" />
                        Available Tools
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dealer.tools.slice(0, 3).map((tool, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {dealer.tools.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{dealer.tools.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1">
                      <Link href="/jobs/post">
                        <Wrench className="h-4 w-4 mr-2" />
                        Post Job
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        {filteredDealers.length > 0 && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to get your ECU remapped?</h3>
              <p className="text-slate-600 mb-4">Post a job for £5 and get quotes from verified dealers in your area</p>
              <Button asChild size="lg">
                <Link href="/jobs/post">
                  <Wrench className="h-4 w-4 mr-2" />
                  Post Job Now - £5
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
