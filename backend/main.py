from __future__ import annotations

from uuid import uuid4
import base64
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from analyzer import analyze_image, fallback_result
from models import HealthResponse, ScanResult, URLRequest
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


# ==============================
# IMAGE ANALYSIS
# ==============================
@app.post("/analyze", response_model=ScanResult)
async def analyze_upload(file: UploadFile = File(...)) -> ScanResult:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: jpg, png, webp.")

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10MB.")

    result = analyze_image(image_bytes=image_bytes, filename=file.filename or "upload")

    scan_id = str(uuid4())
    result["scan_id"] = scan_id
    SCAN_STORE[scan_id] = result

    return ScanResult.model_validate(result)


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
        print("🔥 URL ANALYSIS ERROR:", exc)

        result = fallback_result(
            str(payload.url),
            verdict=f"URL scan failed: {str(exc)}"
        )

    scan_id = str(uuid4())
    result["scan_id"] = scan_id
    SCAN_STORE[scan_id] = result

    return ScanResult.model_validate(result)

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