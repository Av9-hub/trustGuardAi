
from __future__ import annotations
import base64
import sys

def encode_screenshot(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode()


def _safe_log(message: str) -> None:
    """Avoid crashing the request on Windows (cp1252) when logs contain non-ASCII (e.g. Gemini output)."""
    try:
        print(message)
    except UnicodeEncodeError:
        try:
            enc = getattr(sys.stdout, "encoding", None) or "utf-8"
            print(message.encode(enc, errors="replace").decode(enc, errors="replace"))
        except Exception:
            print(repr(message)[:8000])


from dotenv import load_dotenv
load_dotenv()
# analyzer.py
from ocr import extract_text, is_suspicious
import json
import os
import re
import time
from datetime import datetime
from uuid import uuid4

from google import genai


def _mime_for_image_bytes(blob: bytes) -> str:
    """Match Gemini inline_data mime_type to actual image bytes (PNG uploads, JPEG screenshots, etc.)."""
    if len(blob) >= 3 and blob[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if len(blob) >= 8 and blob[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if len(blob) >= 12 and blob[:4] == b"RIFF" and blob[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


SYSTEM_PROMPT = """
You are TrustGuard AI — expert UI ethics auditor.

STRICT RULES:
- Return ONLY valid JSON
- Follow schema EXACTLY
- No missing fields
- No extra text

{
  "patterns": [
    {
      "id": 1,
      "type": "Pricing Manipulation | Hidden Cost | Forced Action | Urgency | Social Proof",
      "severity": "High | Medium | Low",
      "location": "top-left | center | bottom-right",
      "evidence": "exact UI text",
      "user_impact": "one sentence",
      "fix": "ethical alternative",
      "confidence": 0.0
    }
  ],
  "manipulation_score": 0,
  "verdict": "string",
  "ethical_rating": "Manipulative | Questionable | Mostly Clean | Ethical"
}
"""


def fallback_result(filename: str, verdict: str = "Temporary analysis issue.") -> dict:
    return {
        "scan_id": str(uuid4()),
        "filename": filename,
        "patterns": [],
        "manipulation_score": 0,
        "verdict": verdict,
        "ethical_rating": "Questionable",
        "timestamp": datetime.now().isoformat(),
    }

# ==============================
# NORMALIZER (CRITICAL)
# ==============================
def normalize_result(parsed: dict, filename: str):
    patterns = parsed.get("patterns", [])

    fixed_patterns = []
    for i, p in enumerate(patterns):
        fixed_patterns.append({
            "id": i + 1,
            "type": p.get("type", "Unknown"),
            "severity": p.get("severity", "Medium"),
            "location": p.get("location", "center"),
            "evidence": p.get("evidence", p.get("description", "No evidence")),
            "user_impact": p.get("user_impact", "May affect user decisions"),
            "fix": p.get("fix", "Improve transparency"),
            "confidence": float(p.get("confidence", 0.7))
        })

    parsed["patterns"] = fixed_patterns

    valid_ratings = ["Manipulative", "Questionable", "Mostly Clean", "Ethical"]
    if parsed.get("ethical_rating") not in valid_ratings:
        parsed["ethical_rating"] = "Questionable"

    parsed["scan_id"] = str(uuid4())
    parsed["filename"] = filename
    parsed["timestamp"] = datetime.now().isoformat()

    return parsed

# ==============================
# MAIN FUNCTION (GEMINI)
# ==============================
def analyze_image(image_bytes: bytes, filename: str = "upload") -> dict:
    try:
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            print("[analyzer] No GEMINI_API_KEY set; using fallback result.")
            return fallback_result(filename)

        client = genai.Client(api_key=api_key)

        
        # ==============================
        # OCR PRE-CHECK (ADDED)
        # ==============================
        text = extract_text(image_bytes)
        # print("OCR TEXT:", text)
        text_len = len(text.strip())
        # keep your logic SAME, just gate Gemini call
        if text_len == 0:
            print("[analyzer] No readable text from OCR; skipping Gemini.")

            result = fallback_result(filename, "No readable content")
            result["screenshot"] = encode_screenshot(image_bytes)  # ✅ ADD THIS

            return result

        # ✅ Strong clean case → skip Gemini
        # if text_len > 60 and not is_suspicious(text):
        #     print("⏭️ Skipping Gemini (strong clean UI via OCR)")

        #     return {
        #         "scan_id": str(uuid4()),
        #         "filename": filename,
        #         "patterns": [],
        #         "manipulation_score": 0,
        #         "verdict": "CLEAN (OCR)",
        #         "ethical_rating": "Mostly Clean",
        #         "timestamp": datetime.now().isoformat(),
        #         "screenshot": encode_screenshot(image_bytes)
        #     }
        print("[analyzer] Calling Gemini...")
        # 🔁 retry logic for 503
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[
                        {
                            "role": "user",
                            "parts": [
                                {"text": SYSTEM_PROMPT},
                                {
                                    "inline_data": {
                                        "mime_type": _mime_for_image_bytes(image_bytes),
                                        "data": image_bytes,
                                    }
                                }
                            ]
                        }
                    ]
                )

                raw = (response.text or "").strip()

                _safe_log(f"[analyzer] Raw Gemini response:\n{raw}")

                # clean markdown
                raw = raw.replace("```json", "").replace("```", "").strip()

                match = re.search(r"\{.*\}", raw, re.DOTALL)

                if not match:
                    raise ValueError("Invalid JSON")

                parsed = json.loads(match.group())

                result = normalize_result(parsed, filename)
                result["screenshot"] = encode_screenshot(image_bytes)
                return result

            except Exception as e:
                _safe_log(f"[analyzer] Retry {attempt + 1} failed: {e!r}")
                time.sleep(2)

        print("[analyzer] All Gemini retries failed.")
        result = fallback_result(filename)
        result["screenshot"] = encode_screenshot(image_bytes)
        return result

    except Exception as exc:
        _safe_log(f"[analyzer] Final error: {exc!r}")
        result = fallback_result(filename, verdict=str(exc))
        result["screenshot"] = encode_screenshot(image_bytes)
        return result