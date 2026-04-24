import pytesseract
from PIL import Image
import io

# set path (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.lower()
    except Exception as e:
        print("OCR ERROR:", e)
        return ""


def is_suspicious(text: str) -> bool:
    text = text.lower()

    # 🚨 urgency
    urgency = ["limited time", "only today", "hurry", "last chance", "only left"]

    # 🚨 pricing tricks
    pricing = ["hidden fee", "extra charges", "processing fee"]

    # 🚨 subscription traps
    subscription = ["auto renew", "free trial", "cancel anytime"]

    # 🚨 forced actions (VERY IMPORTANT)
    forced = ["login", "sign in", "create account", "enter mobile", "otp"]

    # 🚨 social pressure
    social = ["people are viewing", "selling fast", "in demand"]

    if any(w in text for w in urgency + pricing + subscription + forced + social):
        return True

    return False