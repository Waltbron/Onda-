import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateRadarInboxes} from '../src/radar-review.mjs';
const now='2026-11-08T12:30:00Z';
const lead=(extra={})=>({key:'festival-a-2027',title:'Festival de prueba A',date:'2027-01-08',city:'Punta del Este',category:'Fiestas',sourceUrl:'https://tickets.example.org/onda-a',verificationStatus:'descubierto',publicationAllowed:false,...extra});
const batch=(candidates=[lead()])=>({file:'inbox-2026-11-08.json',data:{schemaVersion:'1.0',ingestionStatus:'review-only',published:false,candidates}});
const run=(inboxes=[batch()],opts={})=>evaluateRadarInboxes({inboxes,now,...opts});
test('descubrimiento termina sólo en bandeja de revisión, nunca en publicación',()=>{
 const r=run();assert.equal(r.mode,'review-only');assert.equal(r.published,false);assert.equal(r.pending,1);assert.equal(r.total,1);
});
test('candidato sin fuente HTTPS no es aceptado',()=>{
 const r=run([batch([lead({sourceUrl:'http://not-secure.example.org/a'})])]);assert.equal(r.invalid,1);assert.equal(r.total,0);
});
test('fecha imposible se rechaza, no se transforma',()=>{
 const r=run([batch([lead({date:'2027-02-30'})])]);assert.equal(r.invalid,1);assert.equal(r.total,0);
});
test('fecha anterior a hoy se marca vencida sin publicarla',()=>{
 const r=run([batch([lead({date:'2026-01-01'})])]);assert.equal(r.expired,1);assert.equal(r.published,false);
});
test('detecta posible duplicado con el catálogo manual',()=>{
 const manual=[{title:'Festival de prueba A',date:'2027-01-08',city:'Punta del Este'}];
 const r=run(undefined,{manual});assert.equal(r.possibleDuplicates,1);assert.equal(r.pending,0);
});
test('deduplica dos señales del mismo enlace y fecha',()=>{
 const r=run([batch([lead(),lead({key:'festival-b-2027'})])]);assert.equal(r.possibleDuplicates,1);
});
test('bandeja que intenta autopublicar queda bloqueada',()=>{
 const b=batch();b.data.published=true;const r=run([b]);assert.equal(r.invalid,1);assert.equal(r.total,0);
});
test('candidato que intenta declarar publicación autorizada se rechaza',()=>{
 const r=run([batch([lead({publicationAllowed:true})])]);assert.equal(r.invalid,1);assert.equal(r.total,0);
});
