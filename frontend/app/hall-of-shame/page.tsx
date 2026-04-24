"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSamples, type ScanResult } from "@/lib/trustguard-api"
import { ScoreRing } from "@/components/results/score-ring"
import { saveLatestResult } from "@/lib/scan-session"
import { toast } from "react-hot-toast"

export default function HallOfShamePage() {
  const router = useRouter()
  const [samples, setSamples] = useState<ScanResult[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setSamples(await getSamples())
      } catch {
        toast.error("Scan failed - check your connection")
      }
    }
    load()
  }, [])

const SAMPLE_IMAGES: Record<string, string> = {
  "Amazon Checkout": "/samples/amazon.jpg",
  "Booking.com": "/samples/booking.jpg",
  "LinkedIn Premium": "/samples/linkedin.png",
  "Generic Cookie Banner": "/samples/cookie.jpg",
}

  return (
    <main className="min-h-screen bg-bg-void px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs tracking-[0.2em] text-accent-cyan mb-4">// DOCUMENTED OFFENDERS</p>
        <h1 className="font-display text-4xl text-text-primary mb-3">Real UIs. Real Manipulation.</h1>
        <p className="mx-auto mb-10 max-w-[600px] text-center text-text-secondary">
          These patterns were found on real, live websites used by millions of users every day.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {samples.map((sample) => (
            <article key={sample.scan_id} className="rounded-lg border border-border bg-bg-surface p-4">
              <p className="text-2xl mb-1">🌐</p>
              <h3 className="font-display text-xl text-text-primary">{sample.filename}</h3>
              <div className="my-4">
                <ScoreRing score={sample.manipulation_score} size={60} />
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {sample.patterns.slice(0, 4).map((pattern) => (
                  <span key={`${sample.scan_id}-${pattern.id}`} className="rounded-full border border-border px-2 py-1 font-mono text-xs text-text-secondary">
                    {pattern.type}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  const preview = SAMPLE_IMAGES[sample.filename]

                  saveLatestResult(sample, preview)
                  router.push("/results")
                }}
                className="font-mono text-sm text-accent-cyan hover:underline"
              >
                View Full Audit →
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
