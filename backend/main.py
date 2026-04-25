from __future__ import annotations

from uuid import uuid4
import base64
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from analyzer import analyze_image, fallback_result
from models import HealthResponse, ScanResult, URLRequest, parse_scan_result
from report import generate_pdf
from sample_data import SAMPLE_SCANS
from screenshot import capture_url

load_dotenv()

app = FastAPI(title="TrustGuard AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
SCAN_STORE: dict[str, dict] = {}


def _detect_image_mime(image_bytes: bytes) -> str | None:
    """Sniff image type from magic bytes (covers extension uploads with generic MIME)."""
    if len(image_bytes) >= 3 and image_bytes[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if len(image_bytes) >= 8 and image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if len(image_bytes) >= 12 and image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
        return "image/webp"
    return None


def _effective_upload_mime(declared: str | None, image_bytes: bytes) -> str | None:
    header = (declared or "").split(";")[0].strip().lower()
    if header in ALLOWED_CONTENT_TYPES:
        return header
    return _detect_image_mime(image_bytes)


# ==============================
# IMAGE ANALYSIS
# ==============================
@app.post("/analyze", response_model=ScanResult)
async def analyze_upload(file: UploadFile = File(...)) -> ScanResult:
    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10MB.")

    effective = _effective_upload_mime(file.content_type, image_bytes)
    if effective not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Allowed: jpg, png, webp.",
        )

    result = analyze_image(image_bytes=image_bytes, filename=file.filename or "upload")

    scan_id = str(uuid4())
    result["scan_id"] = scan_id
    validated = parse_scan_result(result)
    SCAN_STORE[scan_id] = validated.model_dump(mode="json")
    return validated


# ==============================
# URL ANALYSIS (PLAYWRIGHT WORKING)
# ==============================
@app.post("/analyze-url", response_model=ScanResult)
async def analyze_from_url(payload: URLRequest) -> ScanResult:
    try:
        screenshot_bytes = await capture_url(str(payload.url))

        if not screenshot_bytes:
            raise HTTPException(status_code=500, detail="Failed to capture screenshot")

        result = analyze_image(
            image_bytes=screenshot_bytes,
            filename=str(payload.url)
        )

        # ✅ FIXED: correct indentation
        result["screenshot"] = base64.b64encode(screenshot_bytes).decode("utf-8")

    except Exception as exc:
        print("[analyze-url] Error:", exc)

        result = fallback_result(
            str(payload.url),
            verdict=f"URL scan failed: {str(exc)}"
        )

    scan_id = str(uuid4())
    result["scan_id"] = scan_id
    validated = parse_scan_result(result)
    SCAN_STORE[scan_id] = validated.model_dump(mode="json")
    return validated

# ==============================
# PDF REPORT
# ==============================
@app.get("/report/{scan_id}")
def download_report(scan_id: str) -> Response:
    scan_result = SCAN_STORE.get(scan_id)

    if not scan_result:
        raise HTTPException(status_code=404, detail="Scan not found.")

    pdf_bytes = generate_pdf(scan_result)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="trustguard-audit.pdf"'
        },
    )


# ==============================
# SAMPLE DATA
# ==============================
@app.get("/samples")
def list_samples() -> list[dict]:
    for sample in SAMPLE_SCANS:
        if sample.get("scan_id"):
            SCAN_STORE[sample["scan_id"]] = sample

    return SAMPLE_SCANS


# ==============================
# HEALTH CHECK
# ==============================
@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", version="1.0.0")