#!/usr/bin/env node
// Captura de MUESTRA (no publica nada): baja el listado y unas pocas fichas de una fuente
// ya registrada en data/sources.json, respetando robots.txt, para poder escribir/validar su parser.
// Uso: node scripts/capture-sample.mjs <url-listado> [--detail=<regex de path>] [--max=3]
import fs from 'node:fs';
import {mayFetch} from '../engine/src/robots-policy.mjs';
const UA='ONDA-Hormiga/1.0 (+https://enonda.app)';
const args=process.argv.slice(2);const listUrl=args.find(a=>!a.startsWith('--'));
const opt=k=>(args.find(a=>a.startsWith('--'+k+'='))||'').split('=').slice(1).join('=');
const max=Math.min(Number(opt('max'))||3,5),detail=opt('detail');
const sources=JSON.parse(fs.readFileSync('data/sources.json','utf8'));
const u=new URL(listUrl);
if(u.protocol!=='https:'||!sources.some(s=>s.expectedHost===u.hostname&&s.permissionEvidence))throw Error('host no registrado con evidencia en sources.json: '+u.hostname);
const wait=()=>new Promise(r=>setTimeout(r,1500));
async function get(url,limit=1_500_000){
  const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'text/html,text/calendar,*/*;q=0.5'},redirect:'follow',signal:AbortSignal.timeout(20000)});
  if(new URL(r.url).hostname!==u.hostname)throw Error('redirección a otro host');
  const t=await r.text();if(t.length>limit)throw Error('demasiado grande');return {status:r.status,text:t};
}
const robots=(await get(u.origin+'/robots.txt',200000)).text;
if(!robots.trim())throw Error('robots vacío: no se captura');
const ok=url=>mayFetch(robots,url,'ONDA-Hormiga/1.0').allowed;
const dir=`data/samples/${u.hostname}`;fs.mkdirSync(dir,{recursive:true});
const summary={capturedAt:new Date().toISOString(),listing:listUrl,pages:[]};
function inspect(name,url,res){
  const t=res.text;
  const ld=[...t.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>{try{const j=JSON.parse(m[1]);return JSON.stringify(j['@type']||(j['@graph']||[]).map(x=>x['@type']))}catch{return 'json-invalido'}});
  summary.pages.push({name,url,status:res.status,bytes:t.length,jsonLdTypes:ld,timeTags:(t.match(/<time\b/gi)||[]).length,hasICS:/\.ics|webcal:/i.test(t),links:(t.match(/href=/gi)||[]).length});
  fs.writeFileSync(`${dir}/${name}`,t);
}
if(!ok(listUrl))throw Error('robots bloquea el listado');
const list=await get(listUrl);inspect('listado.html',listUrl,list);
if(detail){
  const re=new RegExp(detail);
  const links=[...new Set([...list.text.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)].map(m=>{try{const x=new URL(m[1],listUrl);return x.protocol==='https:'&&x.hostname===u.hostname&&re.test(x.pathname)?x.href:null}catch{return null}}).filter(Boolean))].slice(0,max);
  let i=1;for(const l of links){if(!ok(l))continue;await wait();try{inspect(`ficha-${i++}.html`,l,await get(l))}catch(e){summary.pages.push({url:l,error:e.message})}}
}
fs.writeFileSync(`${dir}/resumen.json`,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
