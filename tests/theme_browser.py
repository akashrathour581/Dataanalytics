"""Theme regression checks against the built application on port 8000."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from responsive_browser import check_layout

out = Path('outputs/verification/themes')
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    for engine in ['chromium', 'firefox', 'webkit']:
        browser = getattr(p, engine).launch()
        context = browser.new_context(color_scheme='light', reduced_motion='reduce')
        page = context.new_page()
        errors, failures = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto('http://127.0.0.1:8000/')
        page.get_by_role('button', name='Switch to dark mode').wait_for()
        assert page.locator('html').get_attribute('data-theme') == 'light'
        page.emulate_media(color_scheme='dark')
        page.get_by_role('button', name='Switch to light mode').click()
        page.reload()
        page.get_by_role('button', name='Switch to dark mode').wait_for()
        assert page.evaluate("localStorage.getItem('datasphere-theme')") == 'light'
        for route in ['/', '/calculator', '/tools/excel-cleaner', '/csv-to-json', '/tools/statistics-calculator']:
            page.goto('http://127.0.0.1:8000' + route, wait_until='networkidle')
            for theme in ['light', 'dark']:
                if page.locator('html').get_attribute('data-theme') != theme:
                    page.get_by_role('button', name=f'Switch to {theme} mode').click()
                for width in [320, 768, 1024, 1440]:
                    page.set_viewport_size({'width': width, 'height': 900})
                    check_layout(page, f'{route}:{theme}@{width}', failures)
                if engine == 'chromium' and route in ['/', '/calculator']:
                    page.screenshot(path=str(out / f'{route.strip("/") or "home"}-{theme}.png'), full_page=True)
        assert not failures, failures
        assert not errors, errors
        context.close()
        # A denied localStorage must not prevent switching the theme.
        context = browser.new_context(color_scheme='dark')
        context.add_init_script("Object.defineProperty(window, 'localStorage', {get() {throw new Error('disabled')}})")
        page = context.new_page()
        page.goto('http://127.0.0.1:8000/')
        page.get_by_role('button', name='Switch to light mode').click()
        assert page.locator('html').get_attribute('data-theme') == 'light'
        browser.close()
        print(f'{engine}: theme persistence, system preference, layouts and disabled storage passed', flush=True)
