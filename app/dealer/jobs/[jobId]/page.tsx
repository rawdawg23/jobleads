"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, MapPin, Clock, User, Wrench, ArrowLeft, Navigation } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface JobDetails {
  id: string
  registration: string
  make: string
  model: string
  year: number
  engine_size: string
  fuel_type: string
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

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function JobDetailsPage() {
  const { user, loading, isDealer } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [job, setJob] = useState<JobDetails | null>(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const [applying, setApplying] = useState(false)
  const [quote, setQuote] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isDealer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isDealer, router])

  useEffect(() => {
    if (user && isDealer && jobId) {
      fetchJobDetails()
    }
  }, [user, isDealer, jobId])

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/dealer/jobs/${jobId}`)
      const data = await response.json()

      if (response.ok) {
        setJob(data.job)
        setMessage("I am interested in this job and available to complete the work.")
      } else {
        setError(data.error || "Failed to load job details")
      }
    } catch (err) {
      setError("Failed to load job details")
    } finally {
      setLoadingJob(false)
    }
  }

  const submitApplication = async () => {
    if (!quote || Number.parseFloat(quote) <= 0) {
      setError("Please enter a valid quote amount")
      return
    }

    setApplying(true)
    setError("")

    try {
      const response = await fetch(`/api/dealer/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: Number.parseFloat(quote),
          message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Application submitted successfully!")
        setTimeout(() => {
          router.push("/dealer/applications")
        }, 2000)
      } else {
        setError(data.error || "Failed to submit application")
      }
    } catch (err) {
      setError("Failed to submit application")
    } finally {
      setApplying(false)
    }
  }

  if (loading || loadingJob) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button asChild className="w-full mt-4">
              <Link href="/dealer/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dealer/jobs" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Jobs</span>
          </Link>
          <Badge className="bg-blue-100 text-blue-800">{job.distance_miles.toFixed(1)} miles away</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-6 w-6 text-blue-600" />
                  {job.make} {job.model} ({job.year})
                </CardTitle>
                <CardDescription>Registration: {job.registration}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Engine Size:</span> {job.engine_size}
                  </div>
                  <div>
                    <span className="font-medium">Fuel Type:</span> {job.fuel_type}
                  </div>
                  <div>
                    <span className="font-medium">Service Required:</span>{" "}
                    <Badge className="ml-1">{job.service_type.replace("_", " ").toUpperCase()}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Posted:</span> {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-slate-600" />
                    <span>Customer Postcode: {job.customer_postcode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-600" />
                    <span>Distance from your location: {job.distance_miles.toFixed(1)} miles</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <span className="font-medium">Customer:</span> {job.customer.first_name} {job.customer.last_name}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Full contact details will be provided once your application is accepted.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  Apply for Job
                </CardTitle>
                <CardDescription>Submit your quote and message to the customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="quote">Your Quote (£)</Label>
                  <Input
                    id="quote"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 250.00"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    disabled={applying}
                  />
                  <p className="text-sm text-slate-600">Enter your price for this job</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message to Customer</Label>
                  <Textarea
                    id="message"
                    placeholder="Introduce yourself and explain your experience..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    disabled={applying}
                  />
                </div>

                <Button onClick={submitApplication} disabled={applying || !quote} className="w-full">
                  {applying && <Clock className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>

                <div className="text-sm text-slate-600 space-y-1">
                  <p>• Your application will be sent to the customer</p>
                  <p>• You'll be notified if your application is accepted</p>
                  <p>• Customer contact details will be provided upon acceptance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/dealer/jobs">Browse More Jobs</Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/dealer/applications">My Applications</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
