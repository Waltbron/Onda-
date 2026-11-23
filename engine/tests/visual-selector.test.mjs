import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const ctx={};ctx.globalThis=ctx;
for(const f of ['format-registry.js','visual-selector.js','visuals.js'])runInNewContext(readFileSync(new URL('../../site/'+f,import.meta.url),'utf8'),ctx);
const V=ctx.ONDAVisuals,select=ctx.ONDAVisual.select;
const events=JSON.parse(readFileSync(new URL('../../site/data/events.json',import.meta.url),'utf8'));
const e=(title,category='Cultura',place='Museo MACA',tags=[])=>({id:title,title,category,place,city:'Maldonado',tags,description:''});
test('48 ilustraciones aprobadas con permisos de uso evento, experiencia o ambos',()=>{
 assert.equal(V.catalog.length,48);
 assert.equal(new Set(Array.from(V.catalog.map(x=>x.id))).size,48);
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
 assert.equal(select(e('IRONMAN 70.3 Punta del Este','Deporte','Punta del Este',['triatlon'])).id,'onda_deporte_triatlon_costero_mansa_01');
 assert.equal(select(e('Tour de San Carlos','Deporte','San Carlos',['ciclismo'])).scope,'identidad');
});

test('reutiliza imágenes pertinentes lejos y separa vecinos inmediatos',()=>{
 const jazz=i=>({...e('Concierto de jazz','Música'),id:'jazz-'+i});
 const out=V.allocate([jazz(1),jazz(2),jazz(3),jazz(4),jazz(1)],{columns:1});
 assert.equal(out.size,4);
 assert.equal(out.get('jazz-1').id,'onda_evento_jazz_ensamble_vivo_01');
 assert.notEqual(out.get('jazz-1').id,out.get('jazz-2').id);
 assert.equal(out.get('jazz-3').id,'onda_evento_jazz_ensamble_vivo_01');
});
test('evita repeticiones contiguas en móvil, tablet y escritorio y no inventa actividades',()=>{
 for(const cols of [1,2,3]){
  const es=Array.from({length:21},(_,i)=>({...e('Concierto de jazz','Música'),id:'jazz-'+i}));
  const out=V.allocate(es,{columns:cols});
  for(let i=0;i<es.length;i++){
   const visual=out.get(es[i].id);
   assert.ok(visual.id==='onda_evento_jazz_ensamble_vivo_01'||visual.scope==='identidad');
   if(i%cols!==0)assert.notEqual(visual.id,out.get(es[i-1].id).id);
   if(i>=cols)assert.notEqual(visual.id,out.get(es[i-cols].id).id);
  }
  const again=V.allocate(es,{columns:cols});
  for(const x of es)assert.equal(out.get(x.id).id,again.get(x.id).id);
 }
});
test('cada evento del catálogo obtiene imagen compatible real o portada editorial sin archivo falso',()=>{
 assert.ok(events.length>=79);
 for(const x of V.allocate(events).values()){
  assert.ok(x);
  if(x.src){assert.ok(existsSync(new URL('../../site/'+x.src.slice(2),import.meta.url)));assert.notEqual(x.usage,'experiencia')}
  else assert.equal(x.scope,'identidad');
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

test('las tres identidades serigráficas aprobadas están disponibles como WebP de reserva',()=>{
 const names=['onda_fallback_serigrafia_01_azul_naranja','onda_fallback_serigrafia_02_fucsia_naranja','onda_fallback_serigrafia_03_lima_violeta'];
 const seen=new Set();
 for(let i=0;i<150;i++){
  const img=select({...e('Actividad sin portada','Música','Lugar ficticio'),id:'unknown-'+i});
  assert.equal(img.scope,'identidad');
  assert.ok(names.includes(img.id),img.id);
  assert.ok(existsSync(new URL('../../site/'+img.src.slice(2),import.meta.url)));
  seen.add(img.id);
 }
 assert.equal(seen.size,3);
});

test('ONDA Lab v5: 11 nuevas aprobadas y archivos WebP en ruta local',()=>{
 const newIds=["onda_deporte_running_costero_brava_01","onda_deporte_triatlon_costero_mansa_01","onda_deporte_ciclismo_ruta_piriapolis_01","onda_deporte_trail_running_sierras_animas_01","onda_deporte_surf_montoya_maniobra_01","onda_deporte_beach_volley_playa_mansa_01","onda_deporte_natacion_aguas_abiertas_01","onda_musica_narakan_jam_01","onda_musica_concierto_vocal_femenina_01","onda_cultura_exposicion_pintura_sala_historica_01","onda_musica_ensamble_guitarra_clasica_01"];
 assert.equal(new Set(newIds).size,11);
 for(const id of newIds){const image=V.catalog.find(x=>x.id===id);assert.ok(image,'Falta '+id);assert.ok(existsSync(new URL('../../site/'+image.src.slice(2),import.meta.url)),id);}
});
test('ONDA Lab v5: formatos y lugares realmente compatibles',()=>{
 const byId=id=>events.find(e=>e.id===id);
 assert.equal(select(byId('idm-exposicion-la-luz-guillermo-molina-2026')).id,'onda_cultura_exposicion_pintura_sala_historica_01');
 assert.equal(select(byId('idm-festival-guitarra-maldonado-20261126')).id,'onda_musica_ensamble_guitarra_clasica_01');
 assert.equal(select(byId('redtickets-narakan-jam-20261122')).id,'onda_musica_narakan_jam_01');
 assert.equal(select(byId('redtickets-hilda-lizarazu-maldonado-20261122')).id,'onda_musica_concierto_vocal_femenina_01');
 assert.equal(select(byId('onda-8dc5567306f788a9')).id,'onda_deporte_triatlon_costero_mansa_01');
 for(const id of ['onda-cda7024816bea191','onda-e72aa28a719596dd','onda-58e70b8640621f8f'])
  assert.equal(select(byId(id)).id,'onda_deporte_natacion_aguas_abiertas_01');
 assert.equal(select(byId('onda-10df1fdc7203c9ab')).scope,'identidad','Piriápolis no usa imagen de Punta del Este');
 assert.equal(select(byId('onda-8e4ce3fed1ceab93')).scope,'identidad','San Carlos no usa imagen del Cerro San Antonio');
 assert.equal(select(byId('cordera-caravana-magica-maldonado-20261128')).scope,'identidad','No usar cantante femenina para Cordera');
 assert.equal(select(e('Festival de guitarra eléctrica','Música','Sala Maldonado')).scope,'identidad','No confundir guitarra clásica con eléctrica');
});
test('ONDA Lab v5: menos fallback en agenda vigente y sin repetición de vecinos',()=>{
 const future=events.filter(e=>(e.endDate||e.date)>='2026-11-22'&&!['cancelado','finalizado','retirado'].includes(e.status)).sort((a,b)=>a.date.localeCompare(b.date)||String(a.time||'').localeCompare(String(b.time||'')));
 assert.equal(future.length,32);
 for(const columns of [1,2,3]){
  const selected=V.allocate(future,{columns});
  const count=[...selected.values()].filter(v=>v.scope==='identidad').length;
  assert.ok(count<=14,'fallbacks restantes en '+columns+' columnas: '+count);
  for(let i=0;i<future.length;i++){
   const image=selected.get(future[i].id);
   if(i%columns!==0)assert.notEqual(image.id,selected.get(future[i-1].id).id);
   if(i>=columns)assert.notEqual(image.id,selected.get(future[i-columns].id).id);
  }
 }
});

test('orden de imágenes: foto autorizada, ilustración aprobada, fallback',()=>{
 const x={...e('Concierto de jazz','Música','Medio y Medio'),
  imageUrl:'https://cdn.example.org/jazz.webp',imageAlt:'Retrato real',
  imageCredit:'Fotógrafo',imageSourceUrl:'https://example.org/permiso',imageRightsStatus:'authorized',imageType:'photo'};
 assert.equal(select(x).scope,'foto');
 assert.equal(V.allocate([x]).get(x.id).scope,'foto');
 assert.equal(select({...x,imageRightsStatus:'pending'}).id,'onda_evento_jazz_ensamble_vivo_01');
 assert.equal(select(e('Actividad sin portada','Música','Sede sin escena')).scope,'identidad');
});
test('no se autoriza fotografía sin crédito, origen, permiso o HTTPS',()=>{
 const x={...e('Jazz','Música','Medio y Medio'),imageUrl:'https://cdn.example.org/jazz.webp',
 imageAlt:'Retrato',imageCredit:'Autora',imageSourceUrl:'https://example.org/origen',imageRightsStatus:'licensed'};
 for(const patch of [{imageRightsStatus:'pending'},{imageCredit:''},{imageAlt:''},{imageSourceUrl:''},
  {imageUrl:'javascript:alert(1)'},{imageUrl:'http://inseguro.test/foto.jpg'},
  {imageUrl:'https://evil.test/a.jpg" onerror="alert(1)'},{imageType:'poster'}])
  assert.equal(ctx.ONDAVisual.photo({...x,...patch}),null,JSON.stringify(patch));
 assert.equal(ctx.ONDAVisual.photo(x)?.scope,'foto');
});
test('filtro nativo, etiqueta, crédito y respaldo secuencial en tarjetas y modal',()=>{
 const app=readFileSync(new URL('../../site/app.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../../site/styles.css',import.meta.url),'utf8');
 assert.match(app,/data-fallback-src/);assert.match(app,/data-final-src/);
 assert.match(app,/backupStage/);assert.match(app,/modal-visual.*has-photo/);
 assert.match(css,/--onda-foto-saturacion/);assert.match(css,/\.rec-poster\.has-photo/);
 assert.match(css,/\.event-visual\.has-photo/);assert.match(css,/\.modal-visual\.has-photo/);
});
