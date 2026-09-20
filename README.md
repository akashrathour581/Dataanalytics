# DataSphere AI — Free Online Data Tools

DataSphere provides free CSV, XLSX and JSON analysis, cleaning, conversion, visualization and calculators. No login, subscription, payment integration or external AI API is used.

## Run locally

Python 3.11+ and Node.js 22+ are recommended. This workspace was verified with Python 3.14, pandas 3.0.2 and Node's installed runtime.

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
cd frontend
npm ci
npm run build
cd ..
.venv/Scripts/python.exe -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --workers 1 --limit-concurrency 16
```

Open http://127.0.0.1:8000. FastAPI serves the API and the built frontend, including prerendered HTML on direct tool URLs. For development, use `python run_app.py` or run Vite (`npm run dev` inside `frontend`) alongside the API. Vite proxies `/api` to port 8000.

## Implemented release

The ten first-priority tools are implemented: CSV Analyzer, Excel Analyzer, CSV Cleaner, Excel Cleaner, CSV to Excel, Excel to CSV, Duplicate Remover, Data Quality Checker, CSV Viewer and JSON Formatter.

The nine second-priority tools are implemented: CSV Chart Generator, Excel Chart Generator, JSON Validator, CSV Validator, CGPA Calculator, GPA Calculator, Percentage Calculator, Statistics Calculator and Unit Converter.

Each has a `/tools/<slug>` route, descriptions, instructions, FAQs, related links and metadata. The remaining proposed catalogue is intentionally deferred. Unimplemented tools are not advertised as available. Old data-tool URLs redirect in production. Legacy PDF/image utilities and the unsafe expression calculator have been removed from this data-focused release; they are not supported endpoints.

## Architecture

- `server/main.py`: API validation, anonymous session ownership, limits, lifecycle and static serving.
- `server/storage.py`: bounded parsing, workbook archive checks, in-memory store and expiry.
- `server/analytics_engine.py`: deterministic profiling, insights, charts, queries and safe exports.
- `server/cleaning.py`: pure transformations; preview does not mutate a dataset.
- `frontend/src/data/tools.js`: shared registry used by the UI and prerenderer.
- `frontend/src/components/DataTool.jsx`: upload, profiles, pagination, preview/apply/undo/reset and downloads.
- `frontend/src/components/LocalTool.jsx`: local JSON/CSV utilities and calculators.
- `frontend/src/components/ToolShell.jsx`: SEO, RelatedTools and AdSlot.
- `frontend/scripts/prerender.mjs`: 24 static content/metadata pages, sitemap and robots.txt.

## Data handling and limits

Uploads are limited to 10 MB, 100,000 rows, 200 columns, 2 million cells, 32 MB of decoded dataframe memory, 100 workbook sheets and 50 MB of uncompressed XLSX archive content. CSV is checked record by record before pandas allocation. The browser only receives a bounded page of raw rows. UTF-8/BOM and Latin-1 CSV are supported; XLS must first be saved as XLSX. CSV needs unique non-empty headers and consistent row widths. JSON analysis accepts an array of objects.

Datasets use random IDs and a separate HttpOnly SameSite=Strict anonymous cookie. All dataset reads, edits and exports check ownership. There are at most five datasets per session, 32 total and 256 MB of estimated dataframe/source storage. Undo retains three edits. IDs are not placed in browser URLs. Files are not sent to AI or ad providers.

Datasets expire one hour after creation, with a cleanup sweep every 30 seconds. Access is refused once expired. The delete button removes the dataset immediately. Restarting the process clears the store. Multipart upload handling may spool to OS temporary files; uploaded file handles are closed after processing. Crash recovery and OS temp-directory policy belong to the host operator. Request bodies and parsers also allocate temporary memory beyond the store budget: set process/container limits.

Rate limiting is 120 API requests per client IP per minute, held in bounded process memory. This is a single-process guard, not a distributed abuse-prevention service. Run **one worker** for this release. Multiple independent workers do not share datasets or limits. Horizontal scaling requires shared encrypted storage, shared TTLs and rate limits, and a job queue for heavy analysis. Proxy headers must only be trusted from your known reverse proxy.

## Analysis and cleaning semantics

- Dataset quality score: 70% completeness + 30% non-duplicate rows. Empty datasets score zero. This measures structural quality, not factual accuracy.
- Column quality score measures completeness only. Unique percentages use all rows as denominator. ID and high-cardinality flags are heuristics.
- Standard deviation and variance use sample (n−1) formulas; undefined values are shown as missing, not zero. Mode is empty if every value occurs once, and at most ten tied modes are shown.
- Infinite values are treated as unavailable during analysis, while the source is preserved. Date inference requires at least 95% parseable non-empty values. Date frequencies are capped at 1,000 periods per granularity.
- IQR outliers are possible anomalies, not automatic errors. Negative-valued groups are not shown as pie charts. The query builder ranks groups by value; use automatic monthly trends for chronological charts.
- Cleaning includes duplicate/missing handling, exact/text replacement, row/column removal, rename, case/whitespace changes, type/date conversion, empty rows/columns, column names, outlier flags/removal/capping, split into two and merge.
- Preview shows first ten rows plus full row/column/missing counts. Apply requires the same dataset revision. Undo/reset and sheet switching invalidate old previews. Selecting a different worksheet resets its edits and undo history.
- Exports contain the current selected sheet's values. They do not preserve Excel styles, macros, formulas or other sheets. Formula-like strings and headers are prefixed with an apostrophe for safe spreadsheet opening. JSON export preserves data strings.
- GPA/CGPA use explicit numeric grade points and credit weights; there is no universal percentage conversion. Browser numeric tools use JavaScript number precision.

## Production configuration

Copy `frontend/.env.example` to `.env.production` and set `VITE_SITE_URL` to your actual HTTPS origin **before building**. This controls canonical URLs and sitemap entries. The default localhost origin is only for development. Set `VITE_CONTACT_EMAIL` for a real contact link.

Set backend `COOKIE_SECURE=true` behind HTTPS. Same-origin is the default. If a separate frontend origin is needed, set an explicit comma-separated `CORS_ORIGINS`; never use a wildcard with credentials. Put the process behind HTTPS with request timeouts, a matching upload limit, concurrency/memory limits and monitoring. No deployment has been performed. Security review and capacity testing for your hosting environment remain necessary before public launch.

### Advertising

`ADS_ENABLED=false` is the default build setting. `ADS_ENABLED=true` reserves clearly labeled advertisement space after tool results and on the homepage. Desktop/tablet/mobile sizes are stable. `AdSlot` accepts placement, enabled, loading/fallback state and rendered ad content. Ads never sit inside the upload/clean/download controls. No ad-network script is included: configure your approved provider and applicable consent handling separately. Enabling the flag alone displays a fallback slot, not revenue-producing advertisements.

### Privacy-conscious events

`VITE_METRICS_ENABLED=false` by default. When enabled, a local `datasphere:metric` event contains only an allowlisted event name and tool slug. Events cover opens, uploads, analysis, conversion, download, calculation and errors. No collector or network analytics service is connected. Attach a first-party aggregate collector if desired; do not forward filenames, dataset IDs, cell values or raw inputs. This release does not claim to measure unique/returning users without such an integration.

## Verification

```powershell
.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
.venv/Scripts/python.exe -m unittest discover -s tests -v
cd frontend
npm run lint
npm test
npm run build
cd ..
# Optional browser checks, with the app running on port 8000:
python -m pip install playwright
python -m playwright install chromium
python -X utf8 tests/browser_smoke.py
```

Backend/API tests cover file types, malformed/large uploads, multi-sheet switching, ownership, expiry, limits, statistics, nulls, booleans, non-finite values, Unicode, source precision, safe spreadsheet exports, cleaning preview/apply/undo/reset, stale revisions, pagination/search and static routes. Browser evidence is saved in `outputs/verification`. See `AUDIT.md` and `VERIFICATION.md` for findings and measured results.

The offline `scripts/analysis.py` retail report is separate from the web app and additionally needs matplotlib. Its imputation and syntax errors were corrected; it is not a generic upload processor.
