"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ScanLine } from "lucide-react"
import { toast } from "react-hot-toast"
import { analyzeImage, analyzeUrl } from "@/lib/trustguard-api"
import { saveLatestResult } from "@/lib/scan-session"
import { ScanningOverlay } from "@/components/scanning-overlay"

const sampleScans = [
  { name: "Amazon Checkout", score: 81, severity: "danger" },
  { name: "Booking.com", score: 76, severity: "danger" },
  { name: "Cookie Banner", score: 68, severity: "warning" },
]

export function UploadSection() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [urlError, setUrlError] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return
      const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"))
      if (!imageItem) return
      const file = imageItem.getAsFile()
      if (!file) return
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setUrlError("")
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFile = (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Scan failed - please upload an image file")
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const newPreviewUrl = URL.createObjectURL(file)
    setSelectedFile(file)
    setPreviewUrl(newPreviewUrl)
    setUrlError("")
  }

  const runImageScan = async () => {
    if (!selectedFile || !previewUrl) return
    try {
      setIsScanning(true)
      const result = await analyzeImage(selectedFile)
      saveLatestResult(result, previewUrl)
      toast.success(`Scan complete - ${result.patterns.length} patterns detected`)
      router.push("/results")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error"
      toast.error(`Scan failed - ${message}`)
    } finally {
      setIsScanning(false)
    }
  }

  const runUrlScan = async () => {
    const trimmed = urlInput.trim()
    if (!/^https?:\/\//i.test(trimmed)) {
      setUrlError("Please include https://")
      return
    }
    try {
      setUrlError("")
      setIsScanning(true)
      const result = await analyzeUrl(trimmed)

      // ✅ convert base64 → preview URL
      let preview: string | undefined = undefined
      if (result.screenshot) {
        preview = `data:image/jpeg;base64,${result.screenshot}`
      }

      // ✅ save both result + screenshot
      saveLatestResult(result, preview)
      toast.success(`Scan complete - ${result.patterns.length} patterns detected`)
      router.push("/results")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error"
      toast.error(`Scan failed - ${message}`)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <section id="detect" className="py-20 px-6">
      <ScanningOverlay open={isScanning} />
      <div className="max-w-3xl mx-auto">
        {/* Section Label */}
        <p className="font-mono text-sm text-accent-cyan tracking-[0.15em] mb-4 animate-fade-up">
          {"// BEGIN AUDIT"}
        </p>

        {/* Title */}
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.03em] text-text-primary mb-8 animate-fade-up animate-delay-100">
          Drop a screenshot. Get the truth.
        </h2>

        {/* Upload Box */}
        <div
          onDrop={(event) => {
            event.preventDefault()
            handleFile(event.dataTransfer.files?.[0])
          }}
          onDragOver={(event) => event.preventDefault()}
          className="group relative bg-bg-surface border-[1.5px] border-dashed border-accent-cyan/30 rounded-lg p-12 md:p-16 hover:border-accent-cyan/60 hover:bg-bg-elevated transition-all duration-200 cursor-pointer animate-fade-up animate-delay-200"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => handleFile(event.target.files?.[0])}
            className="hidden"
          />
          <div className="flex flex-col items-center text-center">
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Selected screenshot preview" className="mb-4 h-32 w-auto rounded-md object-cover" />
                <p className="font-body font-medium text-base text-text-primary mb-2">{selectedFile?.name}</p>
                <button
                  onClick={runImageScan}
                  className="mt-3 bg-accent-cyan text-bg-void font-mono text-sm font-medium px-4 py-2 rounded-md hover:bg-accent-cyan/90 transition-colors duration-150"
                >
                  Analyze This →
                </button>
              </>
            ) : (
              <>
                <ScanLine className="w-12 h-12 text-accent-cyan mb-4" />
                <p className="font-body font-medium text-lg text-text-primary mb-2">Drop screenshot here</p>
                <p className="font-mono text-xs text-text-muted">or paste from clipboard · PNG, JPG, WebP · Max 10MB</p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mt-6 text-sm font-medium text-text-secondary border border-border px-4 py-2 rounded-md hover:border-border-bright hover:text-text-primary transition-colors duration-150"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sample Chips */}
        <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-up animate-delay-300">
          {sampleScans.map((scan) => (
            <button
              key={scan.name}
              className="inline-flex items-center gap-2 bg-bg-elevated border border-border rounded-full px-3 py-1.5 hover:border-border-bright transition-colors duration-150"
            >
              <span 
                className={`w-2 h-2 rounded-full ${
                  scan.severity === "danger" ? "bg-danger" : "bg-warning"
                }`} 
              />
              <span className="font-mono text-xs text-text-secondary">
                {scan.name}
              </span>
              <span className="font-mono text-xs text-text-muted">
                — {scan.score}/100
              </span>
            </button>
          ))}
        </div>

        {/* URL Input */}
        <div className="mt-8 animate-fade-up animate-delay-400">
          <div className="flex items-stretch bg-bg-surface border border-border rounded-md overflow-hidden focus-within:border-border-bright transition-colors duration-150">
            <input
              type="url"
              placeholder="Enter live URL to audit — https://..."
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runUrlScan()
              }}
              className="flex-1 bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted px-4 py-3 outline-none"
            />
            <button onClick={runUrlScan} className="bg-accent-cyan text-bg-void font-mono text-sm font-medium px-4 py-3 hover:bg-accent-cyan/90 transition-colors duration-150 whitespace-nowrap">
              SCAN LIVE →
            </button>
          </div>
          {urlError && <p className="font-mono text-xs text-danger mt-2">{urlError}</p>}
          <p className="font-mono text-[10px] text-text-muted mt-2 text-center">
            Captures live screenshot using headless browser
          </p>
        </div>
      </div>
    </section>
  )
}
