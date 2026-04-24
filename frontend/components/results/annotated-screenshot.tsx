"use client"

import { useState } from "react"
import Image from "next/image"

export interface PatternMarker {
  id: number
  x: number // percentage from left
  y: number // percentage from top
  width: number // percentage width
  height: number // percentage height
  severity: "HIGH" | "MEDIUM" | "LOW"
}

interface AnnotatedScreenshotProps {
  imageSrc: string
  markers: PatternMarker[]
  activeMarkerId: number | null
  onMarkerClick: (id: number) => void
}

export function AnnotatedScreenshot({ 
  imageSrc, 
  markers, 
  activeMarkerId, 
  onMarkerClick 
}: AnnotatedScreenshotProps) {
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null)

  const getSeverityColor = (severity: "HIGH" | "MEDIUM" | "LOW") => {
    switch (severity) {
      case "HIGH": return { bg: "bg-danger", border: "border-danger", text: "text-bg-void" }
      case "MEDIUM": return { bg: "bg-warning", border: "border-warning", text: "text-bg-void" }
      case "LOW": return { bg: "bg-accent-cyan", border: "border-accent-cyan", text: "text-bg-void" }
    }
  }

  return (
    <div className="rounded-lg border border-border bg-bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-sm text-accent-cyan">Evidence View</span>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-blink absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan"></span>
          </span>
          <span className="font-mono text-xs text-text-muted">LIVE ANNOTATION</span>
        </div>
      </div>

      {/* Screenshot container */}
      <div className="relative p-4">
        <div className="relative overflow-hidden rounded-md border border-border">
          <Image
            src={imageSrc}
            alt="Scanned UI screenshot"
            width={800}
            height={600}
            className="h-auto w-full"
          />
          
          {/* Overlay markers */}
          {markers.map((marker) => {
            const colors = getSeverityColor(marker.severity)
            const isHovered = hoveredMarkerId === marker.id
            const isActive = activeMarkerId === marker.id

            return (
              <div key={marker.id}>
                {/* Highlight box - visible on hover */}
                {(isHovered || isActive) && (
                  <div
                    className={`absolute ${colors.border} pointer-events-none border-2 transition-opacity duration-150`}
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      width: `${marker.width}%`,
                      height: `${marker.height}%`,
                      backgroundColor: marker.severity === "HIGH" 
                        ? "rgba(248,113,113,0.1)" 
                        : marker.severity === "MEDIUM"
                        ? "rgba(251,191,36,0.1)"
                        : "rgba(56,189,248,0.1)"
                    }}
                  />
                )}
                
                {/* Number badge */}
                <button
                  onClick={() => onMarkerClick(marker.id)}
                  onMouseEnter={() => setHoveredMarkerId(marker.id)}
                  onMouseLeave={() => setHoveredMarkerId(null)}
                  className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${colors.bg} font-mono text-xs font-bold ${colors.text} transition-all duration-150 hover:scale-110 ${isActive ? "ring-2 ring-white/50" : ""}`}
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                  }}
                >
                  {marker.id}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Helper text */}
      <div className="border-t border-border px-4 py-3">
        <p className="font-mono text-xs text-text-muted">
          Click any numbered marker to inspect the pattern
        </p>
      </div>
    </div>
  )
}
