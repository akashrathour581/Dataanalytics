from playwright.sync_api import sync_playwright
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET
import json
import sys
expected_ads='--ads' in sys.argv
routes=[urlsplit(e.text).path for e in ET.parse('frontend/dist/sitemap.xml').iter() if e.tag.endswith('loc')]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1440,'height':900});errors=[];external=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda req:external.append(req.url) if urlsplit(req.url).hostname not in ['127.0.0.1','localhost'] else None)
 for route in routes:
  response=page.goto('http://127.0.0.1:8000'+route,wait_until='networkidle');assert response.status==200,(route,response.status)
  assert page.locator('h1').count()==1,route
  assert 'canonical' in page.content()
  assert not page.locator('vite-error-overlay').count()
  if route.startswith('/tools/'):
   assert page.get_by_role('complementary',name='Advertisement',exact=True).count()==int(expected_ads)
   if expected_ads:
    for width in [320,768,1440]:
     page.set_viewport_size({'width':width,'height':900})
     box=page.locator('.ad-slot').bounding_box();assert box['height']==(250 if width<=768 else 280)
     assert page.locator('form .ad-slot,.tool-workspace .ad-slot').count()==0
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),route
    page.set_viewport_size({'width':1440,'height':900})
 # Verify retained datasets across navigation and actual ad positioning.
 page.goto('http://127.0.0.1:8000/tools/csv-analyzer',wait_until='networkidle')
 page.get_by_label('Choose data file').set_input_files({'name':'retain.csv','mimeType':'text/csv','buffer':b'a,b\n1,2\n3,4'})
 page.get_by_role('heading',name='Column profiles').wait_for()
 page.goto('http://127.0.0.1:8000/tools/csv-viewer',wait_until='networkidle')
 page.get_by_text('Datasets retained in this browser session (1)',exact=True).click()
 page.get_by_role('button',name='Open dataset',exact=True).click()
 page.get_by_label('Search all columns').wait_for()
 page.get_by_role('button',name='Delete dataset now',exact=True).click()
 page.get_by_text('No dataset uploaded. Choose a file above to begin.').wait_for()
 page.goto('http://127.0.0.1:8000/tools/json-formatter',wait_until='networkidle')
 if expected_ads:page.screenshot(path='outputs/verification/advertising-enabled.png',full_page=True)
 assert not errors,errors
 assert not external,external
 print(json.dumps({'routes':len(routes),'ads_enabled':expected_ads,'browser_errors':errors,'external_requests':external,'retained_dataset_reuse':'passed'}))
 b.close()
