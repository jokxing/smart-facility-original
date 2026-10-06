// Tests the shared presentation helper's actual implementation, including initial empty detail.
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const source=fs.readFileSync(path.resolve(__dirname,'../miniprogram/utils/methods.js'),'utf8');
const start=source.indexOf('export function statusColor(');
const end=source.indexOf('export function statusText(',start);
const context={};
vm.runInNewContext(source.slice(start,end).replace('export function','function'),context);
const states=[{code:1,value:'normal'},{code:[2,-1],value:'abnormal'},{code:-100,value:'offline'}];
assert.strictEqual(context.statusColor(1,states).class,'normal');
assert.strictEqual(context.statusColor('1',states).class,'normal');
assert.strictEqual(context.statusColor(2,states).class,'abnormal');
assert.strictEqual(context.statusColor(-1,states).class,'abnormal');
assert.strictEqual(context.statusColor(-100,states).class,'offline');
for(const value of [undefined,null,999])assert.strictEqual(context.statusColor(value,states).class,'');
assert.strictEqual(context.statusColor(1,[]).class,'');
console.log('Status color initialization and known states passed');
