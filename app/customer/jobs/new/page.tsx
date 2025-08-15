"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    employment_type: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    currency: "GBP",
    application_deadline: "",
    requirements: "",
    benefits: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to post a job")
        return
      }

      // Create or get company for user
      let { data: company } = await supabase.from("companies").select("id").eq("created_by", user.id).single()

      if (!company) {
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: `${user.email?.split("@")[0]} Company`,
            created_by: user.id,
            location: formData.location,
            industry: "Automotive",
          })
          .select("id")
          .single()

        if (companyError) throw companyError
        company = newCompany
      }

      // Create job posting
      const { error: jobError } = await supabase.from("jobs").insert({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        salary_min: Number.parseInt(formData.salary_min),
        salary_max: Number.parseInt(formData.salary_max),
        currency: formData.currency,
        application_deadline: formData.application_deadline,
        requirements: formData.requirements.split("\n").filter((r) => r.trim()),
        benefits: formData.benefits.split("\n").filter((b) => b.trim()),
        company_id: company.id,
        status: "active",
      })

      if (jobError) throw jobError

      router.push("/customer/dashboard?tab=jobs")
    } catch (error: any) {
      setError(error.message || "Failed to create job posting")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/customer/dashboard" className="inline-flex items-center text-slate-300 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Post New Job</h1>
          <p className="text-slate-300">Create a new ECU remapping job posting</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Job Details</CardTitle>
            <CardDescription className="text-slate-300">
              Fill in the details for your ECU remapping job posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g. ECU Remapping Specialist"
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-300">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g. Birmingham, UK"
                      className="bg-slate-700/50 border-slate-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">
                  Job Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the ECU remapping job requirements..."
                  className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employment_type" className="text-slate-300">
                    Employment Type
                  </Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(value) => handleInputChange("employment_type", value)}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_level" className="text-slate-300">
                    Experience Level
                  </Label>
                  <Select
                    value={formData.experience_level}
                    onValueChange={(value) => handleInputChange("experience_level", value)}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="expert">Expert Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salary_min" className="text-slate-300">
                    Minimum Salary
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="salary_min"
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => handleInputChange("salary_min", e.target.value)}
                      placeholder="25000"
                      className="bg-slate-700/50 border-slate-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_max" className="text-slate-300">
                    Maximum Salary
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="salary_max"
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => handleInputChange("salary_max", e.target.value)}
                      placeholder="45000"
                      className="bg-slate-700/50 border-slate-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application_deadline" className="text-slate-300">
                    Application Deadline
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="application_deadline"
                      type="date"
                      value={formData.application_deadline}
                      onChange={(e) => handleInputChange("application_deadline", e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-slate-300">
                  Requirements (one per line)
                </Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="Experience with ECU remapping software&#10;Knowledge of automotive diagnostics&#10;Valid driving license"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits" className="text-slate-300">
                  Benefits (one per line)
                </Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                  placeholder="Competitive salary&#10;Health insurance&#10;Professional development opportunities"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-600 flex-1">
                  {loading ? "Creating Job..." : "Post Job"}
                </Button>
                <Link href="/customer/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
