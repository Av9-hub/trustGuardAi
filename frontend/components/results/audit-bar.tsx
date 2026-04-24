"use client"

import Link from "next/link"
import { ArrowLeft, Download, Share2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuditBarProps {
  target: string
  scanDate: string
  scanTime: string
}

export function AuditBar({ target, scanDate, scanTime }: AuditBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-void/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left - Back link */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>New Audit</span>
        </Link>

        {/* Center - Logo and scan info */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent-cyan" />
            <span className="font-display text-sm font-bold tracking-tight text-text-primary">
              TrustGuard AI
            </span>
          </div>
          <span className="font-mono text-xs text-text-muted">
            {target} · Scanned {scanDate} · {scanTime}
          </span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-accent-cyan/30 bg-transparent text-accent-cyan hover:bg-accent-cyan/10 hover:text-accent-cyan"
          >
            <Download className="h-4 w-4" />
            Export PDF Report
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-2 text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
        </div>
      </div>
    </header>
  )
}
