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
 assert.equal(select(e('Festival de Guitarra','Música','Maldonado')).scope,'editorial');
 assert.equal(select(e('Inauguración del monumento a Capital Nacional de la Paella','Cultura','Rambla de Piriápolis')).scope,'editorial');
 assert.equal(select(e('IRONMAN 70.3 Punta del Este','Deporte','Punta del Este',['triatlon'])).scope,'editorial');
 assert.equal(select(e('Tour de San Carlos','Deporte','San Carlos',['ciclismo'])).scope,'editorial');
});
test('ningún par de eventos distintos visibles comparte recurso; el mismo evento se reutiliza',()=>{
 const a={...e('Festival de jazz','Música'),id:'uno'};
 const b={...e('Concierto de jazz','Música'),id:'dos'};
 const c={...e('Carrera 5K','Deporte','Maldonado',['running']),id:'tres'};
 const out=V.allocate([a,b,c,a]);
 assert.equal(out.size,3);
 const ids=Array.from(out.values()).filter(x=>x.id).map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
 assert.ok(out.get('uno').scope==='editorial'||out.get('dos').scope==='editorial');
});
test('cada evento del catálogo obtiene imagen compatible real o portada editorial sin archivo falso',()=>{
 assert.ok(events.length>=79);
 for(const x of V.allocate(events).values()){
  assert.ok(x);
  if(x.src){assert.ok(existsSync(new URL('../../site/'+x.src.slice(2),import.meta.url)));assert.notEqual(x.usage,'experiencia')}
  else assert.equal(x.scope,'editorial');
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
