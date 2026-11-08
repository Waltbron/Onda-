// Acceso de solo lectura a páginas explícitamente autorizadas, con límites conservadores.
import {mayFetch} from './robots-policy.mjs';
import {parseJSONLDEvents} from './html-adapter.mjs';
const WAIT=1000;
async function read(url, contact, max=2_000_000) {
  const res=await fetch(url,{headers:{'User-Agent':`ONDA-Hormiga/1.0 (+mailto:${contact})`,'Accept':'text/html,text/plain;q=0.8'},signal:AbortSignal.timeout(12000),redirect:'error'});
  if(!res.ok)throw Error('HTTP '+res.status);
  if(Number(res.headers.get('content-length')||0)>max)throw Error('archivo demasiado grande');
  const text=await res.text();if(text.length>max)throw Error('contenido demasiado grande');
  return text;
}
export async function fetchSource(source,env=process.env){
  const base=new URL(source.url);
  if(!source.enabled||source.permission!=='approved')return {sourceId:source.id,ok:false,error:'fuente no habilitada o sin permiso'};
  if(!source.permissionEvidence) return {sourceId:source.id,ok:false,error:'falta evidencia de la revisión de acceso'};
  if(source.adapter!=='jsonld-event-html')return {sourceId:source.id,ok:false,error:'parser no implementado'};
  if(!/^https:$/.test(base.protocol)||base.hostname!==source.expectedHost||base.username||base.password) return {sourceId:source.id,ok:false,error:'destino no autorizado'};
  const contact=env.ONDA_CONTACT_EMAIL||'';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))return {sourceId:source.id,ok:false,error:'falta ONDA_CONTACT_EMAIL válido'};
  try{
    const robots=await read(`${base.origin}/robots.txt`,contact,200_000);
    if(!robots.trim())throw Error('robots vacío');
    const decision=mayFetch(robots,source.url,'ONDA-Hormiga/1.0');
    if(!decision.allowed)throw Error('robots bloquea agenda pública: '+decision.reason);
    await new Promise(r=>setTimeout(r,WAIT));
    const html=await read(source.url,contact);
    if(!/<html|<script|<!doctype/i.test(html))throw Error('respuesta no reconocible como HTML');
    const parsed=parseJSONLDEvents(html,{sourceId:source.id,baseUrl:source.url,sourceName:source.name,city:source.city});
    return {sourceId:source.id,ok:true,candidates:parsed.candidates,issues:parsed.issues,parser:parsed.summary};
  }catch(e){return {sourceId:source.id,ok:false,error:String(e.message).slice(0,200)}}
}
