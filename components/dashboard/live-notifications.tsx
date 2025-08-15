"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, X, Check, AlertCircle, MessageSquare, Briefcase, User } from "lucide-react"

interface Notification {
  id: string
  type: "job" | "application" | "message" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

export function LiveNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Load existing notifications
    loadNotifications()

    // Set up real-time subscriptions
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          handleNewNotification({
            type: "application",
            title: "Application Update",
            message: "Your application status has changed",
            data: payload.new,
          })
        },
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "jobs" }, (payload) => {
        if (user.role === "dealer") {
          handleNewNotification({
            type: "job",
            title: "New Job Available",
            message: "A new ECU remapping job has been posted",
            data: payload.new,
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const loadNotifications = async () => {
    // In a real app, you'd load from a notifications table
    // For now, we'll simulate with recent activity
    setNotifications([])
  }

  const handleNewNotification = (notificationData: Partial<Notification>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: notificationData.type || "system",
      title: notificationData.title || "New Notification",
      message: notificationData.message || "",
      timestamp: new Date().toISOString(),
      read: false,
      data: notificationData.data,
    }

    setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job":
        return Briefcase
      case "application":
        return User
      case "message":
        return MessageSquare
      default:
        return AlertCircle
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="glass-button-ghost relative">
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs text-white font-bold animate-bounce">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 glass-card shadow-2xl z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-glass-text hover:text-white"
                  >
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="glass-button-ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="max-h-96 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center text-glass-text py-8">No notifications yet</p>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      notification.read
                        ? "bg-glass-light/30 border-glass-border"
                        : "bg-primary/10 border-primary/30 shadow-lg"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-glass-light flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <p className="text-sm text-glass-text">{notification.message}</p>
                        <p className="text-xs text-glass-text/70 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex items-center space-x-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0 hover:bg-glass-light/50"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="h-6 w-6 p-0 hover:bg-red-500/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
