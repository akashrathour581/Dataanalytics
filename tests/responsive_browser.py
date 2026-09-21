"""Responsive browser regression checks. Run against the built app on port 8000.

    .venv/Scripts/python.exe -X utf8 tests/responsive_browser.py
    .venv/Scripts/python.exe -X utf8 tests/responsive_browser.py --browser chromium

Install browsers first: python -m playwright install chromium firefox webkit
"""
import argparse
import json
import io
import pandas as pd
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs' / 'verification' / 'responsive'
SIZES = [(w, 900) for w in [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560]] + [(844, 390)]
SLUGS = re.findall(r"^  \['([^']+)'", (ROOT / 'frontend/src/data/tools.js').read_text(encoding='utf-8'), re.M)
LEGACY = re.findall(r"path: '([^']+)'", (ROOT / 'frontend/src/components/Sidebar.jsx').read_text(encoding='utf-8'))
ROUTES = list(dict.fromkeys(['/', '/tools', '/privacy', '/terms', '/contact'] + ['/tools/' + s for s in SLUGS] + LEGACY))
LAYOUT = """() => {
 const visible = e => {
  const s = getComputedStyle(e), r = e.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !e.closest('[inert],[aria-hidden="true"]');
 };
 const controls = [...document.querySelectorAll('main button, main input:not([type=hidden]):not([type=checkbox]):not([type=radio]), main select, main textarea')].filter(visible);
 const small = controls.filter(e => {const r=e.getBoundingClientRect(); return r.height < 43.5 || (e.tagName === 'BUTTON' && r.width < 43.5);}).map(e=>({text:(e.innerText||e.getAttribute('aria-label')||e.type||'').slice(0,45),width:Math.round(e.getBoundingClientRect().width),height:Math.round(e.getBoundingClientRect().height)}));
 const clipped = controls.filter(e => {
  const r=e.getBoundingClientRect();
  let parent=e.parentElement;
  while(parent && parent!==document.body) {
   const s=getComputedStyle(parent), p=parent.getBoundingClientRect();
   if ((s.overflowX==='auto'||s.overflowX==='scroll') && parent.scrollWidth>parent.clientWidth) return false;
   if ((s.overflowX==='hidden'||s.overflowX==='clip') && (r.right>p.right+2||r.left<p.left-2)) return true;
   parent=parent.parentElement;
  }
  return r.right>innerWidth+2||r.left < -2;
 }).map(e=>(e.innerText||e.getAttribute('aria-label')||e.type||'').slice(0,50));
 return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,small,clipped};
}"""


def check_layout(page, label, failures, touch=True):
    result = page.evaluate(LAYOUT)
    if result['scrollWidth'] > result['width'] + 1 or result['clipped'] or (touch and result['small']):
        failures.append({'page': label, **result})


def sweep(page, label, failures, screenshots=False):
    for width, height in SIZES:
        page.set_viewport_size({'width':width,'height':height})
        page.wait_for_timeout(80)
        check_layout(page, f'{label}@{width}x{height}', failures)
        if screenshots and width in (320,1024,1440):
            page.screenshot(path=str(OUT / f'{label.strip("/").replace("/","-") or "home"}-{width}.png'),full_page=True)


def drawer_checks(page):
    page.goto('http://127.0.0.1:8000/',wait_until='networkidle')
    page.set_viewport_size({'width':390,'height':844})
    trigger=page.get_by_role('button',name='Toggle navigation menu')
    trigger.click()
    dialog=page.get_by_role('dialog',name='Main navigation')
    dialog.wait_for(state='visible')
    assert trigger.get_attribute('aria-expanded') == 'true'
    assert page.locator('main').evaluate('(e)=>e.inert')
    assert page.evaluate('document.body.style.position') == 'fixed'
    close=dialog.get_by_role('button',name='Close sidebar menu')
    assert close.evaluate('(e)=>e===document.activeElement')
    close.focus()
    page.keyboard.press('Shift+Tab')
    assert dialog.get_by_role('button').last.evaluate('(e)=>e===document.activeElement')
    page.keyboard.press('Tab')
    assert close.evaluate('(e)=>e===document.activeElement')
    page.keyboard.press('Escape')
    assert trigger.evaluate('(e)=>e===document.activeElement')
    assert not page.locator('main').evaluate('(e)=>e.inert')
    trigger.click()
    page.locator('.sidebar-backdrop').click(position={'x':380,'y':100})
    assert trigger.get_attribute('aria-expanded') == 'false'
    trigger.click()
    page.set_viewport_size({'width':1280,'height':900})
    page.wait_for_timeout(100)
    assert not page.locator('main').evaluate('(e)=>e.inert')
    assert page.locator('.app-sidebar').is_visible()
    assert not trigger.is_visible()
    page.set_viewport_size({'width':390,'height':844})
    trigger.click()
    dialog.get_by_role('button',name='CSV Analyzer',exact=True).click()
    assert trigger.get_attribute('aria-expanded') == 'false'
    assert trigger.evaluate('(e)=>e===document.activeElement')
    assert not page.locator('main').evaluate('(e)=>e.inert')


