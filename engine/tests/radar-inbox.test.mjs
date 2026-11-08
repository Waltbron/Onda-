import test from 'node:test';
import assert from 'node:assert/strict';
import {triageRadar,clean,urlKey} from '../../scripts/radar-inbox.mjs';
const now=new Date('2026-11-08T12:00:00.000Z');
const base={candidate_id:'radar-12345678',source_name:'Teatro prueba',source_url:'https://teatro.example/events/obra-01?utm_source=ig',source_kind:'official',title:'Función de prueba',date:'2026-12-11',time:'19:00',city:'Maldonado',category:'Cultura',observed_at:'2026-11-08T12:00:00Z',verification_status:'verified',evidence:[{url:'https://teatro.example/events/obra-01',assertion:'fecha de función 11 diciembre 2026'}]};
test('fuente verificada es candidata a revisión y no publicación automática',()=>{const r=triageRadar([base],[],now);assert.equal(r.results[0].decision,'ready_for_review');assert.equal(r.published,0)});
test('evento sin fecha entra a revisión, no se inventa fecha',()=>{const r=triageRadar([{...base,date:null}],[],now);assert.equal(r.results[0].decision,'needs_review')});
test('agregadora es pista no lista para incorporación',()=>{const r=triageRadar([{...base,source_kind:'aggregator'}],[],now);assert.equal(r.results[0].decision,'needs_review')});
test('duplicado por URL canónica',()=>{const existing=[{id:'manual-10',sourceUrl:'https://teatro.example/events/obra-01',title:'Otro',date:'2026-12-11',city:'Maldonado'}];const r=triageRadar([base],existing,now);assert.equal(r.results[0].decision,'possible_duplicate')});
test('duplicado probable por título+fecha+ciudad',()=>{const existing=[{id:'manual-11',sourceUrl:'https://otro.example/obra',title:'Función de prueba',date:'2026-12-11',city:'Maldonado'}];const r=triageRadar([base],existing,now);assert.equal(r.results[0].decision,'possible_duplicate')});
test('no publica eventos vencidos',()=>{const r=triageRadar([{...base,date:'2026-09-01'}],[],now);assert.equal(r.results[0].decision,'expired')});
test('rechaza fechas imposibles',()=>{const r=triageRadar([{...base,date:'2026-02-30'}],[],now);assert.equal(r.results[0].decision,'invalid')});
test('nunca interpreta la desaparición como cancelación',()=>{const r=triageRadar([],[],now);assert.equal(r.published,0);assert.equal(r.results.length,0)});
test('rechaza URLs inseguras',()=>{const r=triageRadar([{...base,source_url:'http://example.org'}],[],now);assert.equal(r.results[0].decision,'invalid')});
test('normalización estable',()=>{assert.equal(clean(' José  Ignacio '),'jose ignacio');assert.equal(urlKey(base.source_url),'teatro.example/events/obra-01')});

test('localidad nueva pasa a revisión, no se descarta silenciosamente',()=>{const r=triageRadar([{...base,city:'La Capuera'}],[],now);assert.equal(r.results[0].decision,'needs_review')});
