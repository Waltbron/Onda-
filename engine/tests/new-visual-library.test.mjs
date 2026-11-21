import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const ctx={};ctx.globalThis=ctx;
for(const f of ['visual-selector.js','visuals.js'])runInNewContext(readFileSync(new URL('../../site/'+f,import.meta.url),'utf8'),ctx);
const V=ctx.ONDAVisuals,select=ctx.ONDAVisual.select;
const events=JSON.parse(readFileSync(new URL('../../site/data/events.json',import.meta.url),'utf8'));
const e=(title,category='Cultura',place='Museo MACA',tags=[])=>({id:title,title,category,place,city:'Maldonado',tags,description:''});
test('37 ilustraciones aprobadas con permisos de uso evento, experiencia o ambos',()=>{
 assert.equal(V.catalog.length,37);
 assert.equal(new Set(Array.from(V.catalog.map(x=>x.id))).size,37);
 assert.ok(V.catalog.every(x=>['evento','experiencia','ambos'].includes(x.usage)));
 for(const x of V.catalog)assert.ok(existsSync(new URL('../../site/'+x.src.slice(2),import.meta.url)));
});
test('cine no es teatro MACA, teatro fuera de MACA no usa esa sede',()=>{
 assert.equal(select(e('Cine MACA · Cortos para infancias')).id,'onda_evento_cine_proyeccion_generica_01');
 assert.equal(select(e('El coleccionista de cuentos · Teatro MACA')).id,'onda_cultura_teatro_maca_funcion_01');
 assert.notEqual(select(e('Obra teatral','Cultura','Teatro de San Carlos')).id,'onda_cultura_teatro_maca_funcion_01');
});
test('ilustraciones concretas para ballet, jazz, charla, running',()=>{
 assert.equal(select(e('Clase abierta de ballet y masterclass')).id,'onda_evento_ballet_danza_clase_01');
 assert.equal(select(e('Más que Jazz · Las Rodetts','Música')).id,'onda_evento_jazz_ensamble_vivo_01');
 assert.equal(select(e('Charla y conferencia cultural')).id,'onda_evento_charla_conferencia_generica_01');
 assert.equal(select(e('INJU5K Piriápolis','Deporte','Plaza Artigas',['running'])).id,'onda_evento_running_carrera_popular_01');
});
test('evita imágenes engañosas: guitarra no es chelo; monumento no es paella, triatlón no es running',()=>{
 assert.equal(select(e('Festival de Guitarra','Música','Maldonado')).scope,'identidad');
 assert.equal(select(e('Inauguración del monumento a Capital Nacional de la Paella','Cultura','Rambla de Piriápolis')).scope,'identidad');
 assert.equal(select(e('IRONMAN 70.3 Punta del Este','Deporte','Punta del Este',['triatlon'])).scope,'identidad');
 assert.equal(select(e('Tour de San Carlos','Deporte','San Carlos',['ciclismo'])).scope,'identidad');
});
test('reutilización semántica y separación entre vecinos en vez de exclusividad total',()=>{
 const jazz=i=>({...e('Concierto de jazz','Música'),id:'jazz-'+i});
 const running={...e('Carrera 5K','Deporte','Maldonado',['running']),id:'running'};
 const out=V.allocate([jazz(1),jazz(2),running,jazz(3),jazz(1)],{columns:1});
 assert.equal(out.size,4);
 assert.equal(out.get('jazz-1').id,'onda_evento_jazz_ensamble_vivo_01');
 assert.equal(out.get('jazz-3').id,'onda_evento_jazz_ensamble_vivo_01');
 assert.notEqual(out.get('jazz-1').id,out.get('jazz-2').id);
 assert.equal(out.get('jazz-2').scope,'identidad');
});
test('cada evento del catálogo obtiene imagen compatible real o portada editorial sin archivo falso',()=>{
 assert.ok(events.length>=79);
 for(const x of V.allocate(events).values()){
  assert.ok(x);
  if(x.src){assert.ok(existsSync(new URL('../../site/'+x.src.slice(2),import.meta.url)));assert.notEqual(x.usage,'experiencia')}
  else {assert.equal(x.scope,'identidad');assert.ok(x.variant);}
 }
});
test('experiencias todavía sin relatos editoriales no aparecen en la página pública',()=>{
 const html=readFileSync(new URL('../../site/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../../site/app.js',import.meta.url),'utf8');
 assert.ok(!html.includes('id="vivencias"'));
 assert.ok(!html.includes('id="storyGrid"'));
 assert.ok(!html.includes('href="#vivencias"'));
 assert.ok(!app.includes('renderVisualStories'));
 assert.match(app,/activeVisualPlan/);
});
