"use client"

import { Shield } from "lucide-react"
import Link from "next/link"

const navLinks = [
  { label: "DETECT", href: "#detect" },
  { label: "COMPARE", href: "/compare" },
  { label: "REPORTS", href: "/results" },
  { label: "HALL OF SHAME", href: "/hall-of-shame" },
]

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(4,7,15,0.8)] backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent-cyan" />
          <span className="font-display text-lg font-bold tracking-tight text-text-primary">
            TrustGuard<span className="text-accent-cyan">AI</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-text-secondary uppercase tracking-[0.1em] hover:text-text-primary transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs font-mono text-accent-cyan border border-accent-cyan/50 px-2 py-0.5 rounded">
            [BETA]
          </span>
          <button className="text-sm font-medium text-accent-cyan border border-accent-cyan px-4 py-1.5 rounded-md hover:bg-accent-cyan-glow transition-colors duration-150">
            Start Audit →
          </button>
        </div>
      </div>
    </nav>
  )
}
