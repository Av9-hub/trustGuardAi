from __future__ import annotations

from datetime import datetime
from typing import Literal
from typing import Optional
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
