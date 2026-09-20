# DataSphere audit — 2026-09-18

Reviewed the FastAPI routes, analytics and utility engines, React entry point and components, SEO content, styling, dependencies, launcher, and offline scripts before implementation. The nested legacy directory is empty. No AGENTS.md applies to project sources.

| Priority | Finding | Remediation |
|---|---|---|
| P0 | No confirmed P0 incident or exposed credential found | No invented critical findings |
| P1 | Unbounded upload reads, workbook expansion, rows, retained datasets | Shared bounded ingestion, archive checks, capacity and expiry |
| P1 | Short dataset IDs and no ownership checks | Random capabilities plus anonymous HttpOnly session ownership |
| P1 | Sheet switching is a no-op | Retain bounded workbook source; actually parse selected sheet |
| P1 | Formula strings written as executable spreadsheet cells | Escape dangerous strings and headers on spreadsheet export |
| P1 | PDF/image imports require undeclared packages and can block all API startup | Isolate legacy utilities from supported data platform |
| P1 | Calculator executes input through new Function | Replace public calculator paths with deterministic arithmetic |
| P1 | Cleaning has no preview/undo; whitespace cleaning converts nulls to strings | Transactional preview, revision checks, bounded undo/reset |
| P1 | Raw exceptions and filenames leak into API responses/headers; permissive CORS | Safe errors, safe attachment names, same-origin defaults |
| P2 | Invalid query columns silently fall back to counts; value column collision | Validated query contract and collision-free results |
| P2 | Shares for negative/zero totals are misleading; missing correlations shown as zero | Supported insights and explicit undefined results |
| P2 | Date inference accepts 60% of 50 rows; exports/preview round source values | Conservative inference; preserve original numeric precision |
| P2 | No full statistics, quality flags or column score | Expanded deterministic profiling |
| P2 | No tool directory, global discovery, canonical/OG/schema/sitemap | Shared registry, independent routes and prerendered SEO pages |
| P2 | Auto sample upload on every page, all tools eagerly bundled | Explicit sample action and lazy tool modules |
| P2 | Silent fetch errors, stale table requests, inaccessible upload/sort controls | Accessible controls, cancellation, error states |
| P2 | Privacy copy claims immediate deletion despite indefinite storage | Accurate retention and explicit deletion documentation |
| P2 | No tests or production serving instructions | Engine/API/browser checks and deployment guide |
| P3 | Legacy offline analysis script has syntax errors and incorrect sales imputation | Repair script and document optional plotting dependency |

Scope: first ten tools, then the nine second-priority tools. Remaining catalogue tools are a subsequent release, as requested; unimplemented tools must not appear as working links. Legacy PDF/image utilities are outside this data-tool release and are not exposed by the new API. Production readiness still requires operator-specific HTTPS, resource limits, monitoring and ad-provider configuration.

## Completion status

The findings above were addressed in the implemented 19-tool release and checked as described in [VERIFICATION.md](VERIFICATION.md). The final build has ads disabled, 24 prerendered pages, no lint warnings and 33 passing backend/calculation regression tests. See [README.md](README.md) for operational limits and the remaining deployment/ad-provider configuration. No cloud deployment was performed.
