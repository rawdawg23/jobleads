"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Wrench, CheckCircle, X, ArrowLeft, Calendar, MapPin, Phone, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Dealer {
  id: string
  business_name: string
  business_address: string
  business_postcode: string
  radius_miles: number
  status: string
  certifications: string[]
  insurance_details: string
  vat_number: string
  created_at: string
  updated_at: string
  user: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function AdminDealersPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loadingDealers, setLoadingDealers] = useState(true)
  const [error, setError] = useState("")
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin) {
      fetchDealers()
    }
  }, [user, isAdmin])

  const fetchDealers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("dealers")
        .select(`
          *,
          user:users(
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setDealers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dealers")
    } finally {
      setLoadingDealers(false)
    }
  }

  const updateDealerStatus = async (dealerId: string, status: string) => {
    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("dealers")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dealerId)

      if (error) throw error

      await fetchDealers()
      setSelectedDealer(null)
      setAdminNotes("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update dealer status")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || loadingDealers) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dealer applications...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const pendingDealers = dealers.filter((d) => d.status === "pending")
  const approvedDealers = dealers.filter((d) => d.status === "approved")
  const rejectedDealers = dealers.filter((d) => d.status === "rejected")

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Dealer Management</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dealer Applications</h1>
          <p className="text-slate-600">Review and approve dealer registrations</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingDealers.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedDealers.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedDealers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingDealers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Wrench className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Pending Applications</h3>
                  <p className="text-slate-600">All dealer applications have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              pendingDealers.map((dealer) => (
                <Card key={dealer.id} className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{dealer.business_name}</CardTitle>
                        <CardDescription>
                          {dealer.user.first_name} {dealer.user.last_name} • Applied{" "}
                          {new Date(dealer.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(dealer.status)}>
                        {dealer.status.charAt(0).toUpperCase() + dealer.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm">
                          <div>{dealer.user.email}</div>
                          {dealer.user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {dealer.user.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Business Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <div>
                              <div>{dealer.business_address}</div>
                              <div>{dealer.business_postcode}</div>
                            </div>
                          </div>
                          <div>Service Radius: {dealer.radius_miles} miles</div>
                          {dealer.vat_number && <div>VAT: {dealer.vat_number}</div>}
                        </div>
                      </div>
                    </div>

                    {dealer.certifications && dealer.certifications.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Certifications
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {dealer.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {dealer.insurance_details && (
                      <div>
                        <h4 className="font-medium mb-2">Insurance Details</h4>
                        <p className="text-sm text-slate-600">{dealer.insurance_details}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={() => setSelectedDealer(dealer)} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Approved Dealers</CardTitle>
                <CardDescription>Active dealers on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Radius</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedDealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell className="font-medium">{dealer.business_name}</TableCell>
                        <TableCell>
                          {dealer.user.first_name} {dealer.user.last_name}
                        </TableCell>
                        <TableCell>{dealer.business_postcode}</TableCell>
                        <TableCell>{dealer.radius_miles} miles</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(dealer.updated_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Applications</CardTitle>
                <CardDescription>Dealer applications that were not approved</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Rejected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedDealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell className="font-medium">{dealer.business_name}</TableCell>
                        <TableCell>
                          {dealer.user.first_name} {dealer.user.last_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(dealer.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(dealer.updated_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Review Again
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dealer Review Modal */}
        {selectedDealer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Review Dealer Application</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDealer(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Business Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Name:</strong> {selectedDealer.business_name}
                      </div>
                      <div>
                        <strong>Address:</strong> {selectedDealer.business_address}
                      </div>
                      <div>
                        <strong>Postcode:</strong> {selectedDealer.business_postcode}
                      </div>
                      <div>
                        <strong>Service Radius:</strong> {selectedDealer.radius_miles} miles
                      </div>
                      {selectedDealer.vat_number && (
                        <div>
                          <strong>VAT Number:</strong> {selectedDealer.vat_number}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Contact Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Owner:</strong> {selectedDealer.user.first_name} {selectedDealer.user.last_name}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedDealer.user.email}
                      </div>
                      {selectedDealer.user.phone && (
                        <div>
                          <strong>Phone:</strong> {selectedDealer.user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedDealer.certifications && selectedDealer.certifications.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDealer.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDealer.insurance_details && (
                  <div>
                    <h4 className="font-medium mb-2">Insurance Details</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">{selectedDealer.insurance_details}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes about this application review..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateDealerStatus(selectedDealer.id, "approved")}
                    disabled={updating}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Dealer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateDealerStatus(selectedDealer.id, "rejected")}
                    disabled={updating}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
