"use client"

import { useEffect, useState } from "react"

const STEPS = [
  "Preprocessing image...",
  "Running pattern classifier...",
  "Calculating manipulation score...",
  "Generating fix suggestions...",
]

export function ScanningOverlay({ open }: { open: boolean }) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (!open) {
      setActiveStep(0)
      return
    }
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length)
    }, 800)
    return () => clearInterval(id)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-cyan-400/60 bg-[#0D1425] p-6 shadow-[0_0_30px_rgba(34,211,238,0.35)] animate-pulse">
        <p className="mb-4 font-mono text-xs tracking-[0.2em] text-cyan-300">// SCANNING</p>
        <h3 className="mb-5 font-display text-xl text-white">TrustGuard analysis in progress</h3>
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const isActive = index === activeStep
            return (
              <p
                key={step}
                className={`font-mono text-sm transition-all duration-300 ${isActive ? "text-cyan-300 opacity-100" : "text-slate-500 opacity-55"}`}
              >
                ⬡ {step}
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}
