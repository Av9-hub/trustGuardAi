"use client"

import { 
  ShieldAlert, 
  EyeOff, 
  Lock, 
  Timer, 
  Shuffle, 
  HelpCircle, 
  Layers, 
  UserX, 
  RefreshCw, 
  ArrowLeftRight,
  type LucideIcon
} from "lucide-react"

interface Pattern {
  name: string
  description: string
  severity: "HIGH" | "MED" | "LOW"
  icon: LucideIcon
}

const patterns: Pattern[] = [
  {
    name: "Confirmshaming",
    description: "Guilt-tripping users into opting in",
    severity: "HIGH",
    icon: ShieldAlert,
  },
  {
    name: "Hidden Costs",
    description: "Fees revealed only at checkout",
    severity: "HIGH",
    icon: EyeOff,
  },
  {
    name: "Roach Motel",
    description: "Easy to sign up, hard to cancel",
    severity: "HIGH",
    icon: Lock,
  },
  {
    name: "Fake Urgency",
    description: "False countdowns and scarcity",
    severity: "HIGH",
    icon: Timer,
  },
  {
    name: "Misdirection",
    description: "Attention diverted from key info",
    severity: "MED",
    icon: Shuffle,
  },
  {
    name: "Trick Questions",
    description: "Confusing double negatives",
    severity: "MED",
    icon: HelpCircle,
  },
  {
    name: "Disguised Ads",
    description: "Ads that look like content",
    severity: "MED",
    icon: Layers,
  },
  {
    name: "Privacy Zuckering",
    description: "Tricked into sharing more data",
    severity: "HIGH",
    icon: UserX,
  },
  {
    name: "Forced Continuity",
    description: "Auto-renew without clear notice",
    severity: "MED",
    icon: RefreshCw,
  },
  {
    name: "Bait & Switch",
    description: "Advertised item unavailable",
    severity: "HIGH",
    icon: ArrowLeftRight,
  },
]

function getSeverityColor(severity: string) {
  switch (severity) {
    case "HIGH":
      return {
        border: "border-l-danger",
        text: "text-danger",
        icon: "text-danger",
        bg: "group-hover:shadow-danger/10",
      }
    case "MED":
      return {
        border: "border-l-warning",
        text: "text-warning",
        icon: "text-warning",
        bg: "group-hover:shadow-warning/10",
      }
    default:
      return {
        border: "border-l-accent-cyan",
        text: "text-accent-cyan",
        icon: "text-accent-cyan",
        bg: "group-hover:shadow-accent-cyan/10",
      }
  }
}

export function PatternsSection() {
  return (
    <section id="compare" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <p className="font-mono text-sm text-accent-cyan tracking-[0.15em] mb-4 animate-fade-up">
          {"// THREAT TAXONOMY"}
        </p>

        {/* Title */}
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.03em] text-text-primary mb-12 animate-fade-up animate-delay-100">
          10 manipulation tactics. All caught.
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {patterns.map((pattern, index) => {
            const colors = getSeverityColor(pattern.severity)
            const Icon = pattern.icon
            
            return (
              <div
                key={pattern.name}
                className={`group relative bg-bg-surface border border-border rounded-lg p-4 hover:bg-bg-elevated transition-all duration-200 border-l-[3px] ${colors.border} animate-fade-up`}
                style={{ animationDelay: `${(index + 2) * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                
                <h3 className="font-body font-semibold text-sm text-text-primary mb-1">
                  {pattern.name}
                </h3>
                
                <p className="font-body text-xs text-text-secondary leading-relaxed mb-3">
                  {pattern.description}
                </p>
                
                <span className={`font-mono text-[10px] ${colors.text}`}>
                  {pattern.severity}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
