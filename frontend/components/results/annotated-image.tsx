"use client"

import type { CSSProperties } from "react"
import type { BackendPattern } from "@/lib/trustguard-api"

interface AnnotatedImageProps {
  imageUrl?: string | null
  patterns: BackendPattern[]
  activePatternId: number | null
  onBadgeClick: (id: number) => void
}

const positionMap: Record<string, CSSProperties> = {
  "top-left": { top: "10%", left: "15%" },
  "top-center": { top: "10%", left: "45%" },
  "top-right": { top: "10%", right: "15%" },
  "middle-left": { top: "45%", left: "10%" },
  center: { top: "45%", left: "45%" },
  "middle-right": { top: "45%", right: "10%" },
  "bottom-left": { bottom: "15%", left: "15%" },
  "bottom-center": { bottom: "15%", left: "45%" },
  "bottom-right": { bottom: "15%", right: "15%" },
}

export function AnnotatedImage({ imageUrl, patterns, activePatternId, onBadgeClick }: AnnotatedImageProps) {
  return (
    <div className="relative rounded-lg border border-border bg-bg-surface p-3">
      <div className="relative overflow-hidden rounded-md border border-border min-h-[260px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Annotated scanned UI" className="h-auto w-full object-cover" />
        ) : (
          <div className="flex min-h-[260px] items-center justify-center text-text-muted font-mono text-sm">
            URL scan result (no uploaded image preview)
          </div>
        )}

        {patterns.map((pattern) => {
          const isActive = pattern.id === activePatternId
          return (
            <button
              key={pattern.id}
              onClick={() => onBadgeClick(pattern.id)}
              className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-accent-cyan text-bg-void text-xs font-bold transition-all duration-200"
              style={{
                ...(positionMap[pattern.location] ?? positionMap.center),
                transform: isActive ? "scale(1.3)" : "scale(1)",
                boxShadow: isActive ? "0 0 18px rgba(34,211,238,0.85)" : "none",
              }}
            >
              {pattern.id}
            </button>
          )
        })}
      </div>
    </div>
  )
}
