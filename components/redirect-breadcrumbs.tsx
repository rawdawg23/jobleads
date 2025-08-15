"use client"

import React from "react"

import { useEnhancedRedirect } from "./enhanced-redirect-provider"
import { ChevronRight, Clock } from "lucide-react"

export function RedirectBreadcrumbs() {
  const { redirectHistory } = useEnhancedRedirect()

  if (redirectHistory.length === 0) return null

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="flex items-center">
        <Clock className="h-4 w-4 text-blue-400 mr-2" />
        <h4 className="text-sm font-medium text-blue-800">Recent Navigation</h4>
      </div>
      <div className="mt-2">
        <div className="flex items-center space-x-2 text-sm text-blue-700">
          {redirectHistory.slice(-3).map((entry, index) => (
            <React.Fragment key={entry.timestamp}>
              {index > 0 && <ChevronRight className="h-3 w-3" />}
              <span className="truncate max-w-[100px]">
                {entry.from === "/" ? "Home" : entry.from.split("/").pop()}
              </span>
            </React.Fragment>
          ))}
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium">Current</span>
        </div>
      </div>
    </div>
  )
}
