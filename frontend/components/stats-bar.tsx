"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { value: 2847, label: "PATTERNS\nDETECTED" },
  { value: 10, label: "PATTERN\nTYPES" },
  { value: "< 3s", label: "AVG SCAN\nTIME", isText: true },
]

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(end * easeOut))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [hasStarted, end, duration])

  return { count, ref }
}

export function StatsBar() {
  const stat1 = useCountUp(2847)
  const stat2 = useCountUp(10)

  return (
    <section className="bg-bg-surface border-y border-border py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {/* Stat 1 */}
          <div ref={stat1.ref} className="text-center md:border-r md:border-border">
            <div className="font-mono text-4xl md:text-5xl text-text-primary mb-2">
              {stat1.count.toLocaleString()}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted whitespace-pre-line">
              {"PATTERNS\nDETECTED"}
            </div>
          </div>

          {/* Stat 2 */}
          <div ref={stat2.ref} className="text-center md:border-r md:border-border">
            <div className="font-mono text-4xl md:text-5xl text-text-primary mb-2">
              {stat2.count}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted whitespace-pre-line">
              {"PATTERN\nTYPES"}
            </div>
          </div>

          {/* Stat 3 */}
          <div className="text-center">
            <div className="font-mono text-4xl md:text-5xl text-text-primary mb-2">
              {"< 3s"}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted whitespace-pre-line">
              {"AVG SCAN\nTIME"}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
