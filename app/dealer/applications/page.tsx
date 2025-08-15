export const dynamic = "force-dynamic"
export const runtime = "nodejs"
;("use client")

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, Car, Clock, CheckCircle, MessageSquare, MapPin, Calendar, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface JobApplication {
  id: string
  quote: number
  estimated_duration: number
  message: string
  created_at: string
  job: {
    id: string
    registration: string
    make: string
    model: string
    year: number
    service_type: string
    status: string
    description: string
    customer_postcode: string
    created_at: string
    customer: {
      first_name: string
      last_name: string
      phone: string
    }
  }
}

export default function DealerApplicationsPage() {
  const { user, loading, isDealer } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isDealer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isDealer, router])

  useEffect(() => {
    if (user && isDealer) {
      fetchApplications()
    }
  }, [user, isDealer])

  const fetchApplications = async () => {
    try {
      const supabase = createClient()

      // First get dealer ID
      const { data: dealerData } = await supabase.from("dealers").select("id").eq("user_id", user.id).single()

      if (!dealerData) {
        setError("Dealer profile not found")
        return
      }

      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job:jobs(
            id,
            registration,
            make,
            model,
            year,
            service_type,
            status,
            description,
            customer_postcode,
            created_at,
            customer:users(
              first_name,
              last_name,
              phone
            )
          )
        `)
        .eq("dealer_id", dealerData.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch applications")
    } finally {
      setLoadingApplications(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatServiceType = (serviceType: string) => {
    return serviceType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading || loadingApplications) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your applications...</p>
        </div>
      </div>
    )
  }

  if (!user || !isDealer) {
    return null
  }

  const pendingApplications = applications.filter((app) => app.job.status === "open")
  const acceptedApplications = applications.filter((app) => ["accepted", "in_progress"].includes(app.job.status))
  const completedApplications = applications.filter((app) => ["completed", "cancelled"].includes(app.job.status))

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
              <Link href="/dealer/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
            <p className="text-slate-600">Track your job applications and manage accepted work</p>
          </div>
          <Button asChild>
            <Link href="/dealer/jobs">
              <Wrench className="h-4 w-4 mr-2" />
              Browse Jobs
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
            <TabsTrigger value="accepted">Active ({acceptedApplications.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedApplications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Pending Applications</h3>
                  <p className="text-slate-600 mb-4">You don't have any pending job applications.</p>
                  <Button asChild>
                    <Link href="/dealer/jobs">Browse Available Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              pendingApplications.map((application) => (
                <Card key={application.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">
                            {application.job.make} {application.job.model} ({application.job.year})
                          </CardTitle>
                          <CardDescription>
                            {application.job.registration} • {formatServiceType(application.job.service_type)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">£{application.quote}</div>
                        <div className="text-sm text-slate-600">{application.estimated_duration}h estimated</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Awaiting Customer Response</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Your application was submitted on {new Date(application.created_at).toLocaleDateString()}. The
                        customer will review and respond soon.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Job Details</h4>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {application.job.customer_postcode}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Posted {new Date(application.job.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{application.job.description}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Your Application</h4>
                        <p className="text-sm text-slate-600">{application.message}</p>
                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">Customer:</span> {application.job.customer.first_name}{" "}
                          {application.job.customer.last_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/messages/${application.job.id}`}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Customer
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-6">
            {acceptedApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Jobs</h3>
                  <p className="text-slate-600">You don't have any accepted jobs at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              acceptedApplications.map((application) => (
                <Card key={application.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <CardTitle className="text-lg">
                            {application.job.make} {application.job.model} ({application.job.year})
                          </CardTitle>
                          <CardDescription>
                            {application.job.registration} • {formatServiceType(application.job.service_type)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(application.job.status)}>
                          {application.job.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <div className="text-lg font-bold text-green-600 mt-1">£{application.quote}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-100 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Job Accepted!</span>
                      </div>
                      <p className="text-sm text-green-700">
                        The customer accepted your quote. Contact them to arrange the work.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Customer Contact</h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">
                              {application.job.customer.first_name} {application.job.customer.last_name}
                            </span>
                          </div>
                          {application.job.customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <a
                                href={`tel:${application.job.customer.phone}`}
                                className="text-blue-600 hover:underline"
                              >
                                {application.job.customer.phone}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {application.job.customer_postcode}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Job Summary</h4>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div>Duration: {application.estimated_duration} hours</div>
                          <div>Your Quote: £{application.quote}</div>
                          <div>Status: {application.job.status.replace("_", " ").toUpperCase()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href={`/messages/${application.job.id}`}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Customer
                        </Link>
                      </Button>
                      {application.job.customer.phone && (
                        <Button variant="outline" asChild>
                          <a href={`tel:${application.job.customer.phone}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            Call Customer
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Completed Jobs</h3>
                  <p className="text-slate-600">Your completed jobs will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              completedApplications.map((application) => (
                <Card key={application.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-slate-500" />
                        <div>
                          <CardTitle className="text-lg">
                            {application.job.make} {application.job.model} ({application.job.year})
                          </CardTitle>
                          <CardDescription>
                            {application.job.registration} • {formatServiceType(application.job.service_type)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(application.job.status)}>
                          {application.job.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <div className="text-lg font-bold text-slate-600 mt-1">£{application.quote}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Completed {new Date(application.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        Customer: {application.job.customer.first_name} {application.job.customer.last_name}
                      </div>
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
