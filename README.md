# TrustGuard AI Backend

Production-ready FastAPI backend for TrustGuard AI UI ethics audits.

## Project Structure

```text
trustguard-backend/
├── main.py
├── analyzer.py
├── screenshot.py
├── report.py
├── models.py
├── sample_data.py
├── .env
├── .gitignore
└── requirements.txt
```

## Setup

1. Create and activate a Python virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Install Playwright Chromium:
   - `playwright install chromium`
4. Add your Gemini key in `.env`:
   - `GEMINI_API_KEY=your_key_here`

## Run

- `uvicorn main:app --reload`

Server runs by default at `http://127.0.0.1:8000`.

## API Endpoints

### `POST /analyze`

Analyze an uploaded screenshot.

- Content type: `multipart/form-data`
- Field: `file`
- Validation:
  - Allowed types: JPEG, PNG, WEBP
  - Max size: 10MB
- Behavior:
  - Calls `analyzer.analyze_image()`
  - Creates unique `scan_id`
  - Stores result in in-memory `SCAN_STORE`
- Response: `ScanResult`

### `POST /analyze-url`

Analyze a live webpage by URL.

- Request JSON:
  ```json
  { "url": "https://example.com" }
  ```
- Validation: URL format via `HttpUrl`
- Behavior:
  - Calls `screenshot.capture_url(url)`
  - Calls `analyzer.analyze_image(screenshot_bytes)`
  - Creates unique `scan_id`
  - Stores result in `SCAN_STORE`
- Response: `ScanResult`

### `GET /report/{scan_id}`

Download generated PDF report for a stored scan.

- Looks up `SCAN_STORE[scan_id]`
- Calls `report.generate_pdf(scan_result)`
- Response:
  - `application/pdf`
  - `Content-Disposition: attachment; filename="trustguard-audit.pdf"`

### `GET /samples`

Returns pre-loaded static sample scan results from `sample_data.py`.

### `GET /health`

Returns service status:

```json
{ "status": "ok", "version": "1.0.0" }
```

## Notes

- The app loads environment variables from `.env` using `python-dotenv`.
- Gemini failures gracefully return a fallback result so demos do not crash.
# TrustGuard AI (FastAPI Backend)

TrustGuard AI is a backend service for UI dark-pattern audits. It supports image and URL scan flows, sample scan datasets, and branded PDF report generation.

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Install Playwright browser:
   - `playwright install chromium`
4. Set your Gemini API key in `.env`:
   - `GEMINI_API_KEY=your_real_key`

## Run

- `uvicorn main:app --reload`

Default app URL: `http://127.0.0.1:8000`

## API Endpoints

### `GET /`
Returns a simple status message.

### `GET /health`
Returns service health and version:
- `status`
- `version`

### `GET /samples`
Returns 5 pre-built realistic scan results:
1. Amazon Checkout
2. Booking.com
3. LinkedIn Premium
4. Generic Cookie Banner
5. Ethical Checkout (clean)

### `POST /scan/image`
Scans an uploaded image.

Request:
- `multipart/form-data`
- field name: `file`

Response:
- `scan_id`
- `filename`
- `patterns`
- `manipulation_score`
- `verdict`
- `ethical_rating`
- `timestamp`

### `POST /scan/url`
Captures a screenshot of a live URL and scans it.

Request JSON:
```json
{
  "url": "https://example.com"
}
```

Behavior:
- Validates URL format (`http`/`https`)
- Captures screenshot via Playwright Chromium (`1280x800`, `networkidle`, `15000ms`)

Errors:
- `400` invalid URL
- `504` page timeout

### `POST /report/pdf`
Generates branded PDF report bytes from a scan result payload.

Request JSON:
- a `scan_result`-style object (same structure as `/scan/image` response)

Response:
- Binary PDF (`application/pdf`)
- Attachment file name: `trustguard_report.pdf`

## Notes

- `fallback_result()` is used when model analysis is unavailable, so demos do not crash.
- Gemini integration can be added later without changing API response structure.
