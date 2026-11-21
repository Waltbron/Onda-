import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const ctx={};ctx.globalThis=ctx;
runInNewContext(readFileSync(new URL('../../site/visual-selector.js',import.meta.url),'utf8'),ctx);
const select=ctx.ONDAVisual.select;
function event(title,category='Cultura',place='Museo MACA',tags=[],description=''){return {title,category,place,city:'Maldonado',tags,description};}
test('cine documental usa la nueva portada aprobada, sin confundir con teatro MACA',()=>{const r=select(event('Cine MACA · Cortos para infancias'));assert.equal(r.id,'onda_evento_cine_proyeccion_generica_01');assert.equal(r.scope,'formato');});
test('portadas nuevas diferenciadas para danza, jazz, charla y running',()=>{
 assert.equal(select(event('Clase abierta de ballet y masterclass')).id,'onda_evento_ballet_danza_clase_01');
 assert.equal(select(event('Más que Jazz · Las Rodetts','Música')).id,'onda_evento_jazz_ensamble_vivo_01');
 assert.equal(select(event('Charla y conferencia cultural')).id,'onda_evento_charla_conferencia_generica_01');
 assert.equal(select(event('INJU5K Piriápolis','Deporte','Plaza Artigas',['running'])).id,'onda_evento_running_carrera_popular_01');
});
test('la nueva presentación literaria no se aplica a una función teatral de cuentos',()=>{
 assert.equal(select(event('Presentación de libro con autor')).id,'onda_evento_presentacion_libro_autor_01');
 assert.equal(select(event('El coleccionista de cuentos · Teatro MACA')).id,'onda_cultura_teatro_maca_funcion_01');
});
test('distingue ciclismo de running y representación parcial de triatlón',()=>{
 assert.equal(select(event('Tour de San Carlos','Deporte','San Carlos',['ciclismo'])).id,'onda_naturaleza_bicicleta_sendero_lussich_01');
 const t=select(event('IRONMAN 70.3 Punta del Este','Deporte','Punta del Este',['triatlon']));assert.equal(t.scope,'ambiente');assert.match(t.about,/disciplina/);
});
test('guitarra no se representa con chelo y piano ni el monumento como cocina paella',()=>{
 const g=select(event('Festival internacional de Guitarra','Música','Maldonado'));assert.equal(g.scope,'ambiente');assert.ok(!/camara_chelo/.test(g.id));
 const p=select(event('Inauguración del monumento a Capital Nacional de la Paella','Cultura','Rambla de Piriápolis'));assert.equal(p.scope,'ambiente');assert.ok(!/paella_gigante/.test(p.id));
});
test('todo el catálogo tiene imagen aprobada física, jamás WebP genérico descartado',()=>{
 const catalog=JSON.parse(readFileSync(new URL('../../site/data/events.json',import.meta.url)));
 assert.ok(catalog.length>=70);
 for(const e of catalog){const a=select(e);assert.ok(a.src);assert.ok(existsSync(new URL('../../site/'+a.src.replace('./',''),import.meta.url)),e.id+' no tiene WebP');assert.ok(!/\/onda_(musica_0[1-4]|gastronomia_0[3-6]|arte_cultura_0[1-4])\.webp$/.test(a.src),e.id+' usa un recurso genérico antiguo');}
});
