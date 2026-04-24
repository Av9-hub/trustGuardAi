"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CompareBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border-bright bg-bg-surface">
      {/* Subtle cyan gradient on left edge */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-accent-cyan/50 via-accent-cyan to-accent-cyan/50" />
      
      <div className="flex items-center justify-between px-6 py-4">
        <p className="font-body text-text-secondary">
          See how this compares to ethical alternatives
        </p>
        <Button 
          variant="ghost" 
          className="gap-2 text-accent-cyan hover:bg-accent-cyan/10 hover:text-accent-cyan"
        >
          Run Compare Mode
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
