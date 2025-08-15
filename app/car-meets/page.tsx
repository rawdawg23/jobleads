"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  Navigation,
  Car,
  ArrowLeft,
  Star,
  Share2,
  Bookmark,
  CheckCircle,
  Eye,
  Heart,
} from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface CarMeet {
  id: string
  title: string
  description: string
  location_name: string
  latitude: number
  longitude: number
  address: string
  event_date: string
  event_time: string
  max_attendees: number
  current_attendees: number
  entry_fee: number
  created_by: string
  status: "active" | "cancelled" | "completed"
  tags: string[]
  image_url?: string
  distance?: number
  organizer_name: string
  organizer_rating: number
}

export default function CarMeetsPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [carMeets, setCarMeets] = useState<CarMeet[]>([])
  const [filteredMeets, setFilteredMeets] = useState<CarMeet[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedMeet, setSelectedMeet] = useState<CarMeet | null>(null)
  const [mapAnimations, setMapAnimations] = useState<Array<{ x: number; y: number; id: string }>>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Mock data for car meets
  useEffect(() => {
    const mockMeets: CarMeet[] = [
      {
        id: "1",
        title: "London ECU Tuning Meet",
        description: "Monthly gathering for ECU enthusiasts. Bring your tuned cars and share experiences!",
        location_name: "Hyde Park Corner",
        latitude: 51.5028,
        longitude: -0.1547,
        address: "Hyde Park Corner, London W1J 7NT",
        event_date: "2024-02-15",
        event_time: "19:00",
        max_attendees: 50,
        current_attendees: 23,
        entry_fee: 0,
        created_by: "user1",
        status: "active",
        tags: ["ECU", "Tuning", "Performance"],
        organizer_name: "Mike Johnson",
        organizer_rating: 4.8,
        distance: 2.3,
      },
      {
        id: "2",
        title: "Birmingham Dyno Day",
        description: "Professional dyno testing available. Book your slot and see your car's true potential!",
        location_name: "Birmingham Automotive Centre",
        latitude: 52.4862,
        longitude: -1.8904,
        address: "123 Industrial Estate, Birmingham B12 0AA",
        event_date: "2024-02-18",
        event_time: "10:00",
        max_attendees: 30,
        current_attendees: 18,
        entry_fee: 25,
        created_by: "dealer1",
        status: "active",
        tags: ["Dyno", "Testing", "Performance"],
        organizer_name: "Birmingham Tuning Ltd",
        organizer_rating: 4.9,
        distance: 5.7,
      },
      {
        id: "3",
        title: "Manchester Stage 2+ Showcase",
        description: "Show off your Stage 2+ builds. Prizes for best power gains and most creative mods!",
        location_name: "Manchester Car Park",
        latitude: 53.4808,
        longitude: -2.2426,
        address: "Trafford Centre, Manchester M17 8AA",
        event_date: "2024-02-20",
        event_time: "18:30",
        max_attendees: 75,
        current_attendees: 42,
        entry_fee: 10,
        created_by: "user2",
        status: "active",
        tags: ["Stage2", "Showcase", "Competition"],
        organizer_name: "Sarah Williams",
        organizer_rating: 4.6,
        distance: 8.1,
      },
    ]

    setCarMeets(mockMeets)
    setFilteredMeets(mockMeets)
  }, [])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied")
          // Default to London
          setUserLocation({ lat: 51.5074, lng: -0.1278 })
        },
      )
    }
  }, [])

  // Animated map background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw animated grid lines
      ctx.strokeStyle = "rgba(139, 92, 246, 0.1)"
      ctx.lineWidth = 1

      const time = Date.now() * 0.001
      const gridSize = 50

      for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
        for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
          const offsetX = Math.sin(time + x * 0.01) * 10
          const offsetY = Math.cos(time + y * 0.01) * 10

          ctx.beginPath()
          ctx.moveTo(x + offsetX, y + offsetY)
          ctx.lineTo(x + offsetX + gridSize, y + offsetY)
          ctx.lineTo(x + offsetX + gridSize, y + offsetY + gridSize)
          ctx.lineTo(x + offsetX, y + offsetY + gridSize)
          ctx.closePath()
          ctx.stroke()
        }
      }

      // Draw location markers
      carMeets.forEach((meet, index) => {
        const x = (index * 150 + 100) % canvas.width
        const y = (index * 100 + 150) % canvas.height
        const pulse = Math.sin(time * 2 + index) * 0.5 + 0.5

        ctx.fillStyle = `rgba(139, 92, 246, ${0.6 + pulse * 0.4})`
        ctx.beginPath()
        ctx.arc(x, y, 8 + pulse * 4, 0, Math.PI * 2)
        ctx.fill()

        // Ripple effect
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 - pulse * 0.3})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 15 + pulse * 10, 0, Math.PI * 2)
        ctx.stroke()
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [carMeets])

  // Filter meets
  useEffect(() => {
    let filtered = carMeets

    if (searchTerm) {
      filtered = filtered.filter(
        (meet) =>
          meet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meet.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meet.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((meet) => {
        switch (selectedFilter) {
          case "free":
            return meet.entry_fee === 0
          case "paid":
            return meet.entry_fee > 0
          case "nearby":
            return meet.distance && meet.distance < 10
          case "today":
            return new Date(meet.event_date).toDateString() === new Date().toDateString()
          default:
            return true
        }
      })
    }

    setFilteredMeets(filtered)
  }, [searchTerm, selectedFilter, carMeets])

  const handleCreateMeet = () => {
    setShowCreateForm(true)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Map Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)" }}
      />

      {/* Header */}
      <header className="border-b border-border glass-card sticky top-0 z-50 backdrop-blur-xl relative">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg animate-pulse-glow">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Car Meet Locations
                  </h1>
                  <p className="text-sm text-muted-foreground">Find and join automotive events near you</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="led-green"></div>
                <span className="text-sm font-medium">{filteredMeets.length} Active Events</span>
              </div>
              <Button className="glass-button bg-gradient-to-r from-primary to-accent" onClick={handleCreateMeet}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 relative z-10">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, locations, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-primary/30"
            />
          </div>
          <div className="flex gap-2">
            {["all", "nearby", "free", "paid", "today"].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={`glass-button ${
                  selectedFilter === filter ? "bg-gradient-to-r from-primary to-accent" : "bg-transparent"
                }`}
              >
                {filter === "all" && <Filter className="h-4 w-4 mr-1" />}
                {filter === "nearby" && <Navigation className="h-4 w-4 mr-1" />}
                {filter === "free" && <Heart className="h-4 w-4 mr-1" />}
                {filter === "paid" && <Star className="h-4 w-4 mr-1" />}
                {filter === "today" && <Clock className="h-4 w-4 mr-1" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">{filteredMeets.length}</div>
                  <div className="text-sm text-muted-foreground">Active Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {filteredMeets.reduce((sum, meet) => sum + meet.current_attendees, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Attendees</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Navigation className="h-8 w-8 text-secondary" />
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {filteredMeets.filter((meet) => meet.distance && meet.distance < 10).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Nearby Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {filteredMeets.filter((meet) => meet.entry_fee === 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Free Events</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMeets.map((meet) => (
            <Card
              key={meet.id}
              className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {meet.title}
                    </CardTitle>
                    <CardDescription className="text-sm">{meet.description}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {meet.entry_fee === 0 ? (
                      <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">FREE</div>
                    ) : (
                      <div className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">£{meet.entry_fee}</div>
                    )}
                    {meet.distance && (
                      <div className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                        {meet.distance}km away
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{meet.location_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(meet.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{meet.event_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {meet.current_attendees}/{meet.max_attendees} attending
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <Car className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{meet.organizer_name}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-muted-foreground">{meet.organizer_rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {meet.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 glass-button bg-gradient-to-r from-primary to-accent" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Join Event
                  </Button>
                  <Button variant="outline" className="glass-button bg-transparent" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Event Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="glass-card border-primary/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Create New Car Meet Event
                    </CardTitle>
                    <CardDescription>Share your automotive event with the community</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Title</label>
                    <Input placeholder="e.g., London ECU Tuning Meet" className="glass-card border-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location Name</label>
                    <Input placeholder="e.g., Hyde Park Corner" className="glass-card border-primary/30" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your event, what to expect, and any special requirements..."
                    className="glass-card border-primary/30 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Date</label>
                    <Input type="date" className="glass-card border-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Time</label>
                    <Input type="time" className="glass-card border-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Entry Fee (£)</label>
                    <Input type="number" placeholder="0" className="glass-card border-primary/30" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Attendees</label>
                    <Input type="number" placeholder="50" className="glass-card border-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
                    <Input placeholder="ECU, Tuning, Performance" className="glass-card border-primary/30" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Full Address</label>
                  <Input placeholder="Full address for GPS navigation" className="glass-card border-primary/30" />
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 glass-button bg-gradient-to-r from-primary to-accent">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button
                    variant="outline"
                    className="glass-button bg-transparent"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
