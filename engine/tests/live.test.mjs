import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fetchSource} from '../src/live.mjs';
const html=fs.readFileSync(new URL('../fixtures/maca-jsonld-ejemplo.html',import.meta.url),'utf8');
const source={id:'maca-agenda',name:'MACA · Agenda pública',url:'https://macamuseo.org/eventosmaca',city:'Manantiales',expectedHost:'macamuseo.org',adapter:'jsonld-event-html',enabled:true,permission:'approved',permissionEvidence:'Conformidad revisión 2026-10-15 (sólo fixture de prueba)',publicationPolicy:'review'};
const env={ONDA_CONTACT_EMAIL:'test@ejemplo.uy'};
async function mockFetch(impl, callback){const before=globalThis.fetch;globalThis.fetch=impl;try{return await callback()}finally{globalThis.fetch=before}}
test('no hace ninguna solicitud sin permiso aprobado',async()=>{let called=false;const got=await mockFetch(()=>{called=true;throw Error('No')},()=>fetchSource({...source,permission:'pending'},env));assert.equal(got.ok,false);assert.equal(called,false)});
test('no hace ninguna solicitud sin evidencia de permiso',async()=>{let called=false;const got=await mockFetch(()=>{called=true;throw Error('No')},()=>fetchSource({...source,permissionEvidence:null},env));assert.equal(got.ok,false);assert.equal(called,false)});
test('robots prohibido impide la segunda solicitud',async()=>{let calls=0;const got=await mockFetch(async()=>{calls++;return new Response('User-agent: *\nDisallow: /eventosmaca',{status:200})},()=>fetchSource(source,env));assert.equal(got.ok,false);assert.equal(calls,1)});
test('simula captura HTTP autorizada y parser JSON-LD',async()=>{let calls=[];const got=await mockFetch(async(url)=>{calls.push(url);return new Response(url.endsWith('robots.txt')?'User-agent: *\nAllow: /eventosmaca':html,{status:200})},()=>fetchSource(source,env));assert.equal(got.ok,true);assert.equal(got.candidates.length,2);assert.equal(calls.length,2);assert.ok(calls.every(u=>new URL(u).hostname==='macamuseo.org'))});
test('no acepta redirección de la fuente',async()=>{const got=await mockFetch(async()=>new Response('Redirect',{status:302}),()=>fetchSource(source,env));assert.equal(got.ok,false)});
test('un conector cuyo host se modificó fuera del dominio aprobado no consulta web',async()=>{let called=false;const got=await mockFetch(()=>{called=true;throw Error('No')},()=>fetchSource({...source,url:'https://evil.example/events'},env));assert.equal(got.ok,false);assert.equal(called,false)});
const ldPage=(n,d)=>`<html><script type="application/ld+json">${JSON.stringify({'@type':'Event',name:'Evento número '+n,startDate:d,url:'https://macamuseo.org/agenda/ev-'+n})}</script></html>`;
test('rastreo: sigue solo fichas del host que cumplen el patrón y respeta robots',async()=>{
  const calls=[];
  const list='<html><a href="/agenda/ev-1">1</a><a href="/agenda/ev-2">2</a><a href="https://otro.com/agenda/ev-3">3</a><a href="/privado/x">x</a><a href="/agenda/ev-4">4</a></html>';
  const src={...source,adapter:'jsonld-crawl-html',detailPattern:'^/agenda/ev-',maxDetailPages:5};
  const got=await mockFetch(async(url)=>{calls.push(url);
    if(url.endsWith('robots.txt'))return new Response('User-agent: *\nAllow: /\nDisallow: /agenda/ev-4',{status:200});
    if(url.endsWith('/eventosmaca'))return new Response(list,{status:200});
    const n=url.match(/ev-(\d)/)[1];return new Response(ldPage(n,'2026-12-0'+n),{status:200})},()=>fetchSource(src,env));
  assert.equal(got.ok,true);assert.equal(got.candidates.length,2);
  assert.ok(calls.every(u=>new URL(u).hostname==='macamuseo.org'));
  assert.ok(!calls.some(u=>u.includes('ev-4')||u.includes('privado')));
  assert.equal(got.parser.detailPagesVisited,2);
});
test('ics-feed: pide el calendario solo con permiso y robots OK',async()=>{
  const ics='BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:z\nSUMMARY:Noche de jazz abierta\nDTSTART;TZID=America/Montevideo:20261212T210000\nURL:https://macamuseo.org/e/z\nEND:VEVENT\nEND:VCALENDAR';
  const src={...source,adapter:'ics-feed',url:'https://macamuseo.org/agenda.ics'};
  const got=await mockFetch(async(url)=>new Response(url.endsWith('robots.txt')?'User-agent: *\nAllow: /':ics,{status:200}),()=>fetchSource(src,env));
  assert.equal(got.ok,true);assert.equal(got.candidates.length,1);assert.equal(got.candidates[0].time,'21:00');
});
