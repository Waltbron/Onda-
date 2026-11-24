import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateHealth} from '../src/health.mjs';
const now='2026-11-24T12:00:00.000Z';
const src=(id,extra={})=>({id,enabled:true,permission:'approved',...extra});
test('sin incidentes: fuente ok y reciente',()=>{
  const r=evaluateHealth({report:{sources:[{sourceId:'a',status:'ok'}]},state:{sources:{a:{lastSuccessAt:'2026-11-24T08:00:00.000Z'}}},sources:[src('a')],now});
  assert.equal(r.ok,true);
});
test('fuente degradada o bloqueada es incidente',()=>{
  const r=evaluateHealth({report:{sources:[{sourceId:'a',status:'degradada',error:'HTTP 500'},{sourceId:'b',status:'bloqueada'}]},sources:[],now});
  assert.equal(r.incidents.length,2);assert.equal(r.incidents[0].detail,'HTTP 500');
});
test('estado "revisión" no es incidente',()=>{
  assert.equal(evaluateHealth({report:{sources:[{sourceId:'a',status:'revisión'}]},sources:[],now}).ok,true);
});
test('fuente habilitada sin éxito hace más de 36 h es desactualizada',()=>{
  const r=evaluateHealth({report:{sources:[]},state:{sources:{a:{lastSuccessAt:'2026-11-22T08:00:00.000Z'}}},sources:[src('a')],now});
  assert.equal(r.ok,false);assert.equal(r.incidents[0].type,'desactualizada');
});
test('fuente deshabilitada o sin historial no se marca desactualizada',()=>{
  const r=evaluateHealth({report:{sources:[]},state:{sources:{a:{lastSuccessAt:'2026-01-01T00:00:00.000Z'}}},sources:[src('a',{enabled:false}),src('nueva')],now});
  assert.equal(r.ok,true);
});
