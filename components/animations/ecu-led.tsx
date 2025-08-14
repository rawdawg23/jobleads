"use client"

import { useEffect, useState } from "react"

export function ECUWithLED() {
  const [ledState, setLedState] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLedState((prev) => (prev + 1) % 8)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-20 h-16 mx-2">
      <svg viewBox="0 0 80 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* ECU Box */}
        <rect x="10" y="15" width="60" height="35" rx="4" fill="#1f2937" stroke="#374151" strokeWidth="2" />

        {/* ECU Label */}
        <text x="40" y="35" textAnchor="middle" className="text-xs fill-white font-mono">
          ECU
        </text>

        {/* Connector Pins */}
        <rect x="5" y="25" width="5" height="3" fill="#6b7280" />
        <rect x="5" y="30" width="5" height="3" fill="#6b7280" />
        <rect x="5" y="35" width="5" height="3" fill="#6b7280" />
        <rect x="70" y="25" width="5" height="3" fill="#6b7280" />
        <rect x="70" y="30" width="5" height="3" fill="#6b7280" />
        <rect x="70" y="35" width="5" height="3" fill="#6b7280" />

        {/* Slashing LED Lights */}
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            {/* LED Light */}
            <circle
              cx={20 + i * 5}
              cy="8"
              r="2"
              fill={ledState === i ? "#10b981" : "#374151"}
              className={`transition-all duration-100 ${ledState === i ? "drop-shadow-[0_0_6px_#10b981]" : ""}`}
            />

            {/* Slashing effect */}
            {ledState === i && (
              <line
                x1={18 + i * 5}
                y1="6"
                x2={22 + i * 5}
                y2="10"
                stroke="#10b981"
                strokeWidth="1"
                className="animate-pulse opacity-80"
              />
            )}
          </g>
        ))}

        {/* Circuit traces */}
        <path
          d="M20 8 Q25 12 30 8 Q35 12 40 8 Q45 12 50 8 Q55 12 60 8"
          stroke="#10b981"
          strokeWidth="1"
          fill="none"
          className={`transition-opacity duration-300 ${ledState > 0 ? "opacity-60" : "opacity-20"}`}
        />
      </svg>
    </div>
  )
}
