"use client"

import { Download, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ExportBarProps {
  patternsCount: number
  score: number
  rating: "MANIPULATIVE" | "QUESTIONABLE" | "MOSTLY ETHICAL"
}

export function ExportBar({ patternsCount, score, rating }: ExportBarProps) {
  const ratingColors = {
    "MANIPULATIVE": "text-danger",
    "QUESTIONABLE": "text-warning",
    "MOSTLY ETHICAL": "text-safe"
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left - Summary */}
        <div className="flex items-center gap-2 font-mono text-sm text-text-secondary">
          <span>{patternsCount} patterns</span>
          <span className="text-text-muted">·</span>
          <span>Score {score}/100</span>
          <span className="text-text-muted">·</span>
          <span className={ratingColors[rating]}>{rating}</span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          <Button 
            className="gap-2 bg-accent-cyan text-bg-void hover:bg-accent-cyan/90"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
          <Button 
            variant="ghost" 
            className="gap-2 text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            asChild
          >
            <Link href="/">
              Scan Another
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
