const DEFAULT_API_BASE = "http://localhost:8000";

async function getApiBase() {
  const { apiBaseUrl } = await chrome.storage.local.get(["apiBaseUrl"]);
  const raw = typeof apiBaseUrl === "string" && apiBaseUrl.trim() ? apiBaseUrl.trim() : DEFAULT_API_BASE;
  return raw.replace(/\/$/, "");
}

async function injectAndCapture(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["lib/html2canvas.min.js"],
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"],
  });
  await chrome.tabs.sendMessage(tabId, { action: "CAPTURE" });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "performScan") {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
          chrome.runtime.sendMessage({
            type: "ANALYSIS_ERROR",
            message: "No active tab found. Open a web page and try again.",
          });
          sendResponse({ ok: false });
          return;
        }

        const url = tab.url || "";
        if (!/^https?:\/\//i.test(url) || url.startsWith("chrome://") || url.startsWith("edge://") || url.startsWith("about:")) {
          chrome.runtime.sendMessage({
            type: "ANALYSIS_ERROR",
            message: "TrustGuard needs a normal http(s) page. It cannot run on browser system pages.",
          });
          sendResponse({ ok: false });
          return;
        }

        await injectAndCapture(tab.id);
        sendResponse({ ok: true });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Could not access this tab. Try reloading the page, then scan again.";
        chrome.runtime.sendMessage({
          type: "ANALYSIS_ERROR",
          message: msg,
        });
        sendResponse({ ok: false, error: msg });
      }
    })();
    return true;
  }

  if (message.type === "SCREENSHOT_CAPTURED" && message.base64) {
    (async () => {
      try {
        const base = await getApiBase();
        const analyzeUrl = `${base}/analyze`;

        const byteChars = atob(message.base64);
        const bytes = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i += 1) {
          bytes[i] = byteChars.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "image/png" });
        const form = new FormData();
        form.append("file", blob, "trustguard-capture.png");

        const res = await fetch(analyzeUrl, {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          let detail = res.statusText;
          try {
            const j = await res.json();
            if (j?.detail) detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
          } catch {
            try {
              detail = await res.text();
            } catch {
              /* ignore */
            }
          }
          throw new Error(detail || `Server responded with ${res.status}`);
        }

        const result = await res.json();
        await chrome.storage.local.set({
          lastScanResult: result,
          lastScanAt: Date.now(),
        });

        chrome.runtime.sendMessage({
          type: "ANALYSIS_COMPLETE",
          result,
        });
        sendResponse({ ok: true });
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not reach the analysis server. Is FastAPI running on port 8000?";
        chrome.runtime.sendMessage({
          type: "ANALYSIS_ERROR",
          message: msg,
        });
        sendResponse({ ok: false });
      }
    })();
    return true;
  }

  return false;
});
