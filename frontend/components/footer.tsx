import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-bg-void border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent-cyan" />
          <span className="font-display text-sm font-bold tracking-tight text-text-muted">
            TrustGuard<span className="text-accent-cyan/70">AI</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="font-body text-xs text-text-muted text-center">
          Built to make the web more honest.
        </p>

        {/* Version */}
        <span className="font-mono text-xs text-text-muted">
          v1.0.0 — 2026
        </span>
      </div>
    </footer>
  )
}
