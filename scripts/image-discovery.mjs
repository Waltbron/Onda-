#!/usr/bin/env node
// ONDA · Descubrimiento liviano de imágenes públicas de fichas futuras.
// No descarga fotografías, no reescribe eventos, no modifica conectores ni crea tareas.
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const root=new URL('../',import.meta.url);
const load=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const clean=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const STOP=new Set('de del la las los el en un una por y para concierto evento festival internacional musica teatro cine maca punta este maldonado 2026 2027'.split(' '));
const providers=['maldonado.gub.uy','macamuseo.org','rseventosdeportivos.com','ironman.com','gfny.com','toururuguay.uy','rochacorre.uy','lolograste.uy','granfondoargentina.com','puntadeleste.gfny.com'];
const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password?u:null}catch{return null}};
export function validImageUrl(s){
 const u=safeUrl(s);
 if(!u)return false;
 const path=decodeURIComponent(u.pathname).toLowerCase();
 return !/(?:^|\/)(?:undefined|null|nan)(?:$|\/)/.test(path)&&
  !/(?:^|[\/._-])(?:logo|favicon|placeholder|default-avatar|no-image)(?:[\/._-]|$)/i.test(path);
}
const isHostAllowed=s=>{const u=safeUrl(s);return !!u&&providers.some(p=>u.hostname===p||u.hostname.endsWith('.'+p))};
export function eligiblePage(url){
 const u=safeUrl(url);
 if(!u||!isHostAllowed(url)||/\.(pdf|yaml|png|jpe?g|webp)$/i.test(u.pathname))return false;
 const path=u.pathname.toLowerCase().replace(/\/$/,'');
 if(path.length<13||['/eventosmaca','/actividades','/eventos','/inscripciones','/calendario','/register','/races'].includes(path))return false;
 if(/\/(?:login|search|categoria|politica|terminos)(?:\/|$)/.test(path))return false;
 return true;
}
function attr(tag,key){
 const reg=new RegExp('\\b'+key+'\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27|([^\\s>]+))','i');
 const m=tag.match(reg);return m?m[1]??m[2]??m[3]:'';
}
function decode(s){return String(s??'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/g,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')}
export function extractMeta(html,baseUrl){
 const found={};
 for(const m of html.matchAll(/<meta\b[^>]*>/gi)){
  const tag=m[0],type=(attr(tag,'property')||attr(tag,'name')).toLowerCase();
  const value=decode(attr(tag,'content'));
  if(['og:image','og:image:secure_url','twitter:image','og:title','twitter:title'].includes(type)&&!found[type])found[type]=value;
 }
 const title=found['og:title']||found['twitter:title']||decode(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]||'');
 const raw=found['og:image:secure_url']||found['og:image']||found['twitter:image'];
 let image=null;
 try{image=new URL(raw,baseUrl);if(!validImageUrl(image.href))image=null}catch{image=null}
 return {title,imageUrl:image?.href||null};
}
export function matchesEvent(event,pageTitle){
 const a=clean(event.title).split(' ').filter(x=>x.length>=4&&!STOP.has(x));
 const b=clean(pageTitle);
 if(!b||!a.length)return false;
 return a.filter(x=>b.includes(x)).length>=Math.min(2,a.length);
}
async function inspect(event,url){
 const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),6500);
 try{
  const res=await fetch(url,{headers:{'Accept':'text/html','User-Agent':'ONDA-Lab/1.0 (event-card-image-discovery)'},signal:ctrl.signal});
  if(!res.ok||!(res.headers.get('content-type')||'').includes('text/html'))return null;
  const html=(await res.text()).slice(0,1800000),meta=extractMeta(html,res.url);
  if(!meta.imageUrl||!matchesEvent(event,meta.title))return null;
  const imageType=/^https:\/\/entradas\.macamuseo\.org\/evento\/[^?#]+\/og(?:[?#]|$)/i.test(meta.imageUrl)?'poster':'photo';
  return {imageUrl:meta.imageUrl,imageType,imageAlt:'Imagen publicada para '+event.title,
   imageCredit:event.sourceName||'Fuente del evento',imageSourceUrl:res.url};
 }catch{return null}finally{clearTimeout(timeout)}
}
async function main(){
 const events=load('site/data/events.json'), prior=load('site/data/event-images.json');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const eligible=events.filter(e=>(e.endDate||e.date)>=today&&!e.imageUrl&&!prior[e.id]).slice(0,42);
 const result=Object.fromEntries(Object.entries(prior).filter(([,x])=>x&&validImageUrl(x.imageUrl)));
 const removed=Object.keys(prior).length-Object.keys(result).length;
 let checked=0,added=0;
 // Tope de 3 solicitudes simultáneas; nunca solicita galerías, páginas privadas o fotos en binario.
 for(let i=0;i<eligible.length;i+=3){
  await Promise.all(eligible.slice(i,i+3).map(async e=>{
   const urls=[e.sourceUrl,e.ticketUrl,e.organizerUrl].filter((u,j,arr)=>u&&arr.indexOf(u)===j&&eligiblePage(u));
   for(const url of urls.slice(0,2)){
    checked++;
    const media=await inspect(e,url);
    if(media){result[e.id]=media;added++;break}
   }
  }));
 }
 const byUrl=new Map();let relabeled=0;
 for(const [id,x] of Object.entries(result))byUrl.set(x.imageUrl,[...(byUrl.get(x.imageUrl)||[]),id]);
 for(const ids of byUrl.values())if(ids.length>1)for(const id of ids){
  if(result[id].imageType!=='reference'){
   result[id]={...result[id],imageType:'reference',imageAlt:'Imagen referencial de '+(events.find(e=>e.id===id)?.title||'la actividad')};
   relabeled++;
  }
 }
 if(process.argv.includes('--write')&&(added||removed||relabeled))
  writeFileSync(new URL('site/data/event-images.json',root),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({futureCandidates:eligible.length,pagesChecked:checked,added,removed,relabeled,total:Object.keys(result).length,mode:process.argv.includes('--write')?'write':'dry-run'}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
