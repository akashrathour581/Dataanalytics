import {useEffect} from 'react';
import {faqsFor, toolPath, tools} from '../data/tools';
export function AdSlot({placement='below-result',state='fallback',children,enabled=import.meta.env.VITE_ADS_ENABLED==='true'}) {
  if(!enabled) return null;
  return <aside className={`ad-slot ad-${placement}`} aria-label="Advertisement" data-state={state}><span>Advertisement</span><div>{state==='loading'?'Loading advertisement…':children || 'Advertising space'}</div></aside>;
}
export function RelatedTools({tool}) {
  const related=tools.filter(t=>t.slug!==tool.slug && (t.category===tool.category || (tool.accept && t.accept?.split(',').some(ext=>tool.accept.includes(ext))))).slice(0,4);
  return <section><h2>Related tools</h2><div className="tool-grid">{related.map(t=><a className="tool-card" href={toolPath(t)} key={t.slug}><strong>{t.name}</strong><p>{t.description}</p><span>Open tool →</span></a>)}</div></section>;
}
export function Seo({tool,path,title,description}) {
  const name=title || `${tool.name} — Free Online Tool | DataSphere AI`;
  const desc=description || tool.description;
  useEffect(()=>{
    document.title=name;
    const canonical=new URL(path,import.meta.env.VITE_SITE_URL || window.location.origin).href;
    const meta=(key,value,property=false)=>{let el=document.head.querySelector(`meta[${property?'property':'name'}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',key);document.head.append(el);}el.content=value;};
    meta('description',desc);meta('og:title',name,true);meta('og:description',desc,true);meta('og:url',canonical,true);meta('og:type','website',true);meta('twitter:card','summary');meta('twitter:title',name);meta('twitter:description',desc);
    let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.append(link);}link.href=canonical;
    let schema=document.getElementById('page-schema');if(!schema){schema=document.createElement('script');schema.id='page-schema';schema.type='application/ld+json';document.head.append(schema);}
    schema.textContent=JSON.stringify(tool?{'@context':'https://schema.org','@graph':[{'@type':'WebApplication',name:tool.name,url:canonical,applicationCategory:'UtilitiesApplication',operatingSystem:'Any',offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:new URL('/',canonical).href},{'@type':'ListItem',position:2,name:'Tools',item:new URL('/tools',canonical).href},{'@type':'ListItem',position:3,name:tool.name,item:canonical}]},{'@type':'FAQPage',mainEntity:faqsFor(tool).map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}]}:{'@context':'https://schema.org','@type':'WebSite',name:'DataSphere AI',url:canonical});
  },[name,desc,path,tool]);
  return null;
}
export function ToolInfo({tool}) {
  return <><section className="info-section"><h2>How to use {tool.name}</h2><ol><li>{['json','csv','calculator'].includes(tool.kind)?'Enter or paste your input in the tool above.':`Choose a ${tool.accept} file, or try the sample dataset where available.`}</li><li>{tool.kind==='clean'?'Choose a transformation and inspect the before and after preview. Apply only when it looks right.':tool.kind==='convert'?'Select the worksheet if needed and review the source rows.':'Run the tool and review the results.'}</li><li>{['json','csv','calculator'].includes(tool.kind)?'Copy your result or adjust the inputs to try again.':'Download your result, or delete the dataset when finished.'}</li></ol><h2>Features and supported input</h2><p>{tool.description} {tool.kind==='clean'?'Undo retains the last three edits; reset returns to the original selected worksheet.':tool.kind==='quality'?'The dataset score weights completeness at 70% and non-duplicate rows at 30%. Column scores measure completeness, not correctness.':tool.kind==='analysis'?'Statistics use sample standard deviation and variance. Potential outliers use the 1.5 × IQR rule and are not automatically errors.':''}</p>{tool.accept&&<p>CSV files use comma-separated columns with a header row. XLSX exports contain values from one selected sheet. Spreadsheet exports prefix formula-like text with an apostrophe for safe opening. Legacy XLS files must first be saved as XLSX.</p>}</section><section><h2>Frequently asked questions</h2>{faqsFor(tool).map(f=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section><RelatedTools tool={tool}/></>;
}
