import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fetchSource} from '../src/live.mjs';
// Reintentos acotados: solo fallos transitorios (5xx/429/red), máximo 2 reintentos.
const html=fs.readFileSync(new URL('../fixtures/maca-jsonld-ejemplo.html',import.meta.url),'utf8');
const source={id:'maca-agenda',name:'MACA · Agenda pública',url:'https://macamuseo.org/eventosmaca',city:'Manantiales',expectedHost:'macamuseo.org',adapter:'jsonld-event-html',enabled:true,permission:'approved',permissionEvidence:'Conformidad revisión 2026-10-15 (sólo fixture de prueba)',publicationPolicy:'review'};
const env={ONDA_CONTACT_EMAIL:'test@ejemplo.uy'};
process.env.ONDA_RETRY_DELAY_MS='0';
async function mockFetch(impl,callback){const before=globalThis.fetch;globalThis.fetch=impl;try{return await callback()}finally{globalThis.fetch=before}}
test('reintenta un 503 transitorio y luego tiene éxito',async()=>{
  let robots=0;
  const got=await mockFetch(async(url)=>{
    if(url.endsWith('robots.txt')){robots++;return robots<2?new Response('x',{status:503}):new Response('User-agent: *\nAllow: /',{status:200})}
    return new Response(html,{status:200});
  },()=>fetchSource(source,env));
  assert.equal(got.ok,true);assert.equal(robots,2);
});
test('no reintenta un 404 (error permanente)',async()=>{
  let calls=0;
  const got=await mockFetch(async()=>{calls++;return new Response('no',{status:404})},()=>fetchSource(source,env));
  assert.equal(got.ok,false);assert.equal(calls,1);
});
test('los reintentos tienen tope: 503 permanente = 3 intentos y falla',async()=>{
  let calls=0;
  const got=await mockFetch(async()=>{calls++;return new Response('x',{status:503})},()=>fetchSource(source,env));
  assert.equal(got.ok,false);assert.equal(calls,3);assert.match(got.error,/503/);
});
