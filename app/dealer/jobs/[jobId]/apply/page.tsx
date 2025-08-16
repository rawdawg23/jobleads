"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Car, MapPin, Wrench, Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default function ApplyJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [dealer, setDealer] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const { jobId } = await params

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: dealerData } = await supabase.from("dealers").select("*").eq("user_id", user.id).single()
        if (!dealerData || dealerData.status !== "active") {
          router.push("/dealer/jobs")
          return
        }
        setDealer(dealerData)

        const { data: jobData } = await supabase
          .from("jobs")
          .select(`
            *,
            users!jobs_customer_id_fkey(first_name, last_name, email)
          `)
          .eq("id", jobId)
          .single()

        if (!jobData || jobData.status !== "open") {
          router.push("/dealer/jobs")
          return
        }
        setJob(jobData)

        const { data: existingApplication } = await supabase
          .from("job_applications")
          .select("id")
          .eq("job_id", jobData.id)
          .eq("dealer_id", dealerData.id)
          .single()

        if (existingApplication) {
          router.push(`/dealer/jobs/${jobData.id}`)
          return
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params, router, supabase])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !job || !dealer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-red-600">{error || "Job not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Apply for Job</h1>
        <p className="text-gray-600">Submit your quote and proposal</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Vehicle</h4>
              <p>
                {job.vehicle_make} {job.vehicle_model} ({job.vehicle_year})
              </p>
              <p className="text-sm text-gray-600">
                {job.engine_size}L {job.fuel_type} • {job.vehicle_mileage?.toLocaleString()} miles
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">ECU Information</h4>
              <p>
                {job.ecu_brand} {job.ecu_model}
              </p>
              {job.ecu_part_number && <p className="text-sm text-gray-600">Part: {job.ecu_part_number}</p>}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Services Required</h4>
              <div className="flex flex-wrap gap-1">
                {job.service_types?.map((service: string) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            {job.required_tools && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-1">
                  <Wrench className="h-4 w-4" />
                  Required Tools
                </h4>
                <p className="text-sm">{job.required_tools.join(", ")}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </h4>
              <p>{job.customer_postcode}</p>
            </div>

            {job.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-600">{job.description}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Customer Budget</h4>
              <p className="text-lg font-bold text-green-600">£{job.budget}</p>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form action="/api/dealer/jobs/apply" method="POST" className="space-y-4">
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="dealerId" value={dealer.id} />

              <div>
                <label htmlFor="quote" className="block text-sm font-medium mb-1">
                  Your Quote (£)
                </label>
                <Input
                  id="quote"
                  name="quote"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter your quote"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Customer budget: £{job.budget}</p>
              </div>

              <div>
                <label htmlFor="estimated_duration" className="block text-sm font-medium mb-1">
                  Estimated Duration (hours)
                </label>
                <Input
                  id="estimated_duration"
                  name="estimated_duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="e.g. 2.5"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message to Customer
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Introduce yourself and explain your approach..."
                  required
                />
              </div>

              <div>
                <label htmlFor="available_tools" className="block text-sm font-medium mb-1">
                  Your Available Tools
                </label>
                <Textarea
                  id="available_tools"
                  name="available_tools"
                  rows={2}
                  placeholder="List the ECU tools you have available..."
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium mb-1">
                  Relevant Experience
                </label>
                <Textarea
                  id="experience"
                  name="experience"
                  rows={3}
                  placeholder="Describe your experience with this type of work..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Submit Application
                </Button>
                <Button type="button" variant="outline" asChild>
                  <a href="/dealer/jobs">Cancel</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
