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
import { Progress } from "@/components/ui/progress"
import { Wrench, Car, CreditCard, Loader2, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface VehicleData {
  make: string
  model: string
  year: number
  engineSize: string
  fuelType: string
  colour: string
  co2Emissions?: number
  euroStatus?: string
  taxStatus?: string
  motStatus?: string
  ecuInfo?: {
    ecuType: string
    readMethod: string
    estimatedPower: string
    estimatedTorque: string
    remapPotential: string
    recommendedTools: string[]
    complexity: string
    estimatedTime: string
    warranty: string
  }
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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
    budget: "",
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

  const getProgressPercentage = () => {
    return (step / 3) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-gray-800 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isCustomer) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CTEK JOB LEADS</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {user.first_name} {user.last_name}
              </div>
              <Button variant="outline" asChild className="border-gray-300 bg-transparent">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post ECU Remapping Job</h1>
          <p className="text-xl text-gray-600">Connect with certified dealers in your area for just £5</p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Step {step} of 3</span>
            <span className="text-sm font-medium text-gray-600">{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-3 mb-6" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  step >= 1 ? "bg-gray-800 text-white shadow-lg" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
              </div>
              <span className="text-sm font-medium text-gray-600 mt-2">Vehicle Details</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  step >= 2 ? "bg-gray-800 text-white shadow-lg" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > 2 ? <CheckCircle className="h-5 w-5" /> : "2"}
              </div>
              <span className="text-sm font-medium text-gray-600 mt-2">Service Details</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  step >= 3 ? "bg-gray-800 text-white shadow-lg" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step >= 3 ? <CheckCircle className="h-5 w-5" /> : "3"}
              </div>
              <span className="text-sm font-medium text-gray-600 mt-2">Payment</span>
            </div>
          </div>
        </div>

        {/* Step 1: Vehicle Lookup */}
        {step === 1 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                Vehicle Details
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Enter your vehicle registration for automatic data lookup via DVLA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {dvlaError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{dvlaError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="registration" className="text-sm font-semibold text-gray-700">
                  Vehicle Registration
                </Label>
                <Input
                  id="registration"
                  placeholder="e.g. AB12 CDE"
                  value={formData.registration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registration: e.target.value.toUpperCase() }))}
                  className="h-12 text-lg font-mono uppercase border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="postcode" className="text-sm font-semibold text-gray-700">
                  Your Postcode
                </Label>
                <Input
                  id="postcode"
                  placeholder="e.g. SW1A 1AA"
                  value={formData.postcode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                  className="h-12 text-lg font-mono uppercase border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <Button
                onClick={lookupVehicle}
                disabled={!formData.registration || !formData.postcode || dvlaLoading}
                className="w-full h-14 text-lg font-semibold bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {dvlaLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Looking up vehicle...
                  </>
                ) : (
                  <>
                    <Car className="mr-3 h-5 w-5" />
                    Lookup Vehicle Data
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>We use official DVLA data to automatically fill in your vehicle details</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Job Details */}
        {step === 2 && vehicleData && (
          <div className="space-y-8">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Vehicle Data */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Vehicle Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Make:</span>
                        <span className="text-gray-900 font-semibold">{vehicleData.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Model:</span>
                        <span className="text-gray-900 font-semibold">{vehicleData.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Year:</span>
                        <span className="text-gray-900 font-semibold">{vehicleData.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Engine:</span>
                        <span className="text-gray-900 font-semibold">{vehicleData.engineSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Fuel Type:</span>
                        <Badge variant={vehicleData.fuelType === "DIESEL" ? "default" : "secondary"}>
                          {vehicleData.fuelType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Colour:</span>
                        <span className="text-gray-900 font-semibold">{vehicleData.colour}</span>
                      </div>
                      {vehicleData.co2Emissions && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">CO2 Emissions:</span>
                          <span className="text-gray-900 font-semibold">{vehicleData.co2Emissions}g/km</span>
                        </div>
                      )}
                      {vehicleData.euroStatus && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Euro Status:</span>
                          <Badge variant="outline">{vehicleData.euroStatus}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ECU Information */}
                  {vehicleData.ecuInfo && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">ECU & Remapping Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">ECU Type:</span>
                          <span className="text-blue-600 font-semibold">{vehicleData.ecuInfo.ecuType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Read Method:</span>
                          <span className="text-gray-900 font-semibold">{vehicleData.ecuInfo.readMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Est. Power:</span>
                          <span className="text-green-600 font-semibold">{vehicleData.ecuInfo.estimatedPower}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Est. Torque:</span>
                          <span className="text-green-600 font-semibold">{vehicleData.ecuInfo.estimatedTorque}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Remap Potential:</span>
                          <span className="text-orange-600 font-semibold">{vehicleData.ecuInfo.remapPotential}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Complexity:</span>
                          <Badge variant={vehicleData.ecuInfo.complexity === "Medium-High" ? "destructive" : "default"}>
                            {vehicleData.ecuInfo.complexity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Est. Time:</span>
                          <span className="text-gray-900 font-semibold">{vehicleData.ecuInfo.estimatedTime}</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">Recommended Tools:</h5>
                        <div className="flex flex-wrap gap-1">
                          {vehicleData.ecuInfo.recommendedTools.map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-purple-600" />
                  </div>
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="serviceType" className="text-sm font-semibold text-gray-700">
                    Service Type
                  </Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
                  >
                    <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select the service you need" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stage1_remap">
                        <div className="flex flex-col">
                          <span className="font-medium">Stage 1 Remap</span>
                          <span className="text-sm text-gray-500">Basic performance enhancement</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="stage2_remap">
                        <div className="flex flex-col">
                          <span className="font-medium">Stage 2 Remap</span>
                          <span className="text-sm text-gray-500">Advanced performance with modifications</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="economy_remap">
                        <div className="flex flex-col">
                          <span className="font-medium">Economy Remap</span>
                          <span className="text-sm text-gray-500">Improved fuel efficiency</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dpf_delete">
                        <div className="flex flex-col">
                          <span className="font-medium">DPF Delete</span>
                          <span className="text-sm text-gray-500">Diesel particulate filter removal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="egr_delete">
                        <div className="flex flex-col">
                          <span className="font-medium">EGR Delete</span>
                          <span className="text-sm text-gray-500">Exhaust gas recirculation removal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="adblue_delete">
                        <div className="flex flex-col">
                          <span className="font-medium">AdBlue Delete</span>
                          <span className="text-sm text-gray-500">SCR system removal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom_remap">
                        <div className="flex flex-col">
                          <span className="font-medium">Custom Remap</span>
                          <span className="text-sm text-gray-500">Bespoke tuning solution</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="budget" className="text-sm font-semibold text-gray-700">
                    Your Budget (£)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g. 300"
                    value={formData.budget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                    className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <p className="text-sm text-gray-500">This helps dealers provide accurate quotes</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Job Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you need done, any specific requirements, and when you'd like the work completed..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Required Tools (Optional)</Label>
                  <p className="text-sm text-gray-600">
                    Select specific tools if you know what's needed for your vehicle
                  </p>
                  <div className="grid grid-cols-2 gap-3">
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
                      <div key={tool} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          id={tool}
                          checked={formData.requiredTools.includes(tool)}
                          onCheckedChange={() => handleToolToggle(tool)}
                        />
                        <Label htmlFor={tool} className="text-sm font-medium">
                          {tool}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 border-gray-300 bg-transparent"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.serviceType || !formData.description}
                    className="flex-1 h-12 bg-gray-800 hover:bg-gray-900 text-white"
                  >
                    Continue to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-900">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                Job Posting Fee
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Pay £5 to post your job and get matched with certified dealers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Job Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold text-gray-900">
                      {vehicleData?.make} {vehicleData?.model} ({vehicleData?.year})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Service:</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {formData.serviceType.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-900">{formData.postcode}</span>
                  </div>
                  {formData.budget && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-semibold text-green-600">£{formData.budget}</span>
                    </div>
                  )}
                  {formData.requiredTools.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600 text-sm">Required Tools:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.requiredTools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center text-2xl font-bold mb-2">
                  <span className="text-gray-900">Job Posting Fee:</span>
                  <span className="text-green-600">£5.00</span>
                </div>
                <p className="text-gray-600">This fee covers job posting, dealer matching, and platform services</p>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 h-12 border-gray-300 bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={submitJob}
                  disabled={submitLoading}
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating job...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Post Job & Pay £5
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
