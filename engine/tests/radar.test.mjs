import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectRadarBatch} from '../src/radar-intake.mjs';
const now='2026-11-08T15:00:00.000Z';
const event={
 title:'Concierto de prueba',date:'2026-12-12',time:'20:30',
 place:'Sala de prueba',city:'Maldonado',category:'Música',
 sourceUrl:'https://example.org/cartelera/123',officialUrl:'https://example.org/organizador/123',
 discoveredAt:now,
 evidence:[{field:'fecha',url:'https://example.org/organizador/123',excerpt:'Sábado 12 de diciembre, 20:30'}]
};
const batch=(events)=>({schemaVersion:1,origin:'chatgpt-radar-onda',events});
test('Lote documentado queda en revisión, nunca publica',()=>{
 const r=inspectRadarBatch(batch([event]),{now});
 assert.equal(r.accepted,1);assert.equal(r.candidates[0].status,'candidato_documentado');
 assert.equal(r.automaticPublication,false);assert.equal(r.candidates[0].publishable,false);
});
test('Descubrimiento sin fuente oficial queda por verificar',()=>{
 const r=inspectRadarBatch(batch([{...event,officialUrl:null,evidence:[]}]),{now});
 assert.equal(r.candidates[0].status,'por_verificar');
});
test('Fecha vencida queda caducada',()=>{
 const r=inspectRadarBatch(batch([{...event,date:'2026-11-05'}]),{now});
 assert.equal(r.candidates[0].status,'caducado');
});
test('Rechaza fecha imposible sin convertir silenciosamente',()=>{
 const r=inspectRadarBatch(batch([{...event,date:'2026-02-30'}]),{now});
 assert.equal(r.accepted,0);assert.match(r.rejected[0].issues[0],/Fecha/);
});
test('Rechaza URL insegura y categoría desconocida',()=>{
 const r=inspectRadarBatch(batch([{...event,sourceUrl:'javascript:alert(1)',category:'Desconocida'}]),{now});
 assert.equal(r.accepted,0);assert.equal(r.rejected[0].issues.length,2);
});
test('No publica datos de ejemplo aunque estén completos',()=>{
 const r=inspectRadarBatch(batch([event,event]),{now});
 assert.equal(r.accepted,1);assert.equal(r.rejectedCount,1);
});
test('Acepta un lote vacío sin declarar falta de eventos como cancelación',()=>{
 const r=inspectRadarBatch(batch([]),{now});
 assert.equal(r.accepted,0);assert.equal(r.automaticPublication,false);
});
test('Rechaza estructura de entrada incompatible',()=>{
 assert.throws(()=>inspectRadarBatch({schemaVersion:2,origin:'chatgpt-radar-onda',events:[]},{now}),/Esquema/);
});
