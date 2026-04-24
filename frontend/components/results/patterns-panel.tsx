"use client"

import { useReducer, useState } from "react"
import { ChevronDown } from "lucide-react"
import { PatternCard, type PatternData } from "./pattern-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo } from "react"
interface PatternsPanelProps {
  patterns: PatternData[]
  activePatternId: number | null
  onPatternSelect: (id: number) => void
}

type SortOption = "severity" | "confidence" | "id"
type ExpandedState = { expandedId: number | null }
type ExpandedAction = { type: "toggle"; id: number }

function expandedReducer(state: ExpandedState, action: ExpandedAction): ExpandedState {
  if (action.type === "toggle") {
    return {
      expandedId: state.expandedId === action.id ? null : action.id
    }
  }
  return state
}

export function PatternsPanel({ patterns, activePatternId, onPatternSelect }: PatternsPanelProps) {
  const [sortBy, setSortBy] = useState<SortOption>("severity")
  const [expanded, dispatchExpanded] = useReducer(expandedReducer, { expandedId: null })

  const sortPatterns = (patterns: PatternData[], sortBy: SortOption) => {
    const sorted = [...patterns]
    switch (sortBy) {
      case "severity":
        const severityOrder = { High: 0, Medium: 1, Low: 2 }
        return sorted.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
      case "confidence":
        return sorted.sort((a, b) => b.confidence - a.confidence)
      case "id":
        return sorted.sort((a, b) => a.id - b.id)
      default:
        return sorted
    }
  }

    

    const sortedPatterns = useMemo(() => {
      return sortPatterns(patterns, sortBy)
    }, [patterns, sortBy])

  const sortLabels: Record<SortOption, string> = {
    severity: "Sort by Severity",
    confidence: "Sort by Confidence",
    id: "Sort by Order"
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {patterns.length} Patterns Detected
        </h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-xs text-text-muted hover:bg-bg-elevated hover:text-text-secondary"
            >
              {sortLabels[sortBy]}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-bg-surface border-border">
            <DropdownMenuItem 
              onClick={() => setSortBy("severity")}
              className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              Sort by Severity
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy("confidence")}
              className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              Sort by Confidence
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy("id")}
              className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              Sort by Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Pattern cards */}
      <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-2 scroll-smooth">
        {sortedPatterns.map((pattern, index) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            isActive={activePatternId === pattern.id}
            isExpanded={expanded.expandedId === pattern.id}
            animationDelay={index * 60}
            onExpand={() => {
              onPatternSelect(pattern.id)
              dispatchExpanded({ type: "toggle", id: pattern.id })
            }}
          />
        ))}
      </div>
    </div>
  )
}
