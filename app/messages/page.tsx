"use client"

import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Clock, Loader2, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRealtimeData } from "@/hooks/use-realtime-data"

export const dynamic = "force-dynamic"

interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  job_id?: string
  booking_id?: string
  last_message_at: string
  job?: {
    title: string
    vehicle_make?: string
    vehicle_model?: string
    status: string
  }
  booking?: {
    service_name: string
    status: string
  }
  other_user?: {
    first_name: string
    last_name: string
    role: string
    email: string
  }
  unread_count: number
  last_message?: {
    content: string
    created_at: string
  }
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const supabase = createClient()

  const { data: realtimeConversations, loading: realtimeLoading } = useRealtimeData<Conversation>({
    table: "conversations",
    orderBy: { column: "last_message_at", ascending: false },
  })

  useEffect(() => {
    loadUserAndConversations()
  }, [])

  const loadUserAndConversations = async () => {
    try {
      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select(`
          *,
          jobs(title, status),
          bookings(service_name, status),
          messages!inner(
            content,
            created_at,
            is_read,
            sender_id
          )
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })

      if (conversationsError) throw conversationsError

      // Process conversations to get other participant details and unread counts
      const processedConversations = await Promise.all(
        (conversationsData || []).map(async (conv: any) => {
          const otherUserId = conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id

          // Get other user details
          const { data: otherUser } = await supabase
            .from("users")
            .select("first_name, last_name, role, email")
            .eq("id", otherUserId)
            .single()

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .eq("is_read", false)
            .or(`job_id.eq.${conv.job_id},booking_id.eq.${conv.booking_id}`)

          // Get last message
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at")
            .or(`job_id.eq.${conv.job_id},booking_id.eq.${conv.booking_id}`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          return {
            ...conv,
            other_user: otherUser,
            unread_count: unreadCount || 0,
            last_message: lastMessage,
          }
        }),
      )

      setConversations(processedConversations)
    } catch (err) {
      console.error("Error loading messages:", err)
      setError("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase()
    const otherUserName = `${conv.other_user?.first_name} ${conv.other_user?.last_name}`.toLowerCase()
    const jobTitle = conv.job?.title?.toLowerCase() || ""
    const serviceName = conv.booking?.service_name?.toLowerCase() || ""

    return otherUserName.includes(searchLower) || jobTitle.includes(searchLower) || serviceName.includes(searchLower)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
          <span className="text-slate-300">Loading messages...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Messages</h1>
          <p className="text-slate-300">Communicate about ECU remapping services</p>
        </div>

        {/* Search and Filter */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-red-500" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white pl-10"
                />
              </div>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredConversations.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm ? "No conversations found" : "No conversations yet"}
              </h3>
              <p className="text-slate-400 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by posting a job or applying to services to connect with others"}
              </p>
              {!searchTerm && (
                <div className="flex gap-4 justify-center">
                  <Button asChild className="bg-red-500 hover:bg-red-600">
                    <Link href="/customer/jobs/new">Post a Job</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <Link href="/dealer/dashboard">Browse Services</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=48&width=48&query=${conversation.other_user?.first_name}`}
                      />
                      <AvatarFallback className="bg-red-500 text-white">
                        {conversation.other_user?.first_name?.[0]}
                        {conversation.other_user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white truncate">
                          {conversation.other_user?.first_name} {conversation.other_user?.last_name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`${
                            conversation.other_user?.role === "dealer"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {conversation.other_user?.role}
                        </Badge>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>

                      <div className="mb-2">
                        {conversation.job && <p className="text-slate-300 text-sm">Job: {conversation.job.title}</p>}
                        {conversation.booking && (
                          <p className="text-slate-300 text-sm">Service: {conversation.booking.service_name}</p>
                        )}
                      </div>

                      {conversation.last_message && (
                        <p className="text-slate-400 text-sm truncate mb-2">{conversation.last_message.content}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(conversation.last_message_at).toLocaleDateString()}</span>
                        </div>

                        <Link
                          href={`/messages/${conversation.job_id || conversation.booking_id}`}
                          className="inline-block"
                        >
                          <Button size="sm" className="bg-red-500 hover:bg-red-600">
                            Open Chat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
