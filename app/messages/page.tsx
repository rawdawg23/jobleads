import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, User, Clock } from "lucide-react"
import Link from "next/link"

export default async function MessagesPage() {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get conversations based on user role
  let conversations: any[] = []

  if (profile.role === "customer") {
    // Get conversations where user is the customer
    const { data } = await supabase
      .from("messages")
      .select(`
        job_id,
        jobs!inner(
          id,
          title,
          vehicle_make,
          vehicle_model,
          status
        ),
        dealers!inner(
          id,
          business_name,
          users!dealers_user_id_fkey(first_name, last_name)
        )
      `)
      .eq("jobs.customer_id", user.id)
      .order("created_at", { ascending: false })

    // Group by job and dealer
    const grouped = data?.reduce((acc: any, msg: any) => {
      const key = `${msg.job_id}-${msg.dealers.id}`
      if (!acc[key]) {
        acc[key] = {
          job: msg.jobs,
          dealer: msg.dealers,
          lastMessage: msg.created_at,
          unreadCount: 0,
        }
      }
      return acc
    }, {})

    conversations = Object.values(grouped || {})
  } else if (profile.role === "dealer") {
    // Get dealer profile
    const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", user.id).single()

    if (dealer) {
      const { data } = await supabase
        .from("messages")
        .select(`
          job_id,
          jobs!inner(
            id,
            title,
            vehicle_make,
            vehicle_model,
            status,
            users!jobs_customer_id_fkey(first_name, last_name)
          )
        `)
        .eq("dealer_id", dealer.id)
        .order("created_at", { ascending: false })

      // Group by job
      const grouped = data?.reduce((acc: any, msg: any) => {
        const key = msg.job_id
        if (!acc[key]) {
          acc[key] = {
            job: msg.jobs,
            customer: msg.jobs.users,
            lastMessage: msg.created_at,
            unreadCount: 0,
          }
        }
        return acc
      }, {})

      conversations = Object.values(grouped || {})
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with {profile.role === "customer" ? "dealers" : "customers"}</p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-gray-600 mb-4">
              {profile.role === "customer"
                ? "Start by posting a job to connect with dealers"
                : "Apply to jobs to start conversations with customers"}
            </p>
            <Button asChild>
              <Link href={profile.role === "customer" ? "/jobs/post" : "/dealer/jobs"}>
                {profile.role === "customer" ? "Post a Job" : "Browse Jobs"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation: any, index: number) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">
                        {profile.role === "customer"
                          ? conversation.dealer.business_name
                          : `${conversation.customer.first_name} ${conversation.customer.last_name}`}
                      </span>
                      <Badge variant={conversation.job.status === "open" ? "default" : "secondary"}>
                        {conversation.job.status}
                      </Badge>
                    </div>

                    <h3 className="font-medium mb-1">
                      {conversation.job.vehicle_make} {conversation.job.vehicle_model}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="h-3 w-3" />
                      <span>Last message: {new Date(conversation.lastMessage).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="rounded-full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    <Button asChild>
                      <Link href={`/messages/${conversation.job.id}`}>View Chat</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
