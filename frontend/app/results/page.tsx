"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { AnnotatedImage } from "@/components/results/annotated-image"
import { PatternsPanel } from "@/components/results/patterns-panel"
import { ScoreRing } from "@/components/results/score-ring"
import { downloadReport } from "@/lib/trustguard-api"
import { readLatestPreviewUrl, readLatestResult } from "@/lib/scan-session"
import type { PatternData } from "@/components/results/pattern-card"

export default function ResultsPage() {
  const router = useRouter()
  const [activePatternId, setActivePatternId] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [resultLoaded, setResultLoaded] = useState(false)
  const result = useMemo(() => readLatestResult(), [])

  useEffect(() => {
    if (!result) {
      router.replace("/")
      return
    }
    setImageUrl(readLatestPreviewUrl())
    setResultLoaded(true)
  }, [result, router])

  if (!resultLoaded || !result) return null

  const patterns: PatternData[] = result.patterns.map((pattern) => ({
    id: pattern.id,
    type: pattern.type,
    severity: pattern.severity,
    evidence: pattern.evidence,
    userImpact: pattern.user_impact,
    recommendedFix: pattern.fix,
    confidence: Math.round(pattern.confidence * 100),
  }))

  return (
    <div className="min-h-screen bg-bg-void pb-20">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-lg border border-border bg-bg-surface p-5">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <ScoreRing score={result.manipulation_score} />
              <div>
                <p className="font-mono text-xs text-accent-cyan">// AUDIT RESULT</p>
                <h1 className="font-display text-3xl text-text-primary">{result.filename}</h1>
                <p className="mt-2 text-text-secondary">{result.verdict}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await downloadReport(result.scan_id)
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Unable to download report"
                  toast.error(`Scan failed - ${message}`)
                }
              }}
              className="h-fit rounded-md border border-border px-4 py-2 font-mono text-sm text-text-primary hover:border-border-bright"
            >
              Download Report
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <AnnotatedImage
              imageUrl={imageUrl}
              patterns={result.patterns}
              activePatternId={activePatternId}
              onBadgeClick={setActivePatternId}
            />
          </div>

          <div>
            <PatternsPanel
              patterns={patterns}
              activePatternId={activePatternId}
              onPatternSelect={setActivePatternId}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
