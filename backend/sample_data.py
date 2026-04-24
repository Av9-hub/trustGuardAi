from __future__ import annotations

from datetime import datetime
from uuid import uuid4


def _sample(filename: str, score: int, verdict: str, rating: str, patterns: list[dict]) -> dict:
    return {
        "scan_id": str(uuid4()),
        "filename": filename,
        "patterns": patterns,
        "manipulation_score": score,
        "verdict": verdict,
        "ethical_rating": rating,
        "timestamp": datetime.utcnow().isoformat(),
    }


SAMPLE_SCANS = [
    _sample("Amazon Checkout", 81, "Multiple dark patterns create a high-risk manipulative checkout flow.", "Manipulative", [
        {"id": 1, "type": "Fake Urgency", "severity": "High", "location": "top-right", "evidence": "Timer says 'Order in 03:12' and resets on refresh.", "user_impact": "Pressures users into rushed decisions.", "fix": "Use only real, non-resetting shipping deadlines.", "confidence": 0.93},
        {"id": 2, "type": "Hidden Costs", "severity": "High", "location": "bottom-center", "evidence": "Mandatory handling fee appears only at final payment.", "user_impact": "Creates price shock after sunk effort.", "fix": "Show all mandatory charges from cart stage.", "confidence": 0.90},
        {"id": 3, "type": "Misdirection", "severity": "Medium", "location": "center", "evidence": "Add-on protection button is highlighted; skip option is muted.", "user_impact": "Increases accidental add-on purchases.", "fix": "Make accept and decline options equally prominent.", "confidence": 0.87},
        {"id": 4, "type": "Confirmshaming", "severity": "Medium", "location": "middle-left", "evidence": "Decline text says 'No thanks, I prefer to risk it'.", "user_impact": "Uses guilt language to manipulate choice.", "fix": "Use neutral decline copy like 'No thanks'.", "confidence": 0.84},
        {"id": 5, "type": "Roach Motel", "severity": "High", "location": "bottom-right", "evidence": "Subscription cancellation requires support chat after multiple pages.", "user_impact": "Makes opting out significantly harder than opting in.", "fix": "Add one-step self-serve cancellation in account settings.", "confidence": 0.91},
    ]),
    _sample("Booking.com", 76, "Urgency and late disclosures bias user booking behavior.", "Manipulative", [
        {"id": 1, "type": "Fake Urgency", "severity": "High", "location": "top-center", "evidence": "Persistent warning: 'Only 1 room left' across many properties.", "user_impact": "Creates artificial scarcity pressure.", "fix": "Show scarcity only when tied to verified inventory data.", "confidence": 0.89},
        {"id": 2, "type": "Hidden Costs", "severity": "High", "location": "bottom-center", "evidence": "Taxes and fees appear only at final payment summary.", "user_impact": "Anchors users to incomplete prices.", "fix": "Display full payable total upfront.", "confidence": 0.91},
        {"id": 3, "type": "Misdirection", "severity": "Medium", "location": "middle-right", "evidence": "Non-refundable option is highlighted as 'Recommended'.", "user_impact": "Nudges users toward less flexible choices.", "fix": "Present refundable and non-refundable options neutrally.", "confidence": 0.83},
        {"id": 4, "type": "Trick Questions", "severity": "Medium", "location": "bottom-left", "evidence": "Checkbox reads 'Uncheck if you do not want offers'.", "user_impact": "Confusing wording leads to accidental consent.", "fix": "Use direct opt-in language and default unchecked.", "confidence": 0.82},
    ]),
    _sample("LinkedIn Premium", 68, "Subscription flow includes friction and continuity concerns.", "Questionable", [
        {"id": 1, "type": "Roach Motel", "severity": "High", "location": "middle-right", "evidence": "Cancel option is hidden across nested billing menus.", "user_impact": "Users struggle to cancel paid service.", "fix": "Expose cancellation directly in subscription card.", "confidence": 0.88},
        {"id": 2, "type": "Forced Continuity", "severity": "High", "location": "center", "evidence": "Auto-renew disclosure is small and low-contrast under trial CTA.", "user_impact": "Increases risk of unexpected renewal charges.", "fix": "Require explicit confirmation before paid conversion.", "confidence": 0.90},
        {"id": 3, "type": "Confirmshaming", "severity": "Medium", "location": "bottom-center", "evidence": "Decline text says 'No, I don't want career growth'.", "user_impact": "Emotionally pressures users to accept offer.", "fix": "Use neutral decline language.", "confidence": 0.81},
    ]),
    _sample("Generic Cookie Banner", 72, "Consent UI is skewed toward maximum data collection.", "Manipulative", [
        {"id": 1, "type": "Privacy Zuckering", "severity": "High", "location": "bottom-center", "evidence": "Large 'Accept all' button; reject buried behind secondary link.", "user_impact": "Users may share more data than intended.", "fix": "Place Accept, Reject, and Customize at equal prominence.", "confidence": 0.94},
        {"id": 2, "type": "Trick Questions", "severity": "Medium", "location": "middle-left", "evidence": "Toggle label uses double negative wording.", "user_impact": "Users may misunderstand actual consent state.", "fix": "Rewrite controls in plain affirmative language.", "confidence": 0.80},
        {"id": 3, "type": "Misdirection", "severity": "Medium", "location": "middle-right", "evidence": "Reject option is low contrast while accept is bright primary.", "user_impact": "Visual hierarchy nudges toward acceptance.", "fix": "Match contrast, size, and weight across choices.", "confidence": 0.86},
        {"id": 4, "type": "Disguised Ads", "severity": "Low", "location": "top-left", "evidence": "Sponsored partner block is styled like preference controls.", "user_impact": "Users can mistake ads for settings.", "fix": "Clearly label sponsored content and separate visually.", "confidence": 0.74},
    ]),
    _sample("Ethical Checkout (Basecamp style)", 8, "Flow is transparent and user-respecting with no significant dark patterns.", "Ethical", []),
]
