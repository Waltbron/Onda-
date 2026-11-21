import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyRadarLead} from '../src/radar-taxonomy.mjs';
import {evaluateRadarInboxes} from '../src/radar-review.mjs';
const lead=(patch={})=>({
  key:'original-01', title:'Portal Jam con música en vivo',date:'2026-12-05',
  city:'Punta del Este',venue:'Portal Bosque',category:'Música',
  sourceUrl:'https://portalbosque.com/eventos/jam',verificationStatus:'descubierto',
  publicationAllowed:false,...patch
});
const batch=(file,candidates)=>({file,data:{schemaVersion:'1.0',ingestionStatus:'review-only',published:false,candidates}});
test('clasifica ticketera y etiquetas sin inferir costo ni permiso',()=>{
  const x=classifyRadarLead(lead());
  assert.equal(x.ticketera,'Portal Bosque');
  assert.equal(x.sourceType,'ticketera');
  assert.ok(x.tags.includes('musica-en-vivo'));
  assert.equal(x.price,undefined);
});
test('diferentes URL con mismo título, fecha y ciudad quedan como posible duplicado',()=>{
  const a=batch('a.json',[lead()]);
  const b=batch('b.json',[lead({key:'alternativo-02',sourceUrl:'https://redtickets.uy/evento/otro',venue:'Otro escenario'})]);
  const r=evaluateRadarInboxes({inboxes:[a,b],now:'2026-11-21T21:00:00Z'});
  assert.equal(r.pending,1);
  assert.equal(r.possibleDuplicates,1);
  assert.equal(r.published,false);
  assert.equal(r.leads[1].ticketera,'RedTickets');
});
test('mismo enlace y fecha con título ligeramente diferente al catálogo queda para revisar',()=>{
  const url='https://portalbosque.com/eventos/jam';
  const r=evaluateRadarInboxes({inboxes:[batch('a.json',[lead({title:'Jam con músicos invitados'})])],
    manual:[{title:'Portal Jam',date:'2026-12-05',city:'Punta del Este',sourceUrl:url}],now:'2026-11-21T21:00:00Z'});
  assert.equal(r.possibleDuplicates,1);
});
test('fechas diferentes no colisionan por compartir URL',()=>{
  const r=evaluateRadarInboxes({inboxes:[batch('a.json',[lead(),lead({key:'repeticion-02',date:'2026-12-06'})])],now:'2026-11-21T21:00:00Z'});
  assert.equal(r.pending,2);
});
