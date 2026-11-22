import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const vm={};vm.globalThis=vm;
for(const file of ['format-registry.js','visual-selector.js','visuals.js'])runInNewContext(readFileSync(new URL('../../site/'+file,import.meta.url),'utf8'),vm);
const F=vm.ONDAFormats,V=vm.ONDAVisuals;
const events=JSON.parse(readFileSync(new URL('../../site/data/events.json',import.meta.url),'utf8'));
const find=term=>events.find(x=>x.title.toLowerCase().includes(term.toLowerCase()));
test('el registro contiene claves únicas y artes portables aprobados con archivo real',()=>{
 const ids=F.rules.map(r=>r.id);
 assert.equal(new Set(ids).size,ids.length);
 for(const r of F.rules){
  if(!r.asset)continue;
  assert.ok(V.catalog.some(a=>a.id===r.asset),'arte registrado '+r.asset);
  assert.ok(existsSync(new URL('../../site/assets/editorial/'+r.asset+'.webp',import.meta.url)));
 }
});
test('los formatos diferencian jam, jazz, rock, teatro, cine y literatura',()=>{
 assert.equal(F.classify(find('Narakan Jam'))?.id,'jam_session');
 assert.equal(F.classify(find('Más que jazz'))?.id,'jazz_en_vivo');
 assert.equal(F.classify(find('Hilda Lizarazu'))?.id,'concierto_rock_pop');
 assert.equal(F.classify(find('El coleccionista de cuentos'))?.id,'teatro_funcion');
 assert.equal(F.classify(find('Cine MACA · Cortos'))?.id,'cine_proyeccion');
 assert.equal(F.classify(find('Euforia del Libro'))?.id,'feria_literaria');
});
test('triatlón no usa running; formato desconocido no inventa imagen',()=>{
 const tri={id:'t',title:'IRONMAN 70.3 Punta del Este',category:'Deporte',description:'Triatlón running',tags:['running','triatlon']};
 assert.equal(F.classify(tri)?.id,'triatlon');
 assert.equal(V.forEvent(tri).scope,'identidad');
 assert.equal(F.classify({title:'Festival de guitarra',category:'Música',description:'',tags:[]}),null);
});
test('format_id explícito validado por categoría tiene prioridad',()=>{
 const x={title:'Evento sin pistas',category:'Cultura',format_id:'cine_proyeccion'};
 assert.equal(F.classify(x)?.id,'cine_proyeccion');
 assert.equal(F.classify({...x,category:'Música'}),null);
});
test('no se muestra arte de presentación en una feria literaria',()=>{
 const e=find('Euforia del Libro');
 assert.equal(F.classify(e)?.id,'feria_literaria');
 assert.equal(V.forEvent(e).scope,'identidad');
});
test('el selector consume registro y la interfaz distingue categoría y formato',()=>{
 const s=readFileSync(new URL('../../site/visual-selector.js',import.meta.url),'utf8');
 const a=readFileSync(new URL('../../site/app.js',import.meta.url),'utf8');
 assert.match(s,/ONDAFormats\?\.candidates/);
 assert.match(a,/formatChip\(e\)/);
 assert.match(a,/FMT\?\.classify\(e\)/);
});
