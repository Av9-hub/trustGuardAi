from __future__ import annotations

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def _score_color(score: int):
    if score > 60:
        return colors.HexColor("#EF4444")
    if score >= 30:
        return colors.HexColor("#F59E0B")
    return colors.HexColor("#22C55E")


def _severity_color(severity: str):
    value = severity.lower()
    if value == "high":
        return colors.HexColor("#EF4444")
    if value == "medium":
        return colors.HexColor("#F59E0B")
    return colors.HexColor("#22D3EE")


def _wrap(pdf: canvas.Canvas, text: str, x: float, y: float, max_width: float, line_h: float) -> float:
    words = (text or "").split()
    line = ""
    for word in words:
        candidate = (line + " " + word).strip()
        if pdf.stringWidth(candidate, pdf._fontname, pdf._fontsize) <= max_width:
            line = candidate
        else:
            pdf.drawString(x, y, line)
            y -= line_h
            line = word
    if line:
        pdf.drawString(x, y, line)
        y -= line_h
    return y


def generate_pdf(scan_result: dict) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setFillColor(colors.HexColor("#04070F"))
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 36)
    pdf.drawString(24 * mm, height - 42 * mm, "TRUSTGUARD AI")
    pdf.setFillColor(colors.HexColor("#9CA3AF"))
    pdf.setFont("Helvetica", 14)
    pdf.drawString(24 * mm, height - 52 * mm, "UI Ethics Audit Report")
    pdf.setStrokeColor(colors.HexColor("#22D3EE"))
    pdf.line(24 * mm, height - 58 * mm, width - 24 * mm, height - 58 * mm)

    pdf.setFillColor(colors.HexColor("#9CA3AF"))
    pdf.setFont("Courier", 10)
    pdf.drawString(24 * mm, height - 72 * mm, f"Scan target: {scan_result.get('filename', 'N/A')}")
    pdf.drawString(24 * mm, height - 78 * mm, f"Date: {scan_result.get('timestamp', 'N/A')}")
    pdf.drawString(24 * mm, height - 84 * mm, f"Scan ID: {scan_result.get('scan_id', 'N/A')}")

    score = int(scan_result.get("manipulation_score", 0))
    pdf.setFillColor(_score_color(score))
    pdf.circle(36 * mm, height - 113 * mm, 10 * mm, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 26)
    pdf.drawString(54 * mm, height - 116 * mm, str(score))
    pdf.setFont("Helvetica", 12)
    pdf.drawString(54 * mm, height - 124 * mm, "Manipulation score")
    pdf.setFillColor(colors.HexColor("#D1D5DB"))
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(24 * mm, height - 140 * mm, f"Ethical rating: {scan_result.get('ethical_rating', 'N/A')}")

    patterns = scan_result.get("patterns", [])
    for pattern in patterns:
        pdf.showPage()
        sev = str(pattern.get("severity", "Low"))
        sev_color = _severity_color(sev)

        pdf.setFillColor(sev_color)
        pdf.rect(12 * mm, 18 * mm, 3 * mm, height - 36 * mm, fill=1, stroke=0)
        pdf.setFillColor(colors.HexColor("#111827"))
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(20 * mm, height - 24 * mm, str(pattern.get("type", "Unknown")))

        pdf.setFillColor(sev_color)
        pdf.roundRect(width - 46 * mm, height - 28 * mm, 28 * mm, 9 * mm, 2 * mm, fill=1, stroke=0)
        pdf.setFillColor(colors.white)
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(width - 40 * mm, height - 23.5 * mm, sev.upper())

        y = height - 38 * mm
        pdf.setFillColor(colors.HexColor("#F3F4F6"))
        pdf.roundRect(20 * mm, y - 24 * mm, width - 40 * mm, 24 * mm, 2 * mm, fill=1, stroke=0)
        pdf.setFillColor(colors.HexColor("#374151"))
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(24 * mm, y - 8 * mm, "Evidence")
        pdf.setFont("Helvetica", 10)
        _wrap(pdf, str(pattern.get("evidence", "N/A")), 24 * mm, y - 14 * mm, width - 52 * mm, 4.5 * mm)

        y = height - 74 * mm
        pdf.setFillColor(colors.HexColor("#111827"))
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(20 * mm, y, "User Impact")
        pdf.setFont("Helvetica", 10)
        y = _wrap(pdf, str(pattern.get("user_impact", "N/A")), 20 * mm, y - 6 * mm, width - 40 * mm, 5 * mm)

        y -= 3 * mm
        pdf.setFillColor(colors.HexColor("#ECFDF5"))
        pdf.roundRect(20 * mm, y - 24 * mm, width - 40 * mm, 24 * mm, 2 * mm, fill=1, stroke=0)
        pdf.setFillColor(colors.HexColor("#065F46"))
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(24 * mm, y - 8 * mm, "Fix")
        pdf.setFont("Helvetica", 10)
        _wrap(pdf, str(pattern.get("fix", "N/A")), 24 * mm, y - 14 * mm, width - 52 * mm, 4.5 * mm)

        pdf.setFillColor(colors.HexColor("#374151"))
        pdf.setFont("Helvetica", 10)
        pdf.drawString(20 * mm, 24 * mm, f"Confidence: {float(pattern.get('confidence', 0.0)) * 100:.0f}%")
        pdf.setStrokeColor(colors.HexColor("#D1D5DB"))
        pdf.line(20 * mm, 20 * mm, width - 20 * mm, 20 * mm)

    pdf.showPage()
    pdf.setFillColor(colors.HexColor("#111827"))
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(20 * mm, height - 24 * mm, "Summary")

    high = sum(1 for p in patterns if str(p.get("severity", "")).lower() == "high")
    medium = sum(1 for p in patterns if str(p.get("severity", "")).lower() == "medium")
    low = sum(1 for p in patterns if str(p.get("severity", "")).lower() == "low")

    pdf.setFillColor(colors.HexColor("#374151"))
    pdf.setFont("Helvetica", 12)
    pdf.drawString(20 * mm, height - 38 * mm, f"Total patterns: {len(patterns)}")
    pdf.drawString(20 * mm, height - 46 * mm, f"High severity: {high}")
    pdf.drawString(20 * mm, height - 54 * mm, f"Medium severity: {medium}")
    pdf.drawString(20 * mm, height - 62 * mm, f"Low severity: {low}")

    pdf.setFillColor(colors.HexColor("#F9FAFB"))
    pdf.roundRect(20 * mm, height - 100 * mm, width - 40 * mm, 30 * mm, 2 * mm, fill=1, stroke=0)
    pdf.setFillColor(colors.HexColor("#1F2937"))
    pdf.setFont("Helvetica-Oblique", 12)
    _wrap(pdf, f"\"{scan_result.get('verdict', 'No verdict available.')}\"", 24 * mm, height - 84 * mm, width - 48 * mm, 6 * mm)

    pdf.setFillColor(colors.HexColor("#6B7280"))
    pdf.setFont("Helvetica", 10)
    pdf.drawString(20 * mm, 12 * mm, "Powered by TrustGuard AI")

    pdf.save()
    buffer.seek(0)
    return buffer.read()
