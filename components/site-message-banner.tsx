"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

interface SiteMessage {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "success" | "error"
  dismissible: boolean
  targetAudience: "all" | "customers" | "dealers"
}

export default function SiteMessageBanner() {
  const { user, isCustomer, isDealer } = useAuth()
  const [messages, setMessages] = useState<SiteMessage[]>([])
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set())
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchActiveMessages()
      // Load dismissed messages from localStorage
      const dismissed = localStorage.getItem("dismissedMessages")
      if (dismissed) {
        setDismissedMessages(new Set(JSON.parse(dismissed)))
      }
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const messageSubscription = supabase
      .channel("site-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_messages",
          filter: "is_active=eq.true",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            fetchActiveMessages() // Refresh messages when new ones are added or updated
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
    }
  }, [user])

  useEffect(() => {
    // Auto-rotate messages every 8 seconds
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [messages.length])

  useEffect(() => {
    // Show banner with animation when messages are available
    if (messages.length > 0) {
      setIsVisible(true)
    }
  }, [messages])

  const fetchActiveMessages = async () => {
    try {
      const response = await fetch("/api/site-messages", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        const filteredMessages = data.messages.filter((msg: SiteMessage) => {
          // Filter by target audience
          if (msg.targetAudience === "customers" && !isCustomer) return false
          if (msg.targetAudience === "dealers" && !isDealer) return false
          // Don't show dismissed messages
          return !dismissedMessages.has(msg.id)
        })
        setMessages(filteredMessages)
      }
    } catch (error) {
      console.error("Failed to fetch site messages:", error)
    }
  }

  const dismissMessage = (messageId: string) => {
    const newDismissed = new Set(dismissedMessages)
    newDismissed.add(messageId)
    setDismissedMessages(newDismissed)
    localStorage.setItem("dismissedMessages", JSON.stringify(Array.from(newDismissed)))

    // Remove from current messages
    const updatedMessages = messages.filter((msg) => msg.id !== messageId)
    setMessages(updatedMessages)

    // Adjust current index if needed
    if (currentMessageIndex >= updatedMessages.length) {
      setCurrentMessageIndex(0)
    }

    // Hide banner if no messages left
    if (updatedMessages.length === 0) {
      setIsVisible(false)
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-100" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-100" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-100" />
      default:
        return <Info className="h-5 w-5 text-blue-100" />
    }
  }

  const getMessageStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-gradient-to-r from-orange-600/90 to-orange-700/90 border-orange-500/30"
      case "success":
        return "bg-gradient-to-r from-green-600/90 to-green-700/90 border-green-500/30"
      case "error":
        return "bg-gradient-to-r from-red-600/90 to-red-700/90 border-red-500/30"
      default:
        return "bg-gradient-to-r from-blue-600/90 to-blue-700/90 border-blue-500/30"
    }
  }

  if (!user || messages.length === 0 || !isVisible) {
    return null
  }

  const currentMessage = messages[currentMessageIndex]

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] transform transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div
        className={`${getMessageStyles(currentMessage.type)} backdrop-blur-xl border-b shadow-lg animate-slide-down`}
      >
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 animate-pulse-soft">{getMessageIcon(currentMessage.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-white font-semibold text-sm truncate">{currentMessage.title}</h4>
                  {messages.length > 1 && (
                    <div className="flex gap-1">
                      {messages.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentMessageIndex ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
                          }`}
                          onClick={() => setCurrentMessageIndex(index)}
                          role="button"
                          tabIndex={0}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-white/90 text-sm leading-relaxed">{currentMessage.content}</p>
              </div>
            </div>

            {currentMessage.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissMessage(currentMessage.id)}
                className="flex-shrink-0 ml-4 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss message</span>
              </Button>
            )}
          </div>
        </div>

        {/* Animated progress bar for message rotation */}
        {messages.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-white/60 transition-all duration-[8000ms] ease-linear"
              style={{
                width: "100%",
                animation: "progress-bar 8s linear infinite",
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes slide-down {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
