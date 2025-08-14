"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Car, Clock, Search, Filter, Navigation } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Job {
  id: string
  registration: string
  make: string
  model: string
  year: number
  service_type: string
  description: string
  customer_postcode: string
  distance_miles: number
  created_at: string
  status: string
  customer: {
    first_name: string
    last_name: string
  }
}

export default function DealerJobsPage() {
  const { user, loading, isDealer } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [filters, setFilters] = useState({
    serviceType: "all",
    maxDistance: "all",
    search: "",
  })
  const [dealerLocation, setDealerLocation] = useState<string>("")

  useEffect(() => {
    if (!loading && (!user || !isDealer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isDealer, router])

  useEffect(() => {
    if (user && isDealer) {
      fetchAvailableJobs()
    }
  }, [user, isDealer])

  useEffect(() => {
    filterJobs()
  }, [jobs, filters])

  const fetchAvailableJobs = async () => {
    try {
      const response = await fetch("/api/dealer/jobs")
      const data = await response.json()

      if (response.ok) {
        setJobs(data.jobs)
        setDealerLocation(data.dealerLocation)
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    if (filters.serviceType !== "all") {
      filtered = filtered.filter((job) => job.service_type === filters.serviceType)
    }

    if (filters.maxDistance !== "all") {
      const maxDist = Number.parseInt(filters.maxDistance)
      filtered = filtered.filter((job) => job.distance_miles <= maxDist)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.registration.toLowerCase().includes(search) ||
          job.make.toLowerCase().includes(search) ||
          job.model.toLowerCase().includes(search) ||
          job.customer_postcode.toLowerCase().includes(search) ||
          job.description.toLowerCase().includes(search),
      )
    }

    // Sort by distance (closest first)
    filtered.sort((a, b) => a.distance_miles - b.distance_miles)

    setFilteredJobs(filtered)
  }

  const applyForJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/dealer/jobs/${jobId}/apply`, {
        method: "POST",
      })

      if (response.ok) {
        // Refresh jobs list
        await fetchAvailableJobs()
      }
    } catch (error) {
      console.error("Failed to apply for job:", error)
    }
  }

  const getServiceTypeBadge = (serviceType: string) => {
    const colors = {
      stage1_remap: "bg-blue-100 text-blue-800",
      stage2_remap: "bg-purple-100 text-purple-800",
      economy_remap: "bg-green-100 text-green-800",
      dpf_delete: "bg-orange-100 text-orange-800",
      egr_delete: "bg-red-100 text-red-800",
      adblue_delete: "bg-yellow-100 text-yellow-800",
      custom_remap: "bg-slate-100 text-slate-800",
    }

    return (
      <Badge className={colors[serviceType as keyof typeof colors] || "bg-slate-100 text-slate-800"}>
        {serviceType.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getDistanceBadge = (distance: number) => {
    if (distance <= 15) return <Badge className="bg-green-100 text-green-800">{distance.toFixed(1)} miles</Badge>
    if (distance <= 30) return <Badge className="bg-yellow-100 text-yellow-800">{distance.toFixed(1)} miles</Badge>
    return <Badge className="bg-orange-100 text-orange-800">{distance.toFixed(1)} miles</Badge>
  }

  if (loading || loadingJobs) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Finding jobs in your area...</p>
        </div>
      </div>
    )
  }

  if (!user || !isDealer) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Available Jobs</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                <Navigation className="h-4 w-4" />
                <span>Your location: {dealerLocation}</span>
              </div>
              <Button variant="outline" asChild className="border-gray-300 bg-transparent">
                <Link href="/dealer/applications">My Applications</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Available Jobs</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Within 20 Miles</p>
                  <p className="text-2xl font-bold text-green-600">
                    {jobs.filter((job) => job.distance_miles <= 20).length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Distance</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {jobs.length > 0
                      ? (jobs.reduce((sum, job) => sum + job.distance_miles, 0) / jobs.length).toFixed(1)
                      : "0"}{" "}
                    mi
                  </p>
                </div>
                <Navigation className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select
                  value={filters.serviceType}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, serviceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="stage1_remap">Stage 1 Remap</SelectItem>
                    <SelectItem value="stage2_remap">Stage 2 Remap</SelectItem>
                    <SelectItem value="economy_remap">Economy Remap</SelectItem>
                    <SelectItem value="dpf_delete">DPF Delete</SelectItem>
                    <SelectItem value="egr_delete">EGR Delete</SelectItem>
                    <SelectItem value="adblue_delete">AdBlue Delete</SelectItem>
                    <SelectItem value="custom_remap">Custom Remap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Distance</Label>
                <Select
                  value={filters.maxDistance}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, maxDistance: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Distance</SelectItem>
                    <SelectItem value="15">Within 15 miles</SelectItem>
                    <SelectItem value="30">Within 30 miles</SelectItem>
                    <SelectItem value="45">Within 45 miles</SelectItem>
                    <SelectItem value="60">Within 60 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by registration, make, model, or postcode..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                  <p className="text-slate-600">
                    {jobs.length === 0
                      ? "There are no available jobs in your service area at the moment."
                      : "Try adjusting your filters to see more jobs."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-lg">
                            {job.make} {job.model} ({job.year})
                          </span>
                        </div>
                        <Badge variant="outline">{job.registration}</Badge>
                        {getServiceTypeBadge(job.service_type)}
                        {getDistanceBadge(job.distance_miles)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4" />
                          <span>Customer location: {job.customer_postcode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-1">Job Description:</p>
                        <p className="text-slate-900">{job.description}</p>
                      </div>

                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Customer:</span> {job.customer.first_name}{" "}
                        {job.customer.last_name}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <Button onClick={() => applyForJob(job.id)} className="whitespace-nowrap">
                        Apply for Job
                      </Button>
                      <Button variant="outline" size="sm" asChild className="bg-transparent">
                        <Link href={`/dealer/jobs/${job.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Location Notice */}
        <Alert className="mt-8">
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            Jobs are filtered based on your business location and service radius. Only jobs within your configured
            service area are shown. You can update your service radius in your dealer profile.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
