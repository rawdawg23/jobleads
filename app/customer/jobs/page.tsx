"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, Car, Clock, CheckCircle, MessageSquare, MapPin, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Job {
  id: string
  registration: string
  make: string
  model: string
  year: number
  service_type: string
  status: string
  customer_price: number
  dealer_quote: number
  created_at: string
  accepted_at: string
  started_at: string
  completed_at: string
  description: string
  customer_postcode: string
  applications: JobApplication[]
}

interface JobApplication {
  id: string
  dealer_id: string
  quote: number
  estimated_duration: number
  message: string
  created_at: string
  dealer: {
    business_name: string
    business_address: string
    user: {
      first_name: string
      last_name: string
      phone: string
    }
  }
}

export default function CustomerJobsPage() {
  const { user, loading, isCustomer } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isCustomer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isCustomer, router])

  useEffect(() => {
    if (user && isCustomer) {
      fetchJobs()
    }
  }, [user, isCustomer])

  const fetchJobs = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          applications:job_applications(
            id,
            dealer_id,
            quote,
            estimated_duration,
            message,
            created_at,
            dealer:dealers(
              business_name,
              business_address,
              user:users(
                first_name,
                last_name,
                phone
              )
            )
          )
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs")
    } finally {
      setLoadingJobs(false)
    }
  }

  const acceptQuote = async (jobId: string, applicationId: string, dealerId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("jobs")
        .update({
          status: "accepted",
          dealer_id: dealerId,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", jobId)

      if (error) throw error
      fetchJobs() // Refresh jobs
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept quote")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatServiceType = (serviceType: string) => {
    return serviceType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading || loadingJobs) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your jobs...</p>
        </div>
      </div>
    )
  }

  if (!user || !isCustomer) {
    return null
  }

  const activeJobs = jobs.filter((job) => ["open", "accepted", "in_progress"].includes(job.status))
  const completedJobs = jobs.filter((job) => ["completed", "cancelled"].includes(job.status))

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Jobs</h1>
            <p className="text-slate-600">Manage your ECU remapping jobs and dealer applications</p>
          </div>
          <Button asChild>
            <Link href="/jobs/post">
              <Wrench className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Jobs ({activeJobs.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Jobs</h3>
                  <p className="text-slate-600 mb-4">You don't have any active jobs at the moment.</p>
                  <Button asChild>
                    <Link href="/jobs/post">Post Your First Job</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">
                            {job.make} {job.model} ({job.year})
                          </CardTitle>
                          <CardDescription>
                            {job.registration} • {formatServiceType(job.service_type)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ").toUpperCase()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600">{job.description}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.customer_postcode}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {job.applications && job.applications.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Dealer Applications ({job.applications.length})</h4>
                        <div className="space-y-3">
                          {job.applications.map((application) => (
                            <div key={application.id} className="bg-slate-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h5 className="font-medium">{application.dealer.business_name}</h5>
                                  <p className="text-sm text-slate-600">
                                    {application.dealer.user.first_name} {application.dealer.user.last_name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">£{application.quote}</div>
                                  <div className="text-sm text-slate-600">
                                    {application.estimated_duration}h estimated
                                  </div>
                                </div>
                              </div>

                              <p className="text-sm text-slate-600 mb-3">{application.message}</p>

                              <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                <MapPin className="h-4 w-4" />
                                {application.dealer.business_address}
                              </div>

                              {job.status === "open" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => acceptQuote(job.id, application.id, application.dealer_id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept Quote
                                  </Button>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/messages/${job.id}`}>
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Message
                                    </Link>
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.applications.length === 0 && job.status === "open" && (
                      <div className="text-center py-4 text-slate-600">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p>Waiting for dealer applications...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Completed Jobs</h3>
                  <p className="text-slate-600">Your completed jobs will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              completedJobs.map((job) => (
                <Card key={job.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-slate-500" />
                        <div>
                          <CardTitle className="text-lg">
                            {job.make} {job.model} ({job.year})
                          </CardTitle>
                          <CardDescription>
                            {job.registration} • {formatServiceType(job.service_type)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(job.status)}>{job.status.replace("_", " ").toUpperCase()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Completed {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : "N/A"}
                      </div>
                      {job.dealer_quote && (
                        <div className="flex items-center gap-1">
                          <span>Final Price: £{job.dealer_quote}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
