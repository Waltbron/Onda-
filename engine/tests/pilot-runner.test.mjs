import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePilot,runIsolatedPilots} from '../src/pilot-runner.mjs';
const now='2026-11-12T13:00:00.000Z';
const src=(id,rest={})=>({id,enabled:true,permission:'approved',permissionEvidence:'fixture prueba',publicationPolicy:'review',adapter:'jsonld-event-html',...rest});
const pol=(sourceId,rest={})=>({sourceId,stage:'read-only',cadenceHours:48,...rest});

test('conector inactivo o sin permiso no genera llamadas',async()=>{
 const sources=[src('maca',{enabled:false}),src('idm',{permission:'pending'})];
 let calls=0;
 const r=await runIsolatedPilots({sources,policies:[pol('maca'),pol('idm')],now,fetchOne:async()=>{calls++;return {ok:true,candidates:[{}]}}});
 assert.equal(calls,0);assert.equal(r.results.every(x=>x.status==='omitida'),true);
});
test('modo fixture o pausado nunca consulta',()=>{
 assert.equal(evaluatePilot(src('maca'),pol('maca',{stage:'fixture'}),{},now).due,false);
 assert.equal(evaluatePilot(src('maca'),pol('maca',{stage:'paused'}),{},now).due,false);
});
test('respeta ventana y 48 horas desde último intento',()=>{
 assert.equal(evaluatePilot(src('maca'),pol('maca',{notBefore:'2026-11-13T00:00:00Z'}),{},now).due,false);
 const state={sources:{maca:{lastAttemptAt:'2026-11-11T13:00:00.000Z'}}};
 assert.equal(evaluatePilot(src('maca'),pol('maca'),state,now).due,false);
 assert.equal(evaluatePilot(src('maca'),pol('maca'),{},now).due,true);
});
test('fallo de MACA no impide ejecutar el piloto de IDM',async()=>{
 const calls=[];
 const r=await runIsolatedPilots({sources:[src('maca'),src('idm')],policies:[pol('maca'),pol('idm')],now,fetchOne:async s=>{
  calls.push(s.id);if(s.id==='maca')throw Error('HTTP 503');return {ok:true,candidates:[{title:'evento'}],issues:[]};
 }});
 assert.deepEqual(calls,['maca','idm']);assert.deepEqual(r.results.map(x=>x.status),['degradada','válida']);assert.equal(r.publicationAllowed,false);
});
test('sin eventos o con error de parser no se considera fuente válida',async()=>{
 let i=0;
 const r=await runIsolatedPilots({sources:[src('maca'),src('idm')],policies:[pol('maca'),pol('idm')],now,fetchOne:async()=>i++===0?{ok:true,candidates:[]}:{ok:true,candidates:[{}],issues:[{reason:'invalid'}]}});
 assert.deepEqual(r.results.map(x=>x.status),['degradada','degradada']);
});
test('restringe a revisión: evita ejecutar fuente configurada para publicar',()=>{
 assert.equal(evaluatePilot(src('maca',{publicationPolicy:'automatic'}),pol('maca'),{},now).due,false);
});
