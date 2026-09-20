import test from 'node:test';import assert from 'node:assert/strict';
import {statistics,weightedGrade,validateCsv,convertUnit} from '../frontend/src/data/calculations.js';
test('statistics include sample variance and multimodal results',()=>{const s=statistics('1,2,3,4,5');assert.equal(s.Mean,3);assert.equal(s['Sample variance'],2.5);assert.equal(statistics('1,1,2,2').Mode,'1, 2');assert.match(statistics('1')['Sample variance'],/Undefined/);});
test('invalid numbers and blank input are rejected',()=>{for(const s of ['', '1,no','Infinity'])assert.throws(()=>statistics(s));});
test('grade weighting and scale validation',()=>{assert.equal(weightedGrade('3,2\n4,2',4)['Weighted grade'],3.5);for(const s of ['5,2','2,0','2,','2,3,4'])assert.throws(()=>weightedGrade(s,4));});
test('CSV handles quotes, commas, multiline records and CRLF',()=>{assert.deepEqual(validateCsv('name,value\r\n"a,b",1\r\n"multi\nline",2\r\n'),{Valid:true,'Data rows':2,Columns:2});assert.equal(validateCsv('a,b\n"a""b",2')['Data rows'],1);});
test('CSV detects invalid quoting and row widths',()=>{for(const s of ['a,b\n1','a,a\n1,2','a,b\n"bad,2','a,b\n"a"oops,2'])assert.throws(()=>validateCsv(s));});
test('unit conversion uses exact base factors',()=>{assert.equal(convertUnit(1,'Length','in','cm'),2.54);assert.equal(convertUnit(32,'Temperature','F','C'),0);assert.equal(convertUnit(0,'Temperature','C','K'),273.15);assert.throws(()=>convertUnit(-1,'Temperature','K','C'));});
