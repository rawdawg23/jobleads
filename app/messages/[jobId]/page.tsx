import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, User, Car } from "lucide-react"
import Link from "next/link"

export default async function ChatPage({ params }: { params: { jobId: string } }) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get job details
  const { data: job } = await supabase
    .from("jobs")
    .select(`
      *,
      users!jobs_customer_id_fkey(first_name, last_name, email)
    `)
    .eq("id", params.jobId)
    .single()

  if (!job) {
    redirect("/messages")
  }

  // Check access permissions
  let dealerId: string | null = null
  if (profile.role === "customer" && job.customer_id !== user.id) {
    redirect("/messages")
  } else if (profile.role === "dealer") {
    const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", user.id).single()
    if (!dealer) {
      redirect("/messages")
    }
    dealerId = dealer.id

    // Check if dealer has applied to this job
    const { data: application } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", params.jobId)
      .eq("dealer_id", dealer.id)
      .single()

    if (!application) {
      redirect("/messages")
    }
  }

  // Get messages
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      users!messages_sender_id_fkey(first_name, last_name, role),
      dealers(business_name)
    `)
    .eq("job_id", params.jobId)
    .order("created_at", { ascending: true })

  // Get dealer info for customer view
  let dealerInfo: any = null
  if (profile.role === "customer" && messages && messages.length > 0) {
    const dealerMessage = messages.find((msg: any) => msg.dealer_id)
    if (dealerMessage) {
      dealerInfo = dealerMessage.dealers
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
        {/* Messages */}
        <Card className="min-h-[400px]">
          <CardContent className="p-6">
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages && messages.length > 0 ? (
                messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {message.sender_id === user.id
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

            {/* Message Input */}
            <form action="/api/messages/send" method="POST" className="flex gap-2">
              <input type="hidden" name="jobId" value={params.jobId} />
              {dealerId && <input type="hidden" name="dealerId" value={dealerId} />}
              <Input name="message" placeholder="Type your message..." className="flex-1" required maxLength={500} />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
