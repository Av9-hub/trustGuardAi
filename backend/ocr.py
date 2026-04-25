import sys

import cv2
import numpy as np
import pytesseract
from PIL import Image

# set path (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def _safe_log(message: str) -> None:
    try:
        print(message)
    except UnicodeEncodeError:
        try:
            enc = getattr(sys.stdout, "encoding", None) or "utf-8"
            print(message.encode(enc, errors="replace").decode(enc, errors="replace"))
        except Exception:
            print(repr(message)[:8000])


# ==============================
# IMAGE PREPROCESSING
# ==============================
def preprocess_image(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None or img.size == 0:
        raise ValueError("Could not decode image (invalid or empty image bytes).")

    # upscale (important for UI text)
    img = cv2.resize(img, None, fx=1.6, fy=1.6, interpolation=cv2.INTER_CUBIC)

    # convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # sharpen (important)
    kernel = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
    gray = cv2.filter2D(gray, -1, kernel)

    # denoise
    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    # adaptive threshold (better than simple threshold)
    thresh = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11, 2
    )

    return thresh


# ==============================
# OCR EXTRACTION
# ==============================
def extract_text(image_bytes: bytes) -> str:
    try:
        processed = preprocess_image(image_bytes)

        # better config for UI
        config = "--oem 3 --psm 11"

        text = pytesseract.image_to_string(processed, config=config)

        # _safe_log("\n[ocr] OCR text:\n" + text)

        return text.lower()

    except Exception as e:
        print("OCR ERROR:", e)
        return ""


# ==============================
# SMART DETECTION (IMPROVED)
# ==============================
def detect_patterns(text: str):
    patterns = []

    def add(type_, severity, evidence, impact, fix, confidence=0.7):
        patterns.append({
            "id": len(patterns) + 1,
            "type": type_,
            "severity": severity,
            "location": "center",
            "evidence": evidence,
            "user_impact": impact,
            "fix": fix,
            "confidence": confidence
        })

    # 🚨 urgency
    if any(w in text for w in ["limited", "only left", "ends soon", "hurry"]):
        add("Urgency", "High", "Urgency language detected",
            "Forces quick decisions", "Remove urgency pressure")

    # 🚨 pricing / anchoring
    if any(w in text for w in ["save", "discount", "% off", "deal"]):
        add("Price Anchoring", "Medium", "Discount shown",
            "Influences perceived value", "Show transparent pricing")

    # 🚨 social proof
    if any(w in text for w in ["bought", "people", "trending", "best seller", "choice"]):
        add("Social Pressure", "Medium", "Popularity indicators",
            "Creates herd behavior", "Show neutral metrics")

    # 🚨 forced login
    if any(w in text for w in ["login", "sign in", "otp", "create account"]):
        add("Forced Action", "Low", "Login required",
            "Restricts user freedom", "Allow guest access")

    # 🚨 subscription trap
    if any(w in text for w in ["free trial", "auto renew"]):
        add("Subscription Trap", "High", "Subscription terms detected",
            "May lead to hidden charges", "Show clear opt-out")

    return patterns

def is_suspicious(text: str) -> bool:
    return len(detect_patterns(text)) > 0

# ==============================
# FINAL DECISION ENGINE
# ==============================
def ocr_analyze(image_bytes: bytes, filename: str):
    text = extract_text(image_bytes)
    text_len = len(text.strip())

    # ❌ no text
    if text_len == 0:
        return {
            "patterns": [],
            "manipulation_score": 0,
            "verdict": "No readable content detected",
            "ethical_rating": "Questionable"
        }

    # 🔍 detect patterns
    patterns = detect_patterns(text)

    # ✅ clean UI
    if text_len > 40 and len(patterns) == 0:
        return {
            "patterns": [],
            "manipulation_score": 0,
            "verdict": "No dark patterns detected",
            "ethical_rating": "Ethical"
        }

    # ⚠️ suspicious
    return {
        "patterns": patterns,
        "manipulation_score": min(len(patterns) * 25, 100),
        "verdict": "Potential dark patterns detected",
        "ethical_rating": (
            "Mostly Clean" if len(patterns) == 1 else
            "Questionable" if len(patterns) <= 3 else
            "Manipulative"
        )
    }