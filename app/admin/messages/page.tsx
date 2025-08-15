"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Wrench,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Suspense } from "react"

interface SiteMessage {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "success" | "error"
  isActive: boolean
  createdAt: string
  updatedAt: string
  dismissible: boolean
  targetAudience: "all" | "customers" | "dealers"
}

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function AdminMessagesContent() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<SiteMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    type: "info" as const,
    dismissible: true,
    targetAudience: "all" as const,
  })

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin) {
      fetchMessages()
    }
  }, [user, isAdmin])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/admin/messages", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const createMessage = async () => {
    if (!newMessage.title || !newMessage.content) return

    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newMessage),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([data.message, ...messages])
        setNewMessage({
          title: "",
          content: "",
          type: "info",
          dismissible: true,
          targetAudience: "all",
        })
        setIsCreating(false)
      }
    } catch (error) {
      console.error("Failed to create message:", error)
    }
  }

  const toggleMessageStatus = async (messageId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, isActive } : msg)))
      }
    } catch (error) {
      console.error("Failed to update message:", error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== messageId))
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <X className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getMessageBadgeColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground/70 text-lg">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-secondary/15 to-primary/15 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/profile/admin" className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Messages
              </span>
            </Link>

            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="btn-primary hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {isCreating && (
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Create Site-Wide Message</CardTitle>
              <CardDescription className="text-foreground/70">
                Send important announcements to all users or specific groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-2 block">Message Title</label>
                  <Input
                    placeholder="Enter message title..."
                    value={newMessage.title}
                    onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                    className="glass-input"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-2 block">Message Type</label>
                  <Select
                    value={newMessage.type}
                    onValueChange={(value: any) => setNewMessage({ ...newMessage, type: value })}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 mb-2 block">Message Content</label>
                <Textarea
                  placeholder="Enter your message content..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  className="glass-input min-h-[100px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-2 block">Target Audience</label>
                  <Select
                    value={newMessage.targetAudience}
                    onValueChange={(value: any) => setNewMessage({ ...newMessage, targetAudience: value })}
                  >
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="customers">Customers Only</SelectItem>
                      <SelectItem value="dealers">Dealers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="dismissible"
                    checked={newMessage.dismissible}
                    onChange={(e) => setNewMessage({ ...newMessage, dismissible: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="dismissible" className="text-sm font-medium text-foreground/70">
                    Allow users to dismiss
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={createMessage} className="btn-primary">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)} className="glass-button bg-transparent">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Site Messages
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {messages.filter((msg) => msg.isActive).length} Active
            </Badge>
          </div>

          {loadingMessages ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-primary/60 animate-pulse mx-auto mb-4" />
              <p className="text-foreground/70">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-primary/60 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
                <p className="text-foreground/70 mb-4">Create your first site-wide message to get started.</p>
                <Button onClick={() => setIsCreating(true)} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {getMessageIcon(message.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{message.title}</h3>
                            <Badge className={getMessageBadgeColor(message.type)}>{message.type}</Badge>
                            <Badge
                              variant={message.isActive ? "default" : "secondary"}
                              className={
                                message.isActive
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {message.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {message.targetAudience}
                            </Badge>
                          </div>
                          <p className="text-foreground/70 mb-3">{message.content}</p>
                          <div className="flex items-center gap-4 text-xs text-foreground/50">
                            <span>Created: {new Date(message.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Dismissible: {message.dismissible ? "Yes" : "No"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleMessageStatus(message.id, !message.isActive)}
                          className="glass-button bg-transparent"
                        >
                          {message.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Show
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                          className="glass-button bg-transparent text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/70 text-lg">Loading admin panel...</p>
          </div>
        </div>
      }
    >
      <AdminMessagesContent />
    </Suspense>
  )
}
