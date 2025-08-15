"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Calendar, Clock, Users, Zap, Car, Star, Eye, MessageSquare, Filter } from "lucide-react"
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
  employment_type: string
  experience_level: string
  companies: {
    name: string
    location: string
  }
}

interface Application {
  id: string
  status: string
  applied_at: string
  cover_letter: string
  jobs: {
    title: string
    location: string
    salary_min: number
    salary_max: number
    companies: {
      name: string
    }
  }
}

interface Booking {
  id: string
  booking_date: string
  status: string
  total_price: number
  notes: string
  users: {
    first_name: string
    last_name: string
    email: string
  }
  remapping_services: {
    service_name: string
  }
}

interface RemappingService {
  id: string
  service_name: string
  description: string
  base_price: number
  duration_hours: number
  is_active: boolean
  service_category: string
  vehicle_types: string[]
}

export default function DealerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<RemappingService[]>([])
  const [stats, setStats] = useState({
    availableJobs: 0,
    pendingApplications: 0,
    activeBookings: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [experienceFilter, setExperienceFilter] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchDealerData()
  }, [])

  const fetchDealerData = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Fetch available jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`
          *,
          companies(name, location)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      // Fetch dealer applications
      const { data: applicationsData } = await supabase
        .from("applications")
        .select(`
          *,
          jobs(
            title,
            location,
            salary_min,
            salary_max,
            companies(name)
          )
        `)
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false })

      // Fetch dealer bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          users!customer_id(first_name, last_name, email),
          remapping_services(service_name)
        `)
        .eq("dealer_id", user.id)
        .order("booking_date", { ascending: false })

      // Fetch dealer services
      const { data: servicesData } = await supabase
        .from("remapping_services")
        .select("*")
        .eq("dealer_id", user.id)
        .order("created_at", { ascending: false })

      setJobs(jobsData || [])
      setApplications(applicationsData || [])
      setBookings(bookingsData || [])
      setServices(servicesData || [])

      // Calculate stats
      const pendingApplications = applicationsData?.filter((a) => a.status === "pending").length || 0
      const activeBookings =
        bookingsData?.filter((b) => b.status === "confirmed" || b.status === "in_progress").length || 0
      const totalEarnings =
        bookingsData?.filter((b) => b.status === "completed").reduce((sum, b) => sum + Number(b.total_price), 0) || 0

      setStats({
        availableJobs: jobsData?.length || 0,
        pendingApplications,
        activeBookings,
        totalEarnings,
      })
    } catch (error) {
      console.error("Error fetching dealer data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: "accept" | "reject") => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: action === "accept" ? "accepted" : "rejected" })
        .eq("id", applicationId)

      if (error) throw error

      // Refresh applications
      fetchDealerData()
    } catch (error) {
      console.error("Error updating application:", error)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesExperience = !experienceFilter || job.experience_level === experienceFilter

    return matchesSearch && matchesLocation && matchesExperience
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "confirmed":
      case "accepted":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "cancelled":
      case "rejected":
        return "bg-red-500"
      case "in_progress":
        return "bg-purple-500"
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
          <h1 className="text-4xl font-bold text-white mb-2">Dealer Dashboard</h1>
          <p className="text-slate-300">Manage jobs, applications, and ECU remapping services</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Available Jobs</CardTitle>
              <Zap className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.availableJobs}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pendingApplications}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeBookings}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Earnings</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">£{stats.totalEarnings.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="jobs" className="data-[state=active]:bg-red-500">
              Available Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-red-500">
              My Applications
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-red-500">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-red-500">
              My Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Job Filters */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white pl-10"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white pl-10"
                    />
                  </div>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="expert">Expert Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Available Jobs */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Available ECU Remapping Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{job.title}</h3>
                          <p className="text-slate-300 text-sm">{job.companies?.name}</p>
                        </div>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>

                      <p className="text-slate-300 mb-4 line-clamp-2">{job.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-400 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {job.employment_type}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {job.experience_level}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">
                          £{job.salary_min.toLocaleString()} - £{job.salary_max.toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <Link href={`/dealer/jobs/${job.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/dealer/jobs/${job.id}/apply`}>
                            <Button size="sm" className="bg-red-500 hover:bg-red-600">
                              Apply Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">My Job Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{application.jobs?.title}</h3>
                          <p className="text-slate-300 text-sm">{application.jobs?.companies?.name}</p>
                        </div>
                        <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400 mb-3">
                        <div>
                          <p className="text-slate-400">Applied</p>
                          <p className="text-slate-300">{new Date(application.applied_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Location</p>
                          <p className="text-slate-300">{application.jobs?.location}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Salary Range</p>
                          <p className="text-slate-300">
                            £{application.jobs?.salary_min} - £{application.jobs?.salary_max}
                          </p>
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div className="mt-3">
                          <p className="text-slate-400 text-sm mb-1">Cover Letter:</p>
                          <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}
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
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold">
                            {booking.remapping_services?.service_name || "ECU Remapping Service"}
                          </h3>
                          <p className="text-slate-300 text-sm">
                            {booking.users?.first_name} {booking.users?.last_name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-400 mb-3">
                        <div>
                          <p className="text-slate-400">Date</p>
                          <p className="text-slate-300">{new Date(booking.booking_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Price</p>
                          <p className="text-slate-300">£{booking.total_price}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Customer Email</p>
                          <p className="text-slate-300">{booking.users?.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-3">
                          <p className="text-slate-400 text-sm mb-1">Notes:</p>
                          <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  My ECU Remapping Services
                  <Link href="/dealer/services/new">
                    <Button className="bg-red-500 hover:bg-red-600">
                      <Car className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold">{service.service_name}</h3>
                        <Badge className={service.is_active ? "bg-green-500" : "bg-gray-500"}>
                          {service.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="text-slate-300 text-sm mb-3 line-clamp-2">{service.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Price:</span>
                          <span className="text-white">£{service.base_price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duration:</span>
                          <span className="text-white">{service.duration_hours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Category:</span>
                          <span className="text-white">{service.service_category}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-1 bg-transparent"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`border-slate-600 hover:bg-slate-700 ${service.is_active ? "text-red-400" : "text-green-400"}`}
                        >
                          {service.is_active ? "Deactivate" : "Activate"}
                        </Button>
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
