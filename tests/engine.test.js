const assert=require('node:assert/strict');const {select,plan}=require('../docs/engine.js');
const rows=[{id:'A',score:90,channel:'sms',consent:true,segment:'loyal'},{id:'B',score:99,channel:'email',consent:false,segment:'loyal'},{id:'C',score:80,channel:'app',consent:true,segment:'exploring'}];
assert.equal(select(rows,{segment:'loyal',min:95}).length,1);
assert.deepEqual(plan(rows,1,1).selected.map(r=>r.id),['A']);
assert.deepEqual(plan(rows,.2,10).selected.map(r=>r.id),['C']);
assert.equal(plan(rows,0,10).selected.length,0);assert.equal(plan([],100,10).spent,0);
const data=require('../docs/data.json').customers;
for(const budget of [0,.1,1,5,30,300])for(const cap of [0,1,50,500]){const p=plan(data,budget,cap);assert(p.spent<=budget+1e-8);assert(p.selected.length<=cap);assert(p.selected.every(r=>r.consent));assert.equal(new Set(p.selected.map(r=>r.id)).size,p.selected.length);}
console.log('Budget, eligibility, ordering, capacity and empty-state checks passed.');
