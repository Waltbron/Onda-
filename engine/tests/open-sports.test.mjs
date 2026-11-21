import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSportsYaml,sportsCandidate,selectSportsFiles,fetchOpenSports} from '../src/open-sports.mjs';
const source={id:'events-uy-deportes',name:'events.uy contributors',url:'https://github.com/suzrik/data.events.uy',expectedHost:'github.com'};
const file={path:'events/2027/gfny-punta-del-este.yaml',content: [
  'name: GFNY Punta del Este','date: 2027-03-14','sport: road','city: Punta del Este','venue: Rambla','distances: [146 km, 86 km]',
  'links:','  site: https://puntadeleste.gfny.com/','  register: https://puntadeleste.gfny.com/register/',
  'description:','  es: Carrera deportiva.'].join('\n')};
test('parsea campos YAML de fuente abierta sin ejecutar instrucciones',()=>{
 const p=parseSportsYaml(file.content);assert.equal(p.city,'Punta del Este');assert.equal(p.links.register,'https://puntadeleste.gfny.com/register/');
});
test('publica solo fecha completa y confirmada, conserva atribución y organizador',()=>{
 const c=sportsCandidate(file,source,'2026-11-21T21:00:00Z');assert.equal(c.category,'Deporte');
 assert.equal(c.date,'2027-03-14');assert.ok(c.tags.includes('ciclismo'));assert.equal(c.confidence,'B');
 assert.ok(c.sourceUrl.includes('github.com/suzrik'));assert.ok(c.ticketUrl.includes('/register/'));
});
test('fecha imprecisa, ciudad extraña y fecha tentativa quedan excluidas',()=>{
 assert.equal(sportsCandidate({...file,content:file.content.replace('2027-03-14','2027-03')},source,'2026-11-21T21:00:00Z'),null);
 assert.equal(sportsCandidate({...file,content:file.content+'\nstatus: tentative'},source,'2026-11-21T21:00:00Z'),null);
 assert.equal(sportsCandidate({...file,content:file.content.replace('Punta del Este','Montevideo')},source,'2026-11-21T21:00:00Z'),null);
});
test('acota rutas a zonas y años seleccionados; no recorre todo Uruguay',()=>{
 const t={tree:[{path:file.path,type:'blob',sha:'a'.repeat(40)},{path:'events/2027/montevideo.yaml',type:'blob',sha:'b'.repeat(40)},{path:'events/2025/piriapolis.yaml',type:'blob',sha:'c'.repeat(40)}]};
 assert.equal(selectSportsFiles(t,'2026-11-21T21:00:00Z').length,1);
});
test('prueba integración de lectura API sin red; no publica por sí misma',async()=>{
 const sha='a'.repeat(40),tree={truncated:false,tree:[{path:file.path,sha,type:'blob'}]};
 const encoded=Buffer.from(file.content).toString('base64');
 const mock=async url=>({ok:true,text:async()=>JSON.stringify(url.includes('/trees/')?tree:{encoding:'base64',size:file.content.length,content:encoded})});
 const r=await fetchOpenSports(source,{},mock,'2026-11-21T21:00:00Z');
 assert.equal(r.ok,true);assert.equal(r.candidates.length,1);assert.equal(r.candidates[0].sourceVerification,'upstream-reviewed-cc-by-4.0');
});
test('error de API degrada fuente y no publica un catálogo nuevo',async()=>{
 const r=await fetchOpenSports(source,{},async()=>({ok:false,status:403}),'2026-11-21T21:00:00Z');
 assert.equal(r.ok,false);assert.equal(r.candidates,undefined);
});
