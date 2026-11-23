// Acceso de solo lectura a páginas explícitamente autorizadas, con límites conservadores.
import {mayFetch} from './robots-policy.mjs';
import {parseJSONLDEvents} from './html-adapter.mjs';
import {parseICS} from './ics-adapter.mjs';
import {fetchOpenSports} from './open-sports.mjs';
import {fetchPartnerTicketera} from './ticketera-feed.mjs';
const WAIT=1000;
async function read(url, contact, max=2_000_000, accept='text/html,text/plain;q=0.8') {
  const res=await fetch(url,{headers:{'User-Agent':`ONDA-Hormiga/1.0 (+mailto:${contact})`,'Accept':accept},signal:AbortSignal.timeout(12000),redirect:'error'});
  if(!res.ok)throw Error('HTTP '+res.status);
  if(Number(res.headers.get('content-length')||0)>max)throw Error('archivo demasiado grande');
  const text=await res.text();if(text.length>max)throw Error('contenido demasiado grande');
  return text;
}
export async function fetchSource(source,env=process.env){
  const base=new URL(source.url);
  if(!source.enabled||source.permission!=='approved')return {sourceId:source.id,ok:false,error:'fuente no habilitada o sin permiso'};
  if(!source.permissionEvidence) return {sourceId:source.id,ok:false,error:'falta evidencia de la revisión de acceso'};
  if(source.adapter==='github-open-sports-yaml')return await fetchOpenSports(source,env);
  if(source.adapter==='partner-ticket-feed-json')return await fetchPartnerTicketera(source,env);
  const ADAPTERS=['jsonld-event-html','jsonld-crawl-html','ics-feed'];
  if(!ADAPTERS.includes(source.adapter))return {sourceId:source.id,ok:false,error:'parser no implementado'};
  if(!/^https:$/.test(base.protocol)||base.hostname!==source.expectedHost||base.username||base.password) return {sourceId:source.id,ok:false,error:'destino no autorizado'};
  const contact=env.ONDA_CONTACT_EMAIL||'';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))return {sourceId:source.id,ok:false,error:'falta ONDA_CONTACT_EMAIL válido'};
  try{
    const robots=await read(`${base.origin}/robots.txt`,contact,200_000);
    if(!robots.trim())throw Error('robots vacío');
    const decision=mayFetch(robots,source.url,'ONDA-Hormiga/1.0');
    if(!decision.allowed)throw Error('robots bloquea agenda pública: '+decision.reason);
    await new Promise(r=>setTimeout(r,WAIT));
    const ctx={sourceId:source.id,baseUrl:source.url,sourceName:source.name,city:source.city};
    if(source.adapter==='ics-feed'){
      const ics=await read(source.url,contact,1_000_000,'text/calendar,text/plain;q=0.8');
      const parsed=parseICS(ics,ctx);
      return {sourceId:source.id,ok:true,candidates:parsed.candidates,issues:parsed.issues,parser:parsed.summary};
    }
    const html=await read(source.url,contact);
    if(!/<html|<script|<!doctype/i.test(html))throw Error('respuesta no reconocible como HTML');
    const parsed=parseJSONLDEvents(html,ctx);
    if(source.adapter==='jsonld-crawl-html'){
      // Rastreo acotado: solo fichas del mismo host enlazadas desde la agenda y que cumplan detailPattern.
      const pattern=new RegExp(source.detailPattern||'^$'),limit=Math.min(Number(source.maxDetailPages)||20,40);
      const links=[...new Set([...html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)].map(m=>{try{const u=new URL(m[1],source.url);return u.protocol==='https:'&&u.host===base.host&&pattern.test(u.pathname)?u.href:null}catch{return null}}).filter(Boolean))].slice(0,limit);
      const seen=new Set(parsed.candidates.map(c=>c.sourceUrl+'|'+c.date));let visited=0;
      for(const link of links){
        if(!mayFetch(robots,link,'ONDA-Hormiga/1.0').allowed){parsed.issues.push({reason:'robots bloquea ficha',eventTitle:link});continue}
        await new Promise(r=>setTimeout(r,WAIT));
        try{
          const d=parseJSONLDEvents(await read(link,contact),{...ctx,baseUrl:link});visited++;
          for(const c of d.candidates){const k=c.sourceUrl+'|'+c.date;if(!seen.has(k)){seen.add(k);parsed.candidates.push(c)}}
          parsed.issues.push(...d.issues);
        }catch(e){parsed.issues.push({reason:'ficha no leída: '+String(e.message).slice(0,80),eventTitle:link})}
      }
      parsed.summary={...parsed.summary,detailPagesVisited:visited,detailLinksFound:links.length,networkAccess:true};
    }
    return {sourceId:source.id,ok:true,candidates:parsed.candidates,issues:parsed.issues,parser:parsed.summary};
  }catch(e){return {sourceId:source.id,ok:false,error:String(e.message).slice(0,200)}}
}
