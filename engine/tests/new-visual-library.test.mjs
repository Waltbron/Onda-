import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const ctx={};ctx.globalThis=ctx;
runInNewContext(readFileSync(new URL('../../site/visuals.js',import.meta.url),'utf8'),ctx);
const visuals=ctx.ONDAVisuals;
const events=JSON.parse(readFileSync(new URL('../../site/data/events.json',import.meta.url),'utf8'));
const expected=[
  'onda_musica_sunset_casapueblo_publico_01',
  'onda_musica_recital_plaza_san_carlos_01',
  'onda_cultura_teatro_maca_funcion_01',
  'onda_gastronomia_feria_rambla_piriapolis_01',
  'onda_gastronomia_paella_gigante_piriapolis_01',
  'onda_musica_arboretum_lussich_intimo_01',
  'onda_cultura_feria_libro_paseo_san_fernando_01',
  'onda_cultura_feria_rural_pueblo_gaucho_01',
  'onda_lifestyle_patio_nocturno_la_barra_01',
  'onda_lifestyle_paseo_jose_ignacio_01'
];
test('galería usa exactamente diez obras nuevas aprobadas, ninguna vieja',()=>{
 assert.deepEqual(Array.from(visuals.catalog.map(x=>x.id)),expected);
});
test('todas las fichas de la agenda tienen arte nuevo existente en sitio, sin blancos ni viejos',()=>{
 for(const e of events){const v=visuals.forEvent(e);assert.ok(expected.includes(v.id),e.id+': '+v.id);const file=new URL('../../site/'+v.src.slice(2),import.meta.url);assert.ok(readFileSync(file).length>30000,v.id);}
});
test('una conferencia en Maldonado no se ilustra como teatro MACA real',()=>{
 const v=visuals.forEvent({category:'Cultura',title:'Jornada de ciencia',place:'Sala de encuentros',city:'Maldonado'});
 assert.equal(v.contextual,false);
});
test('teatro MACA sí utiliza nueva ilustración de función MACA',()=>{
 const v=visuals.forEvent({category:'Cultura',title:'Obra teatral de invierno',place:'Teatro MACA',city:'Manantiales'});
 assert.equal(v.id,'onda_cultura_teatro_maca_funcion_01');
 assert.equal(v.contextual,true);
});
test('un recital de Maldonado usa una imagen ilustrativa, nunca se presenta como imagen del evento',()=>{
 const v=visuals.forEvent({category:'Música',title:'Recital de rock',place:'Sala Maldonado',city:'Maldonado'});
 assert.equal(v.contextual,false);
 assert.match(v.caption,/no foto del evento/);
});
test('fuente del sitio carga catálogo visual antes de la app y galería no promete 25 escenas',()=>{
 const html=readFileSync(new URL('../../site/index.html',import.meta.url),'utf8');
 assert.ok(html.indexOf('visuals.js')<html.indexOf('app.js'));
 assert.match(html,/10 ilustraciones nuevas/);
 assert.ok(!html.includes('25 escenas ilustradas'));
});
