import test from 'node:test';import assert from 'node:assert/strict';
import {statistics,weightedGrade,validateCsv,convertUnit} from '../frontend/src/data/calculations.js';
test('statistics include sample variance and multimodal results',()=>{const s=statistics('1,2,3,4,5');assert.equal(s.Mean,3);assert.equal(s['Sample variance'],2.5);assert.equal(statistics('1,1,2,2').Mode,'1, 2');assert.match(statistics('1')['Sample variance'],/Undefined/);});
test('invalid numbers and blank input are rejected',()=>{for(const s of ['', '1,no','Infinity'])assert.throws(()=>statistics(s));});
test('grade weighting and scale validation',()=>{assert.equal(weightedGrade('3,2\n4,2',4)['Weighted grade'],3.5);for(const s of ['5,2','2,0','2,','2,3,4'])assert.throws(()=>weightedGrade(s,4));});
test('CSV handles quotes, commas, multiline records and CRLF',()=>{assert.deepEqual(validateCsv('name,value\r\n"a,b",1\r\n"multi\nline",2\r\n'),{Valid:true,'Data rows':2,Columns:2});assert.equal(validateCsv('a,b\n"a""b",2')['Data rows'],1);});
test('CSV detects invalid quoting and row widths',()=>{for(const s of ['a,b\n1','a,a\n1,2','a,b\n"bad,2','a,b\n"a"oops,2'])assert.throws(()=>validateCsv(s));});
test('unit conversion uses exact base factors',()=>{assert.equal(convertUnit(1,'Length','in','cm'),2.54);assert.equal(convertUnit(32,'Temperature','F','C'),0);assert.equal(convertUnit(0,'Temperature','C','K'),273.15);assert.throws(()=>convertUnit(-1,'Temperature','K','C'));});

test('numeric edge cases do not silently invent zeros or overflow',()=>{
 for(const input of [',1','1,',';'])assert.throws(()=>statistics(input));
 assert.equal(statistics('1e308,1e308').Median,1e308);
 assert.equal(convertUnit(1e308,'Length','km','km'),1e308);
 assert.throws(()=>convertUnit(1e308,'Length','km','mm'));
});
test('CSV validator accepts a UTF-8 BOM before a quoted header',()=>{
 assert.equal(validateCsv('\uFEFF"name",value\nAlice,1')['Data rows'],1);
});

import {evaluateExpression} from '../frontend/src/data/expression.js';
test('scientific arithmetic obeys precedence and rejects executable syntax',()=>{
 for(const [input,expected] of [['2+3*4',14],['-2^2',-4],['2^3^2',512],['2^-2',.25],['(3+2)!',120],['50%',.5],['sin(30)',.5],['1e-20',1e-20]])assert.equal(evaluateExpression(input),expected,input);
 for(const input of ['1/0','sqrt(-1)','171!','1.5!','globalThis.alert(1)','(()=>1)()','constructor(1)','2+'])assert.equal(evaluateExpression(input),null,input);
});
