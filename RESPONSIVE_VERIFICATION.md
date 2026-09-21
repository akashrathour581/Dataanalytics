# Responsive verification — 2026-09-21

The existing design now uses a navigation drawer through 1024px, flexible tool and dashboard grids, container-aware calculator controls, bounded chart heights, wrapping filenames/results, and local scrolling for wide tables and tab strips. Mobile controls have at least 44px targets and readable input text. Drawer behavior includes Escape, focus trapping/restoration, background scroll locking, and safe-area spacing.

## Automated coverage

Chromium, Firefox, and WebKit passed the route matrix and populated workflows with no detected layout failures or uncaught page errors. A WebKit-specific focus restoration issue was corrected, then the drawer checks passed again in all three engines.

`tests/responsive_browser.py` checks 53 routes at widths 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, and 2560px, plus 844×390 landscape. It checks document overflow, clipped controls, minimum control dimensions, and uncaught browser errors.

Populated workflows cover CSV upload with a long filename, dashboard/chart rendering, repeated cleaning, table search and pagination, XLSX worksheet selection, cleaning preview/apply/undo, downloads, dataset deletion, calculator validation/results, and converter selected/loading/result states. Separate touch and keyboard checks cover the drawer.

Representative screenshots were inspected for the 320px homepage/calculator, populated mobile charts and desktop dashboard, and 1024px drawer. Screenshots and generated JSON reports are under `outputs/verification/responsive` (ignored build artifacts).

## Reproduce

Install the optional browser tools in the development environment:

```powershell
.venv/Scripts/python.exe -m pip install playwright
.venv/Scripts/python.exe -m playwright install chromium firefox webkit
```

Build the frontend with `npm run build` in `frontend`, start the application on port 8000, then run:

```powershell
.venv/Scripts/python.exe -X utf8 tests/responsive_browser.py
.venv/Scripts/python.exe -m unittest discover -s tests -q
```

Use `--browser chromium`, `--browser firefox`, or `--browser webkit` for an individual browser. Run `npm run lint` and `npm test` in `frontend` for the frontend checks.

The production build and lint pass, alongside 42 backend tests and 9 calculation tests. Browser checks use desktop engines with viewport/touch emulation; physical-device testing is outside this verification.
