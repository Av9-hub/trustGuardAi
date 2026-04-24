from __future__ import annotations
from dotenv import load_dotenv
load_dotenv()

import json
import os
import re
import time
from datetime import datetime
from uuid import uuid4

from google import genai


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
      "type": "string",
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
            print("❌ NO GEMINI API KEY")
            return fallback_result(filename)

        client = genai.Client(api_key=api_key)

        print("🚀 CALLING GEMINI...")

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
                                        "mime_type": "image/png",
                                        "data": image_bytes
                                    }
                                }
                            ]
                        }
                    ]
                )

                raw = (response.text or "").strip()

                print("📥 RAW RESPONSE:\n", raw)

                # clean markdown
                raw = raw.replace("```json", "").replace("```", "").strip()

                match = re.search(r"\{.*\}", raw, re.DOTALL)

                if not match:
                    raise ValueError("Invalid JSON")

                parsed = json.loads(match.group())

                return normalize_result(parsed, filename)

            except Exception as e:
                print(f"⚠️ Retry {attempt+1} failed:", e)
                time.sleep(2)

        print("❌ ALL RETRIES FAILED")
        return fallback_result(filename)

    except Exception as exc:
        print("🔥 FINAL ERROR:", exc)
        return fallback_result(filename, verdict=str(exc))