"use client"

import { useEffect, useState } from "react"

export function BMWLogo() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true)
      setTimeout(() => setAnimate(false), 2000)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-16 h-12 mx-2">
      {/* BMW Car Silhouette */}
      <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Car Body */}
        <path
          d="M15 35 Q20 25 35 25 L65 25 Q80 25 85 35 L85 45 Q85 50 80 50 L75 50 Q75 55 70 55 L65 55 Q60 55 60 50 L40 50 Q40 55 35 55 L30 55 Q25 55 25 50 L20 50 Q15 50 15 45 Z"
          fill="#1e40af"
          className="transition-all duration-500"
        />

        {/* Windows */}
        <path d="M25 35 Q30 28 40 28 L60 28 Q70 28 75 35 L75 40 L25 40 Z" fill="#3b82f6" className="opacity-80" />

        {/* Wheels */}
        <circle cx="30" cy="45" r="8" fill="#374151" />
        <circle cx="70" cy="45" r="8" fill="#374151" />
        <circle cx="30" cy="45" r="5" fill="#6b7280" />
        <circle cx="70" cy="45" r="5" fill="#6b7280" />

        {/* Fire Animation */}
        <g className={`transition-all duration-500 ${animate ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
          {/* Fire flames */}
          <path
            d="M85 40 Q90 38 92 35 Q94 32 96 35 Q98 38 95 42 Q92 45 88 43 Z"
            fill="#ef4444"
            className="animate-pulse"
          />
          <path
            d="M87 42 Q91 40 93 37 Q95 34 97 37 Q99 40 96 44 Q93 47 89 45 Z"
            fill="#f97316"
            className="animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <path
            d="M89 44 Q92 42 94 39 Q96 36 98 39 Q100 42 97 46 Q94 49 90 47 Z"
            fill="#fbbf24"
            className="animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </g>
      </svg>
    </div>
  )
}
