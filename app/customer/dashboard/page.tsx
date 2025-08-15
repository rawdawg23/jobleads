"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Car, MapPin, Calendar, Clock, Users, Zap } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  title: string
  description: string
  location: string
  status: string
  created_at: string
  application_deadline: string
  salary_min: number
  salary_max: number
  currency: string
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  registration_number: string
  fuel_type: string
}

interface Booking {
  id: string
  booking_date: string
  status: string
  total_price: number
  service_name: string
  dealer_name: string
}

export default function CustomerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeBookings: 0,
    totalVehicles: 0,
    completedServices: 0,
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Fetch jobs posted by customer
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })

      // Fetch customer vehicles
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      // Fetch customer bookings with service details
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          remapping_services(service_name),
          users!dealer_id(first_name, last_name)
        `)
        .eq("customer_id", user.id)
        .order("booking_date", { ascending: false })

      setJobs(jobsData || [])
      setVehicles(vehiclesData || [])
      setBookings(bookingsData || [])

      // Calculate stats
      const activeBookings =
        bookingsData?.filter((b) => b.status === "confirmed" || b.status === "in_progress").length || 0
      const completedServices = bookingsData?.filter((b) => b.status === "completed").length || 0

      setStats({
        totalJobs: jobsData?.length || 0,
        activeBookings,
        totalVehicles: vehiclesData?.length || 0,
        completedServices,
      })
    } catch (error) {
      console.error("Error fetching customer data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Customer Dashboard</h1>
          <p className="text-slate-300">Manage your ECU remapping services and vehicle fleet</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Jobs Posted</CardTitle>
              <Zap className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalJobs}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeBookings}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Your Vehicles</CardTitle>
              <Car className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalVehicles}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Completed Services</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.completedServices}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-500">
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-red-500">
              My Jobs
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-red-500">
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-red-500">
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Jobs */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Recent Jobs
                    <Link href="/customer/jobs/new">
                      <Button size="sm" className="bg-red-500 hover:bg-red-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Post Job
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">{job.title}</h4>
                          <p className="text-slate-400 text-sm flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </p>
                        </div>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                      >
                        <div>
                          <h4 className="text-white font-medium">{booking.service_name || "ECU Remapping"}</h4>
                          <p className="text-slate-400 text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          <p className="text-slate-300 text-sm mt-1">£{booking.total_price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  My Posted Jobs
                  <Link href="/customer/jobs/new">
                    <Button className="bg-red-500 hover:bg-red-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold">{job.title}</h3>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                      <p className="text-slate-300 mb-3">{job.description}</p>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </span>
                        <span>
                          £{job.salary_min} - £{job.salary_max}
                        </span>
                        <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Your Vehicles
                  <Link href="/customer/vehicles/add">
                    <Button className="bg-red-500 hover:bg-red-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Car className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className="text-white font-semibold">
                          {vehicle.make} {vehicle.model}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-slate-300">
                        <p>Year: {vehicle.year}</p>
                        <p>Reg: {vehicle.registration_number}</p>
                        <p>Fuel: {vehicle.fuel_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Service Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold">{booking.service_name || "ECU Remapping Service"}</h3>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
                        <div>
                          <p className="text-slate-400">Date</p>
                          <p>{new Date(booking.booking_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Price</p>
                          <p>£{booking.total_price}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Dealer</p>
                          <p>
                            {booking.users?.first_name} {booking.users?.last_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
