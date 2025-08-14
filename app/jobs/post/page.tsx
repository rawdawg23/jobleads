"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Wrench, Car, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface VehicleData {
  make: string
  model: string
  year: number
  engineSize: string
  fuelType: string
  colour: string
}

export default function PostJobPage() {
  const { user, loading, isCustomer } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    registration: "",
    postcode: "",
    serviceType: "",
    description: "",
    requiredTools: [] as string[],
  })
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [dvlaLoading, setDvlaLoading] = useState(false)
  const [dvlaError, setDvlaError] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isCustomer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isCustomer, router])

  const lookupVehicle = async () => {
    if (!formData.registration) return

    setDvlaLoading(true)
    setDvlaError("")
    setVehicleData(null)

    try {
      const response = await fetch("/api/dvla/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration: formData.registration }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to lookup vehicle")
      }

      setVehicleData(data.vehicle)
      setStep(2)
    } catch (err) {
      setDvlaError(err instanceof Error ? err.message : "Failed to lookup vehicle")
    } finally {
      setDvlaLoading(false)
    }
  }

  const handleToolToggle = (toolId: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredTools: prev.requiredTools.includes(toolId)
        ? prev.requiredTools.filter((id) => id !== toolId)
        : [...prev.requiredTools, toolId],
    }))
  }

  const submitJob = async () => {
    setSubmitLoading(true)
    setError("")

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          vehicleData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create job")
      }

      // Redirect to payment page
      router.push(`/jobs/${data.jobId}/payment`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job")
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
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
            <span className="text-2xl font-bold text-slate-900">ECU Remap Pro</span>
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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Post ECU Remapping Job</h1>
          <p className="text-slate-600">Create a job posting for £5 and get matched with local dealers</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}
            >
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? "bg-blue-600" : "bg-slate-200"}`} />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}
            >
              3
            </div>
          </div>
        </div>

        {/* Step 1: Vehicle Lookup */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Vehicle Details
              </CardTitle>
              <CardDescription>Enter your vehicle registration for automatic data lookup via DVLA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dvlaError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{dvlaError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="registration">Vehicle Registration</Label>
                <Input
                  id="registration"
                  placeholder="e.g. AB12 CDE"
                  value={formData.registration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registration: e.target.value.toUpperCase() }))}
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">Your Postcode</Label>
                <Input
                  id="postcode"
                  placeholder="e.g. SW1A 1AA"
                  value={formData.postcode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                  className="uppercase"
                />
              </div>

              <Button
                onClick={lookupVehicle}
                disabled={!formData.registration || !formData.postcode || dvlaLoading}
                className="w-full"
              >
                {dvlaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lookup Vehicle Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Job Details */}
        {step === 2 && vehicleData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Vehicle Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Make:</span> {vehicleData.make}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {vehicleData.model}
                  </div>
                  <div>
                    <span className="font-medium">Year:</span> {vehicleData.year}
                  </div>
                  <div>
                    <span className="font-medium">Engine:</span> {vehicleData.engineSize}
                  </div>
                  <div>
                    <span className="font-medium">Fuel:</span> {vehicleData.fuelType}
                  </div>
                  <div>
                    <span className="font-medium">Colour:</span> {vehicleData.colour}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you need done, any specific requirements, and when you'd like the work completed..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Required Tools (Optional)</Label>
                  <p className="text-sm text-slate-600 mb-3">
                    Select specific tools if you know what's needed for your vehicle
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "KESS V2",
                      "KTAG",
                      "CMD Flash",
                      "MPPS V21",
                      "Galletto 1260",
                      "BDM100",
                      "Dimsport New Genius",
                      "AutoTuner",
                    ].map((tool) => (
                      <div key={tool} className="flex items-center space-x-2">
                        <Checkbox
                          id={tool}
                          checked={formData.requiredTools.includes(tool)}
                          onCheckedChange={() => handleToolToggle(tool)}
                        />
                        <Label htmlFor={tool} className="text-sm">
                          {tool}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.serviceType || !formData.description}
                    className="flex-1"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Job Posting Fee
              </CardTitle>
              <CardDescription>Pay £5 to post your job and get matched with local dealers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Job Summary</h3>
                <div className="space-y-1 text-sm text-slate-600">
                  <div>
                    Vehicle: {vehicleData?.make} {vehicleData?.model} ({vehicleData?.year})
                  </div>
                  <div>Service: {formData.serviceType.replace("_", " ").toUpperCase()}</div>
                  <div>Location: {formData.postcode}</div>
                  {formData.requiredTools.length > 0 && (
                    <div>
                      Tools:{" "}
                      {formData.requiredTools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="mr-1 text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-medium">
                  <span>Job Posting Fee:</span>
                  <span>£5.00</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  This fee covers job posting and matching with verified dealers in your area
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 bg-transparent">
                  Back
                </Button>
                <Button onClick={submitJob} disabled={submitLoading} className="flex-1">
                  {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post Job & Pay £5
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
