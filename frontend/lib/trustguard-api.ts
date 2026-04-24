export const BASE = "http://127.0.0.1:8000"

export type Severity = "High" | "Medium" | "Low"

export interface BackendPattern {
  id: number
  type: string
  severity: Severity
  location: string
  evidence: string
  user_impact: string
  fix: string
  confidence: number
}

export interface ScanResult {
  scan_id: string
  filename: string
  patterns: BackendPattern[]
  manipulation_score: number
  verdict: string
  ethical_rating: "Manipulative" | "Questionable" | "Mostly Clean" | "Ethical"
  timestamp: string
  screenshot?: string 
}

const readError = async (res: Response) => {
  const contentType = res.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    const payload = await res.json()
    if (payload?.detail) return String(payload.detail)
  }
  return await res.text()
}

export async function analyzeImage(file: File): Promise<ScanResult> {
  const form = new FormData()
  form.append("file", file)

  const res = await fetch(`${BASE}/analyze`, {
    method: "POST",
    body: form,
  })

  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function analyzeUrl(url: string): Promise<ScanResult> {
  const res = await fetch(`${BASE}/analyze-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function downloadReport(scanId: string) {
  const res = await fetch(`${BASE}/report/${scanId}`)
  if (!res.ok) throw new Error(await readError(res))

  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = objectUrl
  a.download = `trustguard-audit-${scanId}.pdf`
  a.click()
  URL.revokeObjectURL(objectUrl)
}

export async function getSamples(): Promise<ScanResult[]> {
  const res = await fetch(`${BASE}/samples`)
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}
