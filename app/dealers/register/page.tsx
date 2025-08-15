"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Wrench, Building, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default function DealerRegisterPage() {
  const { user, loading, isDealer } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    businessPostcode: "",
    vatNumber: "",
    insuranceDetails: "",
    certifications: [] as string[],
    selectedTools: [] as string[],
    radiusMiles: 30,
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")

  const availableTools = [
    { id: "kess-v2", name: "KESS V2", description: "Professional ECU programming tool" },
    { id: "ktag", name: "KTAG", description: "ECU programming via OBD and Bench" },
    { id: "cmd-flash", name: "CMD Flash", description: "Professional ECU flashing tool" },
    { id: "mpps-v21", name: "MPPS V21", description: "Multi-brand ECU chip tuning interface" },
    { id: "galletto-1260", name: "Galletto 1260", description: "OBDII ECU flashing tool" },
    { id: "bdm100", name: "BDM100", description: "ECU programmer via BDM protocol" },
    { id: "dimsport-genius", name: "Dimsport New Genius", description: "Professional ECU remapping tool" },
    { id: "autotuner", name: "AutoTuner", description: "Universal ECU programming tool" },
  ]

  const certificationOptions = [
    "IMI Qualified",
    "City & Guilds Automotive",
    "NVQ Level 3 Vehicle Maintenance",
    "Bosch Certified",
    "Siemens Certified",
    "Continental Certified",
    "Delphi Certified",
    "Other Professional Qualification",
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
    if (!loading && user && isDealer) {
      router.push("/dealer/dashboard")
    }
  }, [user, loading, isDealer, router])

  const handleToolToggle = (toolId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTools: prev.selectedTools.includes(toolId)
        ? prev.selectedTools.filter((id) => id !== toolId)
        : [...prev.selectedTools, toolId],
    }))
  }

  const handleCertificationToggle = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }))
  }

  const submitApplication = async () => {
    setSubmitLoading(true)
    setError("")

    try {
      const response = await fetch("/api/dealers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application")
      }

      // Redirect to payment page
      router.push(`/dealers/${data.dealerId}/payment`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application")
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Become a Dealer</h1>
          <p className="text-slate-600">Join our network of professional ECU remapping specialists</p>
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

        {/* Step 1: Business Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Business Information
              </CardTitle>
              <CardDescription>Tell us about your ECU remapping business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g. ABC Tuning Ltd"
                  value={formData.businessName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Textarea
                  id="businessAddress"
                  placeholder="Full business address including street, city"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessAddress: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPostcode">Business Postcode *</Label>
                <Input
                  id="businessPostcode"
                  placeholder="e.g. SW1A 1AA"
                  value={formData.businessPostcode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessPostcode: e.target.value.toUpperCase() }))}
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
                <Input
                  id="vatNumber"
                  placeholder="e.g. GB123456789"
                  value={formData.vatNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vatNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceDetails">Insurance Details *</Label>
                <Textarea
                  id="insuranceDetails"
                  placeholder="Provide details of your professional indemnity and public liability insurance"
                  value={formData.insuranceDetails}
                  onChange={(e) => setFormData((prev) => ({ ...prev, insuranceDetails: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="radiusMiles">Service Radius (Miles)</Label>
                <Input
                  id="radiusMiles"
                  type="number"
                  min="10"
                  max="100"
                  value={formData.radiusMiles}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, radiusMiles: Number.parseInt(e.target.value) || 30 }))
                  }
                />
                <p className="text-sm text-slate-600">How far are you willing to travel for jobs? (10-100 miles)</p>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={
                  !formData.businessName ||
                  !formData.businessAddress ||
                  !formData.businessPostcode ||
                  !formData.insuranceDetails
                }
                className="w-full"
              >
                Continue to Qualifications
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Qualifications & Tools */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Qualifications</CardTitle>
                <CardDescription>Select your relevant certifications and qualifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {certificationOptions.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert}
                        checked={formData.certifications.includes(cert)}
                        onCheckedChange={() => handleCertificationToggle(cert)}
                      />
                      <Label htmlFor={cert} className="text-sm">
                        {cert}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  ECU Tools & Equipment
                </CardTitle>
                <CardDescription>Select the ECU programming tools you currently own and use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {availableTools.map((tool) => (
                    <div key={tool.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={tool.id}
                        checked={formData.selectedTools.includes(tool.id)}
                        onCheckedChange={() => handleToolToggle(tool.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={tool.id} className="font-medium">
                          {tool.name}
                        </Label>
                        <p className="text-sm text-slate-600 mt-1">{tool.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.selectedTools.length === 0 && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please select at least one ECU tool to continue</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={formData.selectedTools.length === 0 || formData.certifications.length === 0}
                className="flex-1"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Subscription Payment */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Dealer Subscription
              </CardTitle>
              <CardDescription>£100/month to access jobs and manage your dealer profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Application Summary</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Business:</span> {formData.businessName}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {formData.businessPostcode}
                  </div>
                  <div>
                    <span className="font-medium">Service Radius:</span> {formData.radiusMiles} miles
                  </div>
                  <div>
                    <span className="font-medium">Certifications:</span> {formData.certifications.length} selected
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="font-medium">Tools:</span>
                    {formData.selectedTools.map((toolId) => {
                      const tool = availableTools.find((t) => t.id === toolId)
                      return (
                        <Badge key={toolId} variant="secondary" className="text-xs">
                          {tool?.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-medium mb-2">
                  <span>Monthly Subscription:</span>
                  <span>£100.00</span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>• Access to jobs in your service area</p>
                  <p>• Professional dealer profile</p>
                  <p>• Customer messaging system</p>
                  <p>• Job tracking and management tools</p>
                  <p>• Admin approval required before activation</p>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your application will be reviewed by our admin team. You'll be notified once approved and your
                  subscription will begin.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 bg-transparent">
                  Back
                </Button>
                <Button onClick={submitApplication} disabled={submitLoading} className="flex-1">
                  {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application & Pay £100
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
