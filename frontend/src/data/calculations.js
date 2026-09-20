export function numbers(text) {
 if(!text.trim())throw new Error('Enter at least one number.');
 const values=text.trim().split(/[\s,;]+/).map(Number);
 if(values.length>10000||values.some(v=>!Number.isFinite(v)))throw new Error('Enter up to 10,000 finite numbers separated by spaces or commas.');
 return values;
}
export function statistics(text){
 const values=numbers(text).sort((a,b)=>a-b), n=values.length;
 let mean=0,m2=0;values.forEach((v,i)=>{const delta=v-mean;mean+=delta/(i+1);m2+=delta*(v-mean);});
 const counts=new Map();values.forEach(v=>counts.set(v,(counts.get(v)||0)+1));const max=Math.max(...counts.values());
 const modes=max===1?[]:[...counts].filter(([,c])=>c===max).map(([v])=>v);
 if(!Number.isFinite(mean)||!Number.isFinite(m2))throw new Error('Numbers are too large to calculate reliably.');
 return {Count:n,Mean:mean,Median:n%2?values[(n-1)/2]:(values[n/2-1]+values[n/2])/2,Mode:modes.length?modes.join(', '):'No repeated mode',Minimum:values[0],Maximum:values[n-1],'Sample variance':n>1?m2/(n-1):'Undefined for one value','Sample standard deviation':n>1?Math.sqrt(m2/(n-1)):'Undefined for one value'};
}
export function weightedGrade(text,scale){
 const rows=text.trim().split('\n').map(line=>line.split(',').map(v=>v.trim()));
 if(!text.trim()||rows.some(r=>r.length!==2||r.some(v=>v==='')))throw new Error('Use one grade,credits pair per line.');
 const pairs=rows.map(r=>r.map(Number));
 if(!Number.isFinite(scale)||scale<=0||pairs.some(([g,c])=>!Number.isFinite(g)||!Number.isFinite(c)||g<0||g>scale||c<=0))throw new Error('Grades must be within your scale and credits must be positive.');
 const credits=pairs.reduce((s,[,c])=>s+c,0);const average=pairs.reduce((s,[g,c])=>s+g*c,0)/credits;
 if(!Number.isFinite(average)||!Number.isFinite(credits))throw new Error('Values are too large to calculate.');
 return {'Weighted grade':average,'Total credits':credits,'Grade scale':scale};
}
export function validateCsv(text){
 if(!text.trim())throw new Error('Enter CSV text with a header row.');
 let rows=[],row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
  if(c==='"'){if(cell||closed)throw new Error('Unexpected quote in an unquoted field.');quoted=true;}
  else if(c===','||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==','){rows.push(row);row=[];if(c==='\r'&&text[i+1]==='\n')i++;}}
  else{if(closed)throw new Error('Unexpected character after a closing quote.');cell+=c;}
 }
 if(quoted)throw new Error('A quoted field is not closed.');
 if(cell||row.length||closed)rows.push([...row,cell]);
 if(!rows.length)throw new Error('CSV contains no rows.');
 const width=rows[0].length;const invalid=rows.map((r,i)=>r.length===width?null:i+1).filter(Boolean);
 if(invalid.length)throw new Error(`Row widths differ from the header on records: ${invalid.slice(0,10).join(', ')}.`);
 if(rows[0].some(c=>!c.trim())||new Set(rows[0]).size!==width)throw new Error('Headers must be non-empty and unique.');
 return {Valid:true,'Data rows':rows.length-1,Columns:width};
}
export const units={Length:{m:1,km:1000,cm:.01,mm:.001,in:.0254,ft:.3048,yd:.9144,mi:1609.344},Mass:{kg:1,g:.001,mg:.000001,lb:.45359237,oz:.028349523125},Temperature:{C:1,F:1,K:1}};
export function convertUnit(value,group,from,to){
 if(!Number.isFinite(value)||!units[group]?.[from]||!units[group]?.[to])throw new Error('Choose valid units and a finite number.');
 if(group==='Temperature'){
 const c=from==='F'?(value-32)*5/9:from==='K'?value-273.15:value;
 if(c < -273.15)throw new Error('Temperature cannot be below absolute zero.');
 return to==='F'?c*9/5+32:to==='K'?c+273.15:c;
 }
 return value*units[group][from]/units[group][to];
}
