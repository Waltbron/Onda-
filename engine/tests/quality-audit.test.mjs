import test from 'node:test';
import assert from 'node:assert/strict';
import {auditQuality} from '../src/quality-audit.mjs';
const NOW='2026-11-08T12:00:00Z';
const event=(id,patch={})=>({id,title:'Actividad '+id,date:'2026-11-10',endDate:'2026-11-10',
  city:'Maldonado',place:'Teatro',sourceUrl:'https://example.org/eventos/'+id,checkedAt:'2026-11-08',
  category:'Cultura',status:'verificado',...patch});
const run=(events,other={})=>auditQuality({events,sources:[],meta:{activeConnectors:0},now:NOW,...other});
test('vigencia real: no cuenta fichas históricas, calcula próximas ventanas',()=>{
  const q=run([event('futuro'),event('vencido',{date:'2026-10-01',endDate:'2026-10-01'})]);
  assert.equal(q.metrics.publishedTotal,2);
  assert.equal(q.metrics.activeNow,1);
  assert.equal(q.metrics.notCurrent,1);
  assert.equal(q.metrics.availableNext7Days,1);
  assert.equal(q.metrics.availableNext30Days,1);
  assert.equal(q.coverageRate,null);
  assert.equal(q.aiCalls,0);
});
test('evento sin hora permanece vigente hasta el fin del día, con zona de Uruguay',()=>{
  const q=run([event('hoy',{date:'2026-11-08',endDate:'2026-11-08',time:null})]);
  assert.equal(q.metrics.activeNow,1);
  assert.equal(q.metrics.availableNext7Days,1);
});
test('no convierte candidatos de revisión en publicaciones',()=>{
  const q=run([event('uno')],{radar:{pending:7}});
  assert.equal(q.metrics.publishedTotal,1);
  assert.equal(q.metrics.radarPending,7);
  assert.equal(q.publicationAttempted,false);
  assert.equal(q.networkRequests,0);
});
test('detecta integridad y duplicados sin eliminarlos automáticamente',()=>{
  const q=run([event('a',{title:'Música del Este'}),event('b',{title:'Musica del Este',sourceUrl:'http://unsafe.test'})]);
  assert.equal(q.metrics.publishedTotal,2);
  assert.equal(q.possibleDuplicates.length,1);
  assert.ok(q.invalid.some(x=>x.reason==='URL de fuente no HTTPS'));
});
test('registra revisiones antiguas y fuentes permitidas sin inventar tasa de cobertura',()=>{
  const q=run([event('uno',{checkedAt:'2026-10-01'})],{sources:[{enabled:true,permission:'approved',publicationPolicy:'automatic'}],meta:{activeConnectors:1}});
  assert.equal(q.metrics.activeConnectors,1);
  assert.equal(q.staleChecks.length,1);
  assert.equal(q.findings.some(x=>x.code==='no-live-sources'),false);
  assert.equal(q.coverageRate,null);
});
