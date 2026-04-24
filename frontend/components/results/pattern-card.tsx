"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, CheckCircle } from "lucide-react"

export interface PatternData {
  id: number
  type: string
  severity: "High" | "Medium" | "Low"
  evidence: string
  userImpact: string
  recommendedFix: string
  confidence: number
}

interface PatternCardProps {
  pattern: PatternData
  isActive: boolean
  isExpanded: boolean
  animationDelay: number
  onExpand: () => void
}

export function PatternCard({ pattern, isActive, isExpanded, animationDelay, onExpand }: PatternCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const severityStyles = {
    High: {
      border: "border-l-danger",
      bg: "bg-danger/10",
      text: "text-danger",
      badgeBg: "bg-danger",
      badgeText: "text-bg-void"
    },
    Medium: {
      border: "border-l-warning",
      bg: "bg-warning/10",
      text: "text-warning",
      badgeBg: "bg-warning",
      badgeText: "text-bg-void"
    },
    Low: {
      border: "border-l-accent-cyan",
      bg: "bg-accent-cyan/10",
      text: "text-accent-cyan",
      badgeBg: "bg-accent-cyan",
      badgeText: "text-bg-void"
    }
  }

  const styles = severityStyles[pattern.severity]

  useEffect(() => {
    if (isActive && cardRef.current) {
          cardRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    })
    }
  }, [isActive])

  const handleClick = () => {
    onExpand()
  }

  return (
    <div
      ref={cardRef}
      className={`rounded-lg border border-border ${styles.border} border-l-[3px] bg-bg-surface transition-all duration-150 hover:border-border-bright hover:bg-bg-elevated ${isActive ? "animate-cyan-flash" : ""}`}
    >
      {/* Header - always visible */}
      <button
        onClick={handleClick}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {/* Number badge */}
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${styles.badgeBg} font-mono text-xs font-bold ${styles.badgeText}`}>
            {pattern.id}
          </span>
          
          {/* Pattern type */}
          <span className="font-body text-[15px] font-semibold text-text-primary">
            {pattern.type}
          </span>

          {/* Severity chip */}
          <span className={`rounded-full border ${styles.bg} ${styles.text} border-current px-2 py-0.5 font-mono text-xs`}>
            {pattern.severity}
          </span>
        </div>

        {/* Expand icon */}
        <ChevronDown 
          className={`h-5 w-5 text-text-muted transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
      isExpanded
        ? "max-h-[1000px] opacity-100"
        : "max-h-0 opacity-0 pointer-events-none"
    }`}
      >
        <div
    className={`space-y-4 px-4 pb-4 pt-4 transition-all duration-300 ${
      isExpanded ? "border-t border-border mt-2" : "border-none mt-0"
    }`}
>
          {/* Evidence */}
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-muted">
              Evidence
            </span>
            <div className="border-l-2 border-accent-cyan bg-bg-void px-3 py-2">
              <p className="font-mono text-sm italic text-text-secondary">
                &quot;{pattern.evidence}&quot;
              </p>
            </div>
          </div>

          {/* User Impact */}
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-muted">
              User Impact
            </span>
            <p className="font-body text-[13px] leading-relaxed text-text-secondary">
              {pattern.userImpact}
            </p>
          </div>

          {/* Recommended Fix */}
          <div className="rounded-md border border-safe/20 bg-safe/5 p-3">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-safe" />
              <span className="font-mono text-xs text-safe">RECOMMENDED FIX</span>
            </div>
            <p className="font-body text-[13px] leading-relaxed text-text-secondary">
              {pattern.recommendedFix}
            </p>
          </div>

          {/* Confidence bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-text-muted">AI Confidence: {pattern.confidence}%</span>
            </div>
            <div className="mt-1 h-[2px] w-full overflow-hidden rounded-full bg-bg-elevated">
              <div 
                className="h-full rounded-full bg-accent-cyan transition-all duration-500"
                style={{ width: `${pattern.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
