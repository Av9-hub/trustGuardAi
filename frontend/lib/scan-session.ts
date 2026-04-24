import type { ScanResult } from "@/lib/trustguard-api"

const RESULT_KEY = "trustguard:last-result"
const PREVIEW_KEY = "trustguard:last-preview-url"

export function saveLatestResult(result: ScanResult, previewUrl?: string) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result))
  if (previewUrl) {
    sessionStorage.setItem(PREVIEW_KEY, previewUrl)
  } else {
    sessionStorage.removeItem(PREVIEW_KEY) // ✅ CLEAR OLD IMAGE
  }

}

export function readLatestResult() {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(RESULT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ScanResult
  } catch {
    return null
  }
}

export function readLatestPreviewUrl() {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(PREVIEW_KEY)
}
