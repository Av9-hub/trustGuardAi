/**
 * Injected into the active tab. Captures the page with html2canvas and
 * sends a PNG (base64) to the background service worker.
 */
(function () {
  if (window.__trustGuardCaptureLoaded) {
    return;
  }
  window.__trustGuardCaptureLoaded = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action !== "CAPTURE" && message.type !== "CAPTURE") {
      return;
    }

    (async () => {
      try {
        if (typeof html2canvas !== "function") {
          throw new Error("Capture library not available on this page.");
        }

        const root = document.documentElement;
        const w = Math.min(root.scrollWidth, 4096);
        const h = Math.min(root.scrollHeight, 12000);
        const scale = Math.min(1, 1400 / w);

        const canvas = await html2canvas(root, {
          useCORS: true,
          allowTaint: false,
          logging: false,
          scale,
          width: w,
          height: h,
          windowWidth: w,
          windowHeight: h,
        });

        const dataUrl = canvas.toDataURL("image/png", 0.92);
        const base64 = dataUrl.split(",")[1] || "";

        if (!base64) {
          throw new Error("Could not encode screenshot.");
        }

        chrome.runtime.sendMessage({
          type: "SCREENSHOT_CAPTURED",
          base64,
          width: canvas.width,
          height: canvas.height,
        });

        sendResponse({ ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Capture failed.";
        chrome.runtime.sendMessage({
          type: "ANALYSIS_ERROR",
          message: msg,
        });
        sendResponse({ ok: false, error: msg });
      }
    })();

    return true;
  });
})();
