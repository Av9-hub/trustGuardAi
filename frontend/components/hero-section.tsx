"use client"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
      
      {/* Diagonal watermark text */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-extrabold text-[20vw] text-white opacity-[0.015] whitespace-nowrap"
          style={{ transform: 'translate(-50%, -50%) rotate(-20deg)' }}
        >
          TRUSTGUARD TRUSTGUARD
        </div>
      </div>

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-px bg-accent-cyan scan-line pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left Content - 60% */}
          <div className="lg:w-[60%] animate-fade-up">
            {/* Eyebrow */}
            <p className="font-mono text-sm text-accent-cyan tracking-[0.15em] mb-6">
              {"// UI ETHICS INTELLIGENCE PLATFORM"}
            </p>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-[-0.03em] text-text-primary mb-6">
              Every dark pattern.
              <br />
              <span className="glitch-text inline-block">Exposed.</span>
            </h1>

            {/* Description */}
            <p className="font-body text-lg text-text-secondary leading-relaxed max-w-[480px] tracking-[0.02em] mb-8">
              TrustGuard AI scans any UI screenshot or live URL and surfaces 
              manipulation tactics used against your users — with severity scores, 
              evidence, and ethical fix suggestions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button className="bg-accent-cyan text-bg-void font-semibold px-6 py-3 rounded-md hover:bg-accent-cyan/90 transition-colors duration-150">
                Run Your First Audit
              </button>
              <button className="text-accent-cyan font-medium hover:underline transition-all duration-150">
                See Live Demo →
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 text-text-muted font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <span>⚡️</span>
                <span>{"< 3s scan time"}</span>
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5">
                <span>🔍</span>
                <span>10 pattern types</span>
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5">
                <span>📄</span>
                <span>PDF reports</span>
              </span>
            </div>
          </div>

          {/* Right Content - Scan Result Card */}
          <div className="lg:w-[40%] animate-fade-up animate-delay-200">
            <div className="relative">
              {/* Cyan glow behind card */}
              <div className="absolute inset-0 bg-accent-cyan/10 blur-3xl rounded-full" />
              
              {/* Main Card */}
              <div 
                className="relative bg-bg-surface border border-border-bright rounded-lg p-6 animate-float"
                style={{ boxShadow: '0 0 60px rgba(56,189,248,0.08)' }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-text-muted truncate max-w-[200px]">
                    trustguard.ai/scan/amazon-checkout
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-safe" />
                    <span className="font-mono text-xs text-safe">COMPLETE</span>
                  </span>
                </div>

                {/* Score */}
                <div className="text-center mb-6">
                  <div className="font-mono text-7xl md:text-8xl font-medium text-danger">
                    74
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted mt-1">
                    Manipulation Score
                  </div>
                </div>

                {/* Pattern Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono border border-danger/30 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                    <span className="text-text-secondary">Fake Urgency</span>
                    <span className="text-danger">— HIGH</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono border border-warning/30 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    <span className="text-text-secondary">Confirmshaming</span>
                    <span className="text-warning">— MED</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono border border-danger/30 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                    <span className="text-text-secondary">Hidden Costs</span>
                    <span className="text-danger">— HIGH</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: '74%',
                      background: 'linear-gradient(90deg, #38BDF8, #F87171)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
