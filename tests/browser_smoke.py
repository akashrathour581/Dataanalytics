from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('outputs/verification');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1440,'height':1000})
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.goto('http://127.0.0.1:8000/',wait_until='networkidle')
 assert page.get_by_role('heading',name='Analyze, Clean & Transform Your Data Online').is_visible()
 page.screenshot(path=str(out/'homepage-desktop.png'),full_page=True)
 page.get_by_label('Search tools').fill('json')
 assert page.get_by_role('status').inner_text()=='2 tools found'
 page.goto('http://127.0.0.1:8000/tools/csv-cleaner',wait_until='networkidle')
 page.get_by_label('Choose data file').set_input_files({'name':'test.csv','mimeType':'text/csv','buffer':b'name,value\n a ,1\n a ,1\nb,3\n'})
 page.get_by_label('Operation',exact=True).wait_for()
 page.get_by_label('Operation',exact=True).select_option('duplicates')
 page.get_by_role('button',name='Preview changes',exact=True).click()
 page.get_by_role('button',name='Apply Changes',exact=True).wait_for()
 assert page.get_by_role('heading',name='Before',exact=True).is_visible()
 page.screenshot(path=str(out/'cleaning-preview.png'),full_page=True)
 page.get_by_role('button',name='Apply Changes',exact=True).click()
 page.get_by_text('Revision 1',exact=False).wait_for()
 page.get_by_role('button',name='Undo',exact=True).click()
 page.get_by_text('Revision 2',exact=False).wait_for()
 with page.expect_download() as event:page.get_by_role('button',name='Download CSV',exact=True).click()
 downloaded=event.value;downloaded.save_as(str(out/'cleaned.csv'))
 page.get_by_role('button',name='Data preview',exact=True).click()
 page.get_by_label('Search all columns').fill('b')
 page.get_by_text('1 rows · Page 1 of 1',exact=True).wait_for()
 page.get_by_role('button',name='Charts',exact=True).click()
 page.get_by_label('X-axis column').wait_for()
 page.screenshot(path=str(out/'charts-desktop.png'),full_page=True)
 page.get_by_role('button',name='Delete dataset now').click()
 page.get_by_text('No dataset uploaded. Choose a file above to begin.').wait_for()
 for width in [320,375,390,430,768,1024,1280,1440,1920]:
  page.set_viewport_size({'width':width,'height':900})
  page.goto('http://127.0.0.1:8000/',wait_until='networkidle')
  assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),f'Homepage overflow at {width}'
  page.goto('http://127.0.0.1:8000/tools/csv-cleaner',wait_until='networkidle')
  assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),f'Tool overflow at {width}'
  if width==390:page.screenshot(path=str(out/'tool-mobile.png'),full_page=True)
  if width in [320,390,768]:
   page.get_by_label('Choose data file').set_input_files({'name':'wide.csv','mimeType':'text/csv','buffer':b'long_column_name,value,category,date\na,1,x,2025-01-01\nb,2,y,2025-02-01\n'})
   page.get_by_role('button',name='Data preview',exact=True).click()
   page.get_by_label('Search all columns').wait_for()
   assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),f'Populated table overflow at {width}'
   page.get_by_role('button',name='Charts',exact=True).click()
   page.get_by_label('X-axis column').wait_for()
   assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),f'Chart overflow at {width}'
   if width==390:page.screenshot(path=str(out/'charts-mobile.png'),full_page=True)
   page.get_by_role('button',name='Delete dataset now').click()
   page.get_by_text('No dataset uploaded. Choose a file above to begin.').wait_for()
 page.goto('http://127.0.0.1:8000/tools/json-formatter',wait_until='networkidle')
 page.get_by_label('JSON input',exact=True).fill('{"a":1}')
 page.get_by_role('button',name='Format JSON',exact=True).click()
 assert '"a": 1' in page.locator('pre').inner_text()
 page.goto('http://127.0.0.1:8000/tools/statistics-calculator',wait_until='networkidle')
 page.get_by_label('Numbers (separated by spaces or commas)').fill('1,2,3,4,5')
 page.get_by_role('button',name='Calculate',exact=True).click()
 assert page.locator('dd').nth(1).inner_text()=='3'
 assert not errors,errors
 print(json.dumps({'status':'passed','browser_errors':errors,'viewports':[320,375,390,430,768,1024,1280,1440,1920],'flows':['directory search','CSV upload','clean preview/apply','undo','CSV download','row search','charts','delete dataset','JSON formatting','statistics']}))
 browser.close()
