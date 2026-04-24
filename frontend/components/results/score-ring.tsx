"use client"

import { useEffect, useMemo, useState } from "react"

interface ScoreRingProps {
  score: number
  size?: number
}

export function ScoreRing({ score, size = 160 }: ScoreRingProps) {
  const safeScore = Math.max(0, Math.min(100, score))
  const r = 60
  const circumference = 2 * Math.PI * r
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOffset(circumference * (1 - safeScore / 100))
    })
    return () => cancelAnimationFrame(id)
  }, [circumference, safeScore])

  const color = useMemo(() => {
    if (safeScore > 60) return "#F87171"
    if (safeScore >= 30) return "#FBBF24"
    return "#34D399"
  }, [safeScore])

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" role="img" aria-label={`Manipulation score ${safeScore}`}>
      <circle cx="80" cy="80" r={r} fill="none" stroke="#1E293B" strokeWidth="12" />
      <circle
        cx="80"
        cy="80"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 80 80)"
        style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
      />
      <text x="80" y="88" textAnchor="middle" className="fill-white text-3xl font-mono">
        {safeScore}
      </text>
    </svg>
  )
}
