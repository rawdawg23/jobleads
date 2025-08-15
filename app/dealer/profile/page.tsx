export const dynamic = "force-dynamic"
export const runtime = "nodejs"
;("use client")

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Wrench, MapPin, Award, Settings, Save, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface DealerProfile {
  id: string
  business_name: string
  business_address: string
  business_postcode: string
  radius_miles: number
  status: string
  certifications: string[]
  insurance_details: string
  vat_number: string
  user: {
    first_name: string
    last_name: string
    phone: string
    email: string
  }
}

interface Tool {
  id: string
  name: string
  brand: string
  model: string
  description: string
}

export default function DealerProfilePage() {
  const { user, loading, isDealer } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<DealerProfile | null>(null)
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [dealerTools, setDealerTools] = useState<string[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newCertification, setNewCertification] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isDealer)) {
      router.push("/auth/login")
    }
  }, [user, loading, isDealer, router])

  useEffect(() => {
    if (user && isDealer) {
      fetchProfile()
      fetchTools()
    }
  }, [user, isDealer])

  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("dealers")
        .select(`
          *,
          user:users(
            first_name,
            last_name,
            phone,
            email
          ),
          tools:dealer_tools(
            tool_id
          )
        `)
        .eq("user_id", user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setDealerTools(data.tools?.map((t: any) => t.tool_id) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile")
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchTools = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("tools").select("*").order("brand", { ascending: true })

      if (error) throw error
      setAvailableTools(data || [])
    } catch (err) {
      console.error("Failed to fetch tools:", err)
    }
  }

  const updateProfile = async (formData: FormData) => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const supabase = createClient()

      // Update dealer profile
      const { error: dealerError } = await supabase
        .from("dealers")
        .update({
          business_name: formData.get("business_name"),
          business_address: formData.get("business_address"),
          business_postcode: formData.get("business_postcode"),
          radius_miles: Number(formData.get("radius_miles")),
          insurance_details: formData.get("insurance_details"),
          vat_number: formData.get("vat_number"),
          certifications: profile?.certifications || [],
        })
        .eq("user_id", user.id)

      if (dealerError) throw dealerError

      // Update user profile
      const { error: userError } = await supabase
        .from("users")
        .update({
          first_name: formData.get("first_name"),
          last_name: formData.get("last_name"),
          phone: formData.get("phone"),
        })
        .eq("id", user.id)

      if (userError) throw userError

      // Update dealer tools
      await supabase.from("dealer_tools").delete().eq("dealer_id", profile?.id)

      if (dealerTools.length > 0) {
        const toolInserts = dealerTools.map((toolId) => ({
          dealer_id: profile?.id,
          tool_id: toolId,
        }))

        const { error: toolsError } = await supabase.from("dealer_tools").insert(toolInserts)

        if (toolsError) throw toolsError
      }

      setSuccess("Profile updated successfully!")
      fetchProfile() // Refresh profile data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const addCertification = () => {
    if (newCertification.trim() && profile) {
      setProfile({
        ...profile,
        certifications: [...profile.certifications, newCertification.trim()],
      })
      setNewCertification("")
    }
  }

  const removeCertification = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        certifications: profile.certifications.filter((_, i) => i !== index),
      })
    }
  }

  const toggleTool = (toolId: string) => {
    setDealerTools((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]))
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !isDealer || !profile) {
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dealer Profile</h1>
          <p className="text-slate-600">Manage your business information and service capabilities</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form action={updateProfile} className="space-y-6">
          <Tabs defaultValue="business" className="space-y-6">
            <TabsList>
              <TabsTrigger value="business">Business Details</TabsTrigger>
              <TabsTrigger value="tools">Tools & Equipment</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                  <CardDescription>Update your business details and service area</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input id="first_name" name="first_name" defaultValue={profile.user.first_name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input id="last_name" name="last_name" defaultValue={profile.user.last_name} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input id="business_name" name="business_name" defaultValue={profile.business_name} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_address">Business Address</Label>
                    <Textarea
                      id="business_address"
                      name="business_address"
                      defaultValue={profile.business_address}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_postcode">Business Postcode</Label>
                      <Input
                        id="business_postcode"
                        name="business_postcode"
                        defaultValue={profile.business_postcode}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="radius_miles">Service Radius (miles)</Label>
                      <Input
                        id="radius_miles"
                        name="radius_miles"
                        type="number"
                        min="1"
                        max="100"
                        defaultValue={profile.radius_miles}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" defaultValue={profile.user.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={profile.user.email}
                        disabled
                        className="bg-slate-100"
                      />
                      <p className="text-xs text-slate-600">Email cannot be changed here</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vat_number">VAT Number (Optional)</Label>
                    <Input
                      id="vat_number"
                      name="vat_number"
                      defaultValue={profile.vat_number || ""}
                      placeholder="GB123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurance_details">Insurance Details</Label>
                    <Textarea
                      id="insurance_details"
                      name="insurance_details"
                      defaultValue={profile.insurance_details || ""}
                      rows={3}
                      placeholder="Provide details about your business insurance coverage..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Tools & Equipment
                  </CardTitle>
                  <CardDescription>Select the tools and equipment you have available for ECU remapping</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableTools.map((tool) => (
                      <div key={tool.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={tool.id}
                          checked={dealerTools.includes(tool.id)}
                          onCheckedChange={() => toggleTool(tool.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={tool.id} className="font-medium cursor-pointer">
                            {tool.brand} {tool.name}
                          </Label>
                          {tool.model && <p className="text-sm text-slate-600">{tool.model}</p>}
                          {tool.description && <p className="text-xs text-slate-500 mt-1">{tool.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {dealerTools.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Selected Tools ({dealerTools.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {dealerTools.map((toolId) => {
                          const tool = availableTools.find((t) => t.id === toolId)
                          return tool ? (
                            <Badge key={toolId} variant="secondary">
                              {tool.brand} {tool.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications & Qualifications
                  </CardTitle>
                  <CardDescription>Add your professional certifications and qualifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a certification (e.g., IMI Level 3, City & Guilds)"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                    />
                    <Button type="button" onClick={addCertification} disabled={!newCertification.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {profile.certifications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Current Certifications</h4>
                      <div className="space-y-2">
                        {profile.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span>{cert}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.certifications.length === 0 && (
                    <div className="text-center py-8 text-slate-600">
                      <Award className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p>No certifications added yet.</p>
                      <p className="text-sm">Add your professional qualifications to build customer trust.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} size="lg">
              {saving ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
