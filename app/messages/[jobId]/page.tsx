"use client"

import type React from "react"
import type { PageProps } from "next"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, User, Car, Loader2 } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function ChatPage({ params }: PageProps<{ jobId: string }>) {
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [dealerId, setDealerId] = useState<string | null>(null)
  const [dealerInfo, setDealerInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [jobId, setJobId] = useState<string>("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setJobId(resolvedParams.jobId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!jobId) return

    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profileData } = await supabase.from("users").select("role").eq("id", user.id).single()
        if (!profileData) {
          router.push("/auth/login")
          return
        }
        setProfile(profileData)

        const { data: jobData } = await supabase
          .from("jobs")
          .select(`
            *,
            users!jobs_customer_id_fkey(first_name, last_name, email)
          `)
          .eq("id", jobId)
          .single()

        if (!jobData) {
          router.push("/messages")
          return
        }
        setJob(jobData)

        let dealerIdValue: string | null = null
        if (profileData.role === "customer" && jobData.customer_id !== user.id) {
          router.push("/messages")
          return
        } else if (profileData.role === "dealer") {
          const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", user.id).single()
          if (!dealer) {
            router.push("/messages")
            return
          }
          dealerIdValue = dealer.id
          setDealerId(dealerIdValue)

          const { data: application } = await supabase
            .from("job_applications")
            .select("id")
            .eq("job_id", jobId)
            .eq("dealer_id", dealer.id)
            .single()

          if (!application) {
            router.push("/messages")
            return
          }
        }

        const { data: messagesData } = await supabase
          .from("messages")
          .select(`
            *,
            users!messages_sender_id_fkey(first_name, last_name, role),
            dealers(business_name)
          `)
          .eq("job_id", jobId)
          .order("created_at", { ascending: true })

        setMessages(messagesData || [])

        if (profileData.role === "customer" && messagesData && messagesData.length > 0) {
          const dealerMessage = messagesData.find((msg: any) => msg.dealer_id)
          if (dealerMessage) {
            setDealerInfo(dealerMessage.dealers)
          }
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load messages")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [jobId, router, supabase])

  useEffect(() => {
    if (!jobId) return

    const messageSubscription = supabase
      .channel(`messages-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `job_id=eq.${jobId}`,
        },
        async (payload) => {
          console.log("[v0] New message received:", payload.new)

          const { data: newMessageData } = await supabase
            .from("messages")
            .select(`
              *,
              users!messages_sender_id_fkey(first_name, last_name, role),
              dealers(business_name)
            `)
            .eq("id", payload.new.id)
            .single()

          if (newMessageData) {
            setMessages((prev) => [...prev, newMessageData])
          }
        },
      )
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
    }
  }, [jobId, supabase])

  useEffect(() => {
    if (!jobId) return

    const jobSubscription = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          console.log("[v0] Job status updated:", payload.new)
          setJob((prev) => ({ ...prev, ...payload.new }))
        },
      )
      .subscribe()

    return () => {
      jobSubscription.unsubscribe()
    }
  }, [jobId, supabase])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !job || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-red-600">{error || "Messages not found"}</p>
        </div>
      </div>
    )
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const messageData = {
        job_id: jobId,
        sender_id: user.id,
        content: newMessage.trim(),
        dealer_id: dealerId || null,
      }

      const { error } = await supabase.from("messages").insert([messageData])

      if (error) {
        console.error("[v0] Error sending message:", error)
        return
      }

      setNewMessage("")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/messages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {job.vehicle_make} {job.vehicle_model} ({job.vehicle_year})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
              <span className="text-sm text-gray-600">
                {profile.role === "customer"
                  ? dealerInfo
                    ? `Chatting with ${dealerInfo.business_name}`
                    : "Waiting for dealer response"
                  : `Chatting with ${job.users.first_name} ${job.users.last_name}`}
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="min-h-[400px]">
          <CardContent className="p-6">
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages && messages.length > 0 ? (
                messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === profile.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === profile.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {message.sender_id === profile.id
                            ? "You"
                            : message.users.role === "dealer"
                              ? message.dealers?.business_name || "Dealer"
                              : `${message.users.first_name} ${message.users.last_name}`}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">{new Date(message.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                required
                maxLength={500}
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
