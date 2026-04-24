"use client"

import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { analyzeImage, analyzeUrl, type ScanResult } from "@/lib/trustguard-api"
import { ScoreRing } from "@/components/results/score-ring"
import { ScanningOverlay } from "@/components/scanning-overlay"
import { toast } from "react-hot-toast"

type InputState = {
  file: File | null
  url: string
}

const initialInput: InputState = { file: null, url: "" }

const canRun = (input: InputState) => Boolean(input.file || /^https?:\/\//i.test(input.url.trim()))

export default function ComparePage() {
  const [siteA, setSiteA] = useState<InputState>(initialInput)
  const [siteB, setSiteB] = useState<InputState>(initialInput)
  const [isScanning, setIsScanning] = useState(false)
  const [resultA, setResultA] = useState<ScanResult | null>(null)
  const [resultB, setResultB] = useState<ScanResult | null>(null)

  const compareEnabled = canRun(siteA) && canRun(siteB)

  const delta = useMemo(() => {
    if (!resultA || !resultB) return null
    return Math.abs(resultA.manipulation_score - resultB.manipulation_score)
  }, [resultA, resultB])

  const compareLabel = useMemo(() => {
    if (!resultA || !resultB || delta === null) return ""
    if (resultA.manipulation_score > resultB.manipulation_score) {
      return `${resultA.filename} is ${delta}% MORE MANIPULATIVE than ${resultB.filename}`
    }
    return `${resultB.filename} is ${delta}% MORE ETHICAL than ${resultA.filename}`
  }, [delta, resultA, resultB])

  const runAnalyze = async (input: InputState) => {
    if (input.file) return analyzeImage(input.file)
    return analyzeUrl(input.url.trim())
  }

  return (
    <main className="min-h-screen bg-bg-void px-6 py-10">
      <ScanningOverlay open={isScanning} />
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-4xl text-text-primary mb-8">Compare Two Interfaces</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <UploadPane label="Upload Site A" input={siteA} setInput={setSiteA} />
          <UploadPane label="Upload Site B" input={siteB} setInput={setSiteB} />
        </div>

        <button
          disabled={!compareEnabled || isScanning}
          onClick={async () => {
            try {
              setIsScanning(true)
              const [a, b] = await Promise.all([runAnalyze(siteA), runAnalyze(siteB)])
              setResultA(a)
              setResultB(b)
              toast.success("Scan complete - comparison generated")
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unexpected error"
              toast.error(`Scan failed - ${message}`)
            } finally {
              setIsScanning(false)
            }
          }}
          className="mt-6 rounded-md bg-accent-cyan px-5 py-2 font-mono text-bg-void disabled:opacity-40"
        >
          Compare
        </button>

        {resultA && resultB && (
          <>
            <section className="mt-10 grid gap-6 md:grid-cols-[1fr_auto_1fr] items-center">
              <ResultCol title="Site A" result={resultA} />
              <p className="font-display text-4xl text-text-muted text-center">VS</p>
              <ResultCol title="Site B" result={resultB} />
            </section>
            <div className="mt-8 rounded-md border border-border bg-bg-surface p-4 text-center text-text-primary font-semibold">
              {compareLabel}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function UploadPane({
  label,
  input,
  setInput,
}: {
  label: string
  input: InputState
  setInput: Dispatch<SetStateAction<InputState>>
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-4">
      <p className="mb-3 font-mono text-sm text-accent-cyan">{label}</p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => setInput((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))}
        className="mb-3 block w-full text-sm text-text-secondary"
      />
      <input
        value={input.url}
        onChange={(event) => setInput((prev) => ({ ...prev, url: event.target.value }))}
        placeholder="or paste https:// URL"
        className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text-primary"
      />
    </div>
  )
}

function ResultCol({ title, result }: { title: string; result: ScanResult }) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-5 text-center">
      <p className="font-mono text-xs text-text-muted">{title}</p>
      <h3 className="font-display text-xl text-text-primary mb-3">{result.filename}</h3>
      <div className="mx-auto w-fit">
        <ScoreRing score={result.manipulation_score} />
      </div>
      <p className="text-text-secondary">{result.patterns.length} patterns</p>
    </div>
  )
}
