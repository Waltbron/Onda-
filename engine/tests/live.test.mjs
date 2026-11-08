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
