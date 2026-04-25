from __future__ import annotations

import math
from datetime import datetime
from typing import Literal
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field, HttpUrl


class PatternFound(BaseModel):
    id: int
    type: str
    severity: Literal["High", "Medium", "Low"]
    location: str
    evidence: str
    user_impact: str
    fix: str
    confidence: float = Field(ge=0.0, le=1.0)


class ScanResult(BaseModel):
    scan_id: str
    filename: str
    patterns: list[PatternFound]
    manipulation_score: int = Field(ge=0, le=100)
    verdict: str
    ethical_rating: Literal["Manipulative", "Questionable", "Mostly Clean", "Ethical"]
    timestamp: datetime | str

    screenshot: Optional[str] = None


class URLRequest(BaseModel):
    url: HttpUrl


class HealthResponse(BaseModel):
    status: str
    version: str


# --- Response hardening (single source of truth for API + extension + Gemini drift) ---

_VALID_SEVERITY = ("High", "Medium", "Low")
_VALID_ETHICAL = ("Manipulative", "Questionable", "Mostly Clean", "Ethical")


def _truncate(val: object, max_len: int, default: str = "") -> str:
    if val is None:
        return default
    s = str(val)
    if len(s) > max_len:
        return s[:max_len]
    return s


def _coerce_severity(val: object) -> str:
    s = str(val or "").strip().lower()
    if s in ("high", "h", "critical", "severe", "danger"):
        return "High"
    if s in ("low", "l", "minor", "info"):
        return "Low"
    if s in ("medium", "med", "m", "moderate", "mid", "moderate risk", ""):
        return "Medium"
    t = str(val or "").strip()
    if t in _VALID_SEVERITY:
        return t
    return "Medium"


def _coerce_confidence(val: object) -> float:
    try:
        c = float(val)
    except (TypeError, ValueError):
        return 0.7
    if math.isnan(c) or math.isinf(c):
        return 0.7
    if c > 1.0:
        c = c / 100.0 if c <= 100.0 else 1.0
    return max(0.0, min(1.0, c))


def _coerce_manipulation_score(val: object) -> int:
    try:
        v = int(round(float(val)))
    except (TypeError, ValueError):
        return 0
    return max(0, min(100, v))


def _coerce_ethical_rating(val: object) -> str:
    r = str(val or "").strip()
    if r in _VALID_ETHICAL:
        return r
    key = "".join(r.lower().split())
    aliases = {
        "manipulative": "Manipulative",
        "questionable": "Questionable",
        "mostlyclean": "Mostly Clean",
        "ethical": "Ethical",
    }
    return aliases.get(key, "Questionable")


def sanitize_scan_payload(data: dict) -> dict:
    """
    Coerce any analyzer / storage / LLM-shaped dict into a structure that satisfies ScanResult.
    Call this immediately before ScanResult.model_validate (or use parse_scan_result).
    """
    raw_patterns = data.get("patterns")
    if not isinstance(raw_patterns, list):
        raw_patterns = []

    patterns: list[dict] = []
    seq = 0
    for p in raw_patterns:
        if not isinstance(p, dict):
            continue
        seq += 1
        patterns.append(
            {
                "id": seq,
                "type": _truncate(p.get("type"), 500, "Unknown"),
                "severity": _coerce_severity(p.get("severity")),
                "location": _truncate(p.get("location"), 120, "center"),
                "evidence": _truncate(p.get("evidence", p.get("description")), 4000, "No evidence"),
                "user_impact": _truncate(p.get("user_impact"), 4000, "May affect user decisions"),
                "fix": _truncate(p.get("fix"), 4000, "Improve transparency"),
                "confidence": _coerce_confidence(p.get("confidence", 0.7)),
            }
        )

    ts = data.get("timestamp")
    if isinstance(ts, datetime):
        timestamp: datetime | str = ts.isoformat()
    elif ts is not None:
        timestamp = str(ts)
    else:
        timestamp = datetime.now().isoformat()

    screenshot = data.get("screenshot")
    if screenshot is None:
        shot: str | None = None
    elif isinstance(screenshot, (bytes, bytearray)):
        import base64

        shot = base64.b64encode(bytes(screenshot)).decode("ascii")
    else:
        shot = str(screenshot) if str(screenshot).strip() else None

    scan_id = _truncate(data.get("scan_id"), 80) or str(uuid4())
    filename = _truncate(data.get("filename"), 2000) or "upload"

    return {
        "scan_id": scan_id,
        "filename": filename,
        "patterns": patterns,
        "manipulation_score": _coerce_manipulation_score(data.get("manipulation_score", 0)),
        "verdict": _truncate(data.get("verdict"), 8000, "Analysis complete."),
        "ethical_rating": _coerce_ethical_rating(data.get("ethical_rating")),
        "timestamp": timestamp,
        "screenshot": shot,
    }


def parse_scan_result(data: dict) -> ScanResult:
    """
    Build a validated ScanResult. Sanitizes first; if validation still fails, returns a safe minimal result.
    """
    try:
        clean = sanitize_scan_payload(data)
        return ScanResult.model_validate(clean)
    except Exception:
        minimal = sanitize_scan_payload(
            {
                "scan_id": data.get("scan_id") or str(uuid4()),
                "filename": data.get("filename") or "upload",
                "patterns": [],
                "manipulation_score": 0,
                "verdict": "We could not serialize this scan result. Please try again.",
                "ethical_rating": "Questionable",
                "timestamp": datetime.now().isoformat(),
                "screenshot": data.get("screenshot"),
            }
        )
        return ScanResult.model_validate(minimal)
