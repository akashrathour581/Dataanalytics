# Verification report — 2026-09-18

Story: a visitor discovers a free tool, uploads data, reviews deterministic analysis, previews and applies cleaning, downloads a result and deletes the dataset without creating an account.

## Completed checks

| Boundary | Result | Evidence |
|---|---|---|
| Backend/engine/API | Pass | 27 unittest cases |
| Local calculations/validators | Pass | 6 Node test cases |
| Frontend build | Pass | Vite production build and 24 prerendered pages |
| Lint | Pass | oxlint, no warnings |
| Python syntax | Pass | compileall for server, launcher and offline scripts |
| UI → API → cleaned data → download | Pass | Playwright CSV upload, before/after preview, apply, undo, export, search and deletion |
| Charts | Pass | Chart builder and automatic charts render, including narrow screens |
| Local JSON/statistics | Pass | Browser input → computed result |
| Responsive layout | Pass | 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 px; no document overflow |
| Populated narrow layouts | Pass | Tables/charts at 320, 390 and 768 px |
| Route coverage | Pass | All 24 sitemap routes return 200 and render one H1 |
| Dataset reuse | Pass | Upload on analyzer, navigate to viewer, reopen retained data, delete |
| Ads enabled | Pass | Slots rendered below workspace, 250 px at mobile/tablet and 280 px desktop; no slots inside tool forms/workspaces |
| Ads disabled | Pass | Final build: no ad slots on all 19 tool pages; routes and dataset reuse remain functional |
| External data transfers | Pass in tested flows | No third-party browser requests |
| Browser errors | Pass | No uncaught page errors in tested flows |

Screenshots and an exported test CSV are in `outputs/verification`. Browser scripts: `tests/browser_smoke.py` and `tests/browser_routes.py`. The preferred agent-browser CLI was unavailable, so the installed Playwright Chromium was used. The first route/ad check attempt was blocked by an automatic-approval usage limit; it completed successfully after the user requested continuation.

## Fixes found during verification

- Boolean columns incorrectly entered numeric range calculations.
- Malformed XLSX content returned HTTP 500 instead of a useful input error.
- Undefined correlations rendered as zero.
- Cleaning selects needed explicit accessible names.
- A legacy-route redirect accidentally matched the homepage; regression assertion added.
- Refresh/navigation needed a way to reopen or delete retained datasets.

## Limits of this verification

This is local verification, not a penetration test, load test, public deployment, search indexing guarantee, ad-provider approval or revenue validation. Multiple workers are not supported by the in-memory store. Actual ad delivery, first-party analytics collection, production domain/contact details, HTTPS and host resource controls need operator configuration. No external AI or payment integration is present.

The test environment uses a locally available httpx installation. Starlette emits a deprecation warning for its httpx-based TestClient; the tests pass. The declared development requirements include httpx. Browser test tooling is optional and separate from application dependencies.

Final build uses `ADS_ENABLED=false`. Initial JavaScript is approximately 75.4 KB gzip and CSS 3.75 KB gzip; chart libraries load on demand. The local review server is served from the production build at port 8000.
