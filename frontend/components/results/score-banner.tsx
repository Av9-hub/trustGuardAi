"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Zap, CheckCircle } from "lucide-react"

interface ScoreBannerProps {
  target: string
  score: number
  verdict: string
  patternsFound: number
  highestSeverity: "HIGH" | "MEDIUM" | "LOW"
  confidence: number
}

function ScoreRing({ score }: { score: number }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = mounted ? circumference - (score / 100) * circumference : circumference

  const getColor = () => {
    if (score > 60) return "var(--danger)"
    if (score >= 30) return "var(--warning)"
    return "var(--safe)"
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth="8"
        />
        {/* Score ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 1.5s ease-out",
            filter: `drop-shadow(0 0 8px ${getColor()})`
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span 
          className="font-mono text-7xl font-medium"
          style={{ color: getColor() }}
        >
          {score}
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Manipulation Score
        </span>
      </div>
    </div>
  )
}

function EthicalBadge({ score }: { score: number }) {
  if (score > 60) {
    return (
      <div className="animate-severity-pulse inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-4 py-2">
        <AlertTriangle className="h-4 w-4 text-danger" />
        <span className="font-mono text-sm font-medium text-danger">MANIPULATIVE</span>
      </div>
    )
  }
  if (score >= 30) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-2">
        <Zap className="h-4 w-4 text-warning" />
        <span className="font-mono text-sm font-medium text-warning">QUESTIONABLE</span>
      </div>
    )
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-4 py-2">
      <CheckCircle className="h-4 w-4 text-safe" />
      <span className="font-mono text-sm font-medium text-safe">MOSTLY ETHICAL</span>
    </div>
  )
}

export function ScoreBanner({ 
  target, 
  score, 
  verdict, 
  patternsFound, 
  highestSeverity, 
  confidence 
}: ScoreBannerProps) {
  const severityColor = {
    HIGH: "text-danger",
    MEDIUM: "text-warning",
    LOW: "text-accent-cyan"
  }

  return (
    <section className="w-full bg-gradient-to-b from-bg-base to-bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main hero content */}
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Left side - Text content */}
          <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
            <span className="font-mono text-sm text-accent-cyan">// AUDIT COMPLETE</span>
            <h1 className="mt-3 font-display text-3xl font-bold text-text-primary">
              {target}
            </h1>
            <p className="mt-4 font-body text-base leading-relaxed text-text-secondary">
              {verdict}
            </p>
            <div className="mt-6">
              <EthicalBadge score={score} />
            </div>
          </div>

          {/* Right side - Score ring */}
          <div className="flex-shrink-0">
            <ScoreRing score={score} />
          </div>
        </div>

        {/* Metric cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg border border-border bg-bg-surface p-6">
            <span className="font-mono text-3xl font-medium text-text-primary">{patternsFound}</span>
            <span className="mt-1 font-mono text-xs uppercase tracking-widest text-text-muted">
              Patterns Found
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-border bg-bg-surface p-6">
            <span className={`font-mono text-3xl font-medium ${severityColor[highestSeverity]}`}>
              {highestSeverity}
            </span>
            <span className="mt-1 font-mono text-xs uppercase tracking-widest text-text-muted">
              Highest Severity
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-border bg-bg-surface p-6">
            <span className="font-mono text-3xl font-medium text-text-primary">{confidence}%</span>
            <span className="mt-1 font-mono text-xs uppercase tracking-widest text-text-muted">
              Confidence
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
