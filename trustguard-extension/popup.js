const $ = (id) => document.getElementById(id);

const scanBtn = $("scanBtn");
const loadingState = $("loadingState");
const errorState = $("errorState");
const errorMsg = $("errorMsg");
const resultsSection = $("resultsSection");
const settingsToggle = $("settingsToggle");
const settingsPanel = $("settingsPanel");
const apiBaseInput = $("apiBaseInput");
const saveSettings = $("saveSettings");
const scoreValue = $("scoreValue");
const scoreBarFill = $("scoreBarFill");
const severityChips = $("severityChips");
const verdictText = $("verdictText");
const patternsList = $("patternsList");
const fullReportLink = $("fullReportLink");

function setView({ loading, error, results }) {
  loadingState.hidden = !loading;
  errorState.hidden = !error;
  resultsSection.hidden = !results;
  scanBtn.disabled = loading;
}

function friendlyError(message) {
  const m = String(message || "").toLowerCase();
  if (m.includes("failed to fetch") || m.includes("networkerror")) {
    return "We could not reach your TrustGuard server. Start the API (port 8000) or update the API URL in settings.";
  }
  if (m.includes("internal server error") || m.includes(" 500")) {
    return "The TrustGuard API returned an error. Confirm uvicorn is running, GEMINI_API_KEY is set if you use Gemini, and try again.";
  }
  if (m.includes("413") || m.includes("too large")) {
    return "This page is too large to capture. Try a shorter page or zoom out.";
  }
  return message || "Something unexpected happened. Try again in a moment.";
}

function severityClass(sev) {
  const s = String(sev || "").toLowerCase();
  if (s === "high") return "high";
  if (s === "low") return "low";
  return "medium";
}

function renderChips(patterns) {
  const counts = { High: 0, Medium: 0, Low: 0 };
  for (const p of patterns) {
    const k = p.severity;
    if (counts[k] !== undefined) counts[k] += 1;
  }
  severityChips.innerHTML = "";
  const order = [
    ["High", counts.High, "chip-high"],
    ["Medium", counts.Medium, "chip-medium"],
    ["Low", counts.Low, "chip-low"],
  ];
  for (const [label, n, cls] of order) {
    if (n === 0) continue;
    const el = document.createElement("span");
    el.className = `chip ${cls}`;
    el.textContent = `${label}: ${n}`;
    severityChips.appendChild(el);
  }
  if (!severityChips.children.length) {
    const el = document.createElement("span");
    el.className = "chip";
    el.textContent = "No patterns flagged";
    severityChips.appendChild(el);
  }
}

function renderPatterns(patterns) {
  patternsList.innerHTML = "";
  for (const p of patterns) {
    const sev = severityClass(p.severity);
    const card = document.createElement("article");
    card.className = "pattern-card";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "pattern-card-head";

    const titleEl = document.createElement("span");
    titleEl.className = "pattern-card-title";
    titleEl.textContent = p.type || "Pattern";

    const badge = document.createElement("span");
    badge.className = `badge badge-${sev}`;
    badge.textContent = p.severity || "—";

    const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chevron.setAttribute("class", "chevron");
    chevron.setAttribute("width", "16");
    chevron.setAttribute("height", "16");
    chevron.setAttribute("viewBox", "0 0 24 24");
    chevron.setAttribute("fill", "none");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M6 9l6 6 6-6");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    chevron.appendChild(path);

    head.appendChild(titleEl);
    head.appendChild(badge);
    head.appendChild(chevron);

    const desc = document.createElement("p");
    desc.className = "pattern-desc";
    desc.textContent = p.evidence || p.user_impact || "";

    const fixWrap = document.createElement("div");
    fixWrap.className = "pattern-fix";
    const fixInner = document.createElement("div");
    fixInner.className = "pattern-fix-inner";
    const fixLabel = document.createElement("strong");
    fixLabel.style.color = "#a5b4fc";
    fixLabel.textContent = "Suggested fix";
    fixInner.appendChild(fixLabel);
    fixInner.appendChild(document.createElement("br"));
    fixInner.appendChild(document.createTextNode(p.fix || "—"));
    fixWrap.appendChild(fixInner);

    head.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    card.appendChild(head);
    card.appendChild(desc);
    card.appendChild(fixWrap);
    patternsList.appendChild(card);
  }
}

function scoreColorClass(score) {
  if (score >= 66) return "score-high";
  if (score >= 33) return "score-mid";
  return "score-low";
}

function animateScore(target) {
  const duration = 900;
  const start = performance.now();
  const from = 0;
  const to = Math.max(0, Math.min(100, Number(target) || 0));

  scoreValue.classList.remove("score-low", "score-mid", "score-high");
  scoreValue.classList.add(scoreColorClass(to));

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    const val = Math.round(from + (to - from) * eased);
    scoreValue.textContent = String(val);
    scoreBarFill.style.width = `${val}%`;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderResult(result) {
  setView({ loading: false, error: false, results: true });
  verdictText.textContent = result.verdict || "";
  renderChips(result.patterns || []);
  renderPatterns(result.patterns || []);
  animateScore(result.manipulation_score ?? 0);
}

async function loadStoredUi() {
  const { apiBaseUrl, lastScanResult } = await chrome.storage.local.get(["apiBaseUrl", "lastScanResult"]);
  if (typeof apiBaseUrl === "string" && apiBaseUrl.trim()) {
    apiBaseInput.value = apiBaseUrl.trim();
  } else {
    apiBaseInput.value = "http://localhost:8000";
  }
  setView({ loading: false, error: false, results: false });
}

scanBtn.addEventListener("click", () => {
  setView({ loading: true, error: false, results: false });
  errorMsg.textContent = "";
  scoreValue.textContent = "0";
  scoreBarFill.style.width = "0%";
  chrome.runtime.sendMessage({ action: "performScan" }, () => {
    void chrome.runtime.lastError;
  });
});

settingsToggle.addEventListener("click", () => {
  settingsPanel.hidden = !settingsPanel.hidden;
});

saveSettings.addEventListener("click", async () => {
  const v = apiBaseInput.value.trim() || "http://localhost:8000";
  await chrome.storage.local.set({ apiBaseUrl: v });
  settingsPanel.hidden = true;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ANALYSIS_COMPLETE" && msg.result) {
    renderResult(msg.result);
    void chrome.storage.local.set({ lastScanResult: msg.result, lastScanAt: Date.now() });
  }
  if (msg.type === "ANALYSIS_ERROR") {
    setView({ loading: false, error: true, results: false });
    errorMsg.textContent = friendlyError(msg.message);
  }
});

void loadStoredUi();
