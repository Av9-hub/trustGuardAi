from __future__ import annotations

from fastapi import HTTPException
from playwright.sync_api import sync_playwright
import asyncio


# ==============================
# SYNC PLAYWRIGHT (STABLE)
# ==============================
def _capture_sync(url: str) -> bytes:
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            context = browser.new_context(
                viewport={"width": 1280, "height": 800}
            )

            page = context.new_page()

            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(3000)

            screenshot = page.screenshot(
                            full_page=False,
                            type="jpeg",
                            quality=60
                        )

            browser.close()

            return screenshot

    except Exception as exc:
        print("🔥 PLAYWRIGHT ERROR:", exc)
        raise HTTPException(
            status_code=503,
            detail=f"URL capture failed: {exc}"
        )


# ==============================
# ASYNC WRAPPER (IMPORTANT)
# ==============================
async def capture_url(url: str) -> bytes:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _capture_sync, url)