def workflow_checks(page, failures, engine):
    # Exercise the studio with real data, including long labels and missing values.
    page.set_viewport_size({'width':390,'height':844})
    page.goto('http://127.0.0.1:8000/ai-data-analyst',wait_until='networkidle')
    page.get_by_role('button',name='Open Analytics Studio',exact=True).click()
    rows = ['name,value,other,date'] + [f'category_{i%3},{i+1},{(i+1)*2},2025-01-{i%28+1:02}' for i in range(30)]
    content = ('\n'.join(rows)+'\ncategory_0,,,2025-02-01').encode()
    page.get_by_label('Upload dataset').set_input_files({'name':'a_very_long_filename_'+'x'*80+'.csv','mimeType':'text/csv','buffer':content})
    page.locator('.active-dataset-banner').wait_for()
    for index, name in enumerate(['dashboard','builder','profiler','table']):
        page.locator('.tab-navigation button').nth(index).click()
        if name=='builder':
            page.get_by_label('X-axis column').wait_for()
            page.locator('.chart-body svg[role=application]').wait_for()
        if name=='table': page.locator('.data-table tbody tr').first.wait_for()
        sweep(page,'populated-'+name,failures,screenshots=engine=='chromium')
        if name=='profiler':
            button=page.get_by_role('button',name='Apply Auto-Clean',exact=False)
            if not button.count(): button=page.locator('.clean-panel button')
            button.click()
            page.get_by_text('Cleaning applied!',exact=False).wait_for()
            button.click()
            page.get_by_text('Cleaning applied!',exact=False).wait_for()
        if name=='table':
            page.get_by_placeholder('Search in all columns...').fill('category_1')
            page.wait_for_timeout(450)
            assert page.locator('.data-table tbody tr').count()==10
            page.get_by_placeholder('Search in all columns...').fill('')
            page.wait_for_timeout(450)
            page.get_by_role('button',name='Next',exact=True).click()
            page.wait_for_timeout(450)
            assert 'Page 2' in page.locator('.pagination-footer').inner_text()

    # The richer cleaner supports reversible edits and workbook switching.
    frame=pd.DataFrame({'name':['a','a','b'],'value':[1,1,3]})
    workbook=io.BytesIO()
    with pd.ExcelWriter(workbook,engine='openpyxl') as writer:
        frame.to_excel(writer,sheet_name='First',index=False)
        pd.DataFrame({'name':['second'],'value':[5]}).to_excel(writer,sheet_name='Second',index=False)
    page.goto('http://127.0.0.1:8000/tools/excel-cleaner',wait_until='networkidle')
    page.get_by_label('Choose data file').set_input_files({'name':'workbook.xlsx','mimeType':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','buffer':workbook.getvalue()})
    page.get_by_label('Operation',exact=True).wait_for()
    page.get_by_label('Operation',exact=True).select_option('duplicates')
    page.get_by_role('button',name='Preview changes',exact=True).click()
    page.get_by_role('button',name='Apply Changes',exact=True).wait_for()
    sweep(page,'cleaning-preview',failures,screenshots=engine=='chromium')
    page.get_by_role('button',name='Apply Changes',exact=True).click()
    page.get_by_text('Revision 1',exact=False).wait_for()
    page.get_by_role('button',name='Undo',exact=True).click()
    page.get_by_text('Revision 2',exact=False).wait_for()
    page.get_by_label('Worksheet (switching resets edits)').select_option('Second')
    page.get_by_text('Revision 3',exact=False).wait_for()
    with page.expect_download() as download:
        page.get_by_role('button',name='Download CSV',exact=True).click()
    assert download.value.suggested_filename.endswith('.csv')
    page.get_by_role('button',name='Data preview',exact=True).click()
    page.get_by_label('Search all columns').wait_for()
    sweep(page,'workbook-table',failures)
    page.get_by_role('button',name='Delete dataset now').click()
    page.get_by_text('No dataset uploaded. Choose a file above to begin.').wait_for()

    # Loading/error states must retain readable controls at the narrowest width.
    page.set_viewport_size({'width':320,'height':812})
    page.goto('http://127.0.0.1:8000/tools/statistics-calculator',wait_until='networkidle')
    page.get_by_label('Numbers (separated by spaces or commas)').fill('invalid-value')
    page.get_by_role('button',name='Calculate',exact=True).click()
    page.get_by_role('alert').wait_for()
    check_layout(page,'calculator-error@320',failures)
    page.get_by_label('Numbers (separated by spaces or commas)').fill('1,2,3,4,5')
    page.get_by_role('button',name='Calculate',exact=True).click()
    assert page.locator('dd').nth(1).inner_text()=='3'
    page.goto('http://127.0.0.1:8000/csv-to-json',wait_until='networkidle')
    page.locator('input[type=file]').set_input_files({'name':'long_'+('z'*120)+'.csv','mimeType':'text/csv','buffer':b'name,value\na,1'})
    check_layout(page,'converter-selected@320',failures)
    def capture_loading(route):
        page.wait_for_timeout(150)
        assert page.get_by_role('button',name='Processing File...').is_disabled()
        check_layout(page,'converter-loading@320',failures)
        route.continue_()
    page.route('**/api/tools/csv-to-json',capture_loading)
    page.get_by_role('button',name='Process & Convert Now').click()
    page.get_by_role('link',name='Download',exact=False).wait_for()
    check_layout(page,'converter-result@320',failures)
    page.unroute('**/api/tools/csv-to-json')
    with page.expect_download() as download:
        page.get_by_role('link',name='Download Result').click()
    assert download.value.suggested_filename.endswith('.json')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--browser', choices=['chromium','firefox','webkit'])
    parser.add_argument('--routes-only',action='store_true')
    args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    results=[]
    with sync_playwright() as p:
        for engine in ([args.browser] if args.browser else ['chromium','firefox','webkit']):
            browser=getattr(p,engine).launch(headless=True)
            context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
            page=context.new_page()
            errors=[]; failures=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            for route in ROUTES:
                page.goto('http://127.0.0.1:8000'+route,wait_until='networkidle')
                assert page.locator('main').inner_text().strip(), route
                print(f'{engine}: {route}',flush=True)
                sweep(page,route,failures,screenshots=engine=='chromium' and route in ['/','/calculator','/tools/excel-cleaner'])
            if not args.routes_only:
                print(f'{engine}: drawer and populated workflows',flush=True)
                drawer_checks(page)
                workflow_checks(page,failures,engine)
            if not args.routes_only:
                touch=browser.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=engine!='firefox',reduced_motion='reduce')
                mobile=touch.new_page()
                mobile.goto('http://127.0.0.1:8000/',wait_until='networkidle')
                mobile.get_by_role('button',name='Toggle navigation menu').tap()
                mobile.get_by_role('button',name='Close sidebar menu').tap()
                check_layout(mobile,'touch-phone',failures)
                touch.close()
            result={'browser':engine,'routes':len(ROUTES),'viewports':len(SIZES),'failures':failures,'page_errors':errors}
            results.append(result)
            (OUT/f'results-{args.browser or "all"}.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
            print(json.dumps(result,ensure_ascii=False),flush=True)
            browser.close()
    (OUT/f'results-{args.browser or "all"}.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    assert all(not r['failures'] and not r['page_errors'] for r in results), 'Responsive checks failed; see outputs/verification/responsive/results-*.json'

if __name__=='__main__': main()
