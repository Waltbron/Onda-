// ONDA · Parser conservador de Event en JSON-LD presente en HTML guardado.
// No hace requests, no interpreta texto libre y nunca publica automáticamente.
import {canonicalUrl} from './engine.mjs';
const ATTR=/\btype\s*=\s*(["'])application\/ld\+json\1/i;
const SCRIPTS=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
function validDate(s){if(typeof s!=='string')return false;let m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(!m)return false;const d=new Date(`${s}T12:00:00Z`);return !Number.isNaN(d.valueOf())&&d.toISOString().startsWith(s)}
function parseEventDate(text){
  if(typeof text!=='string')throw Error('startDate absent');
  // Un ISO sin zona es ambiguo: no se transforma a UTC por heurística.
  const m=/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/.exec(text);
  if(!m||!validDate(m[1]))throw Error('startDate invalid or timezone ambiguous');
  if(m[2]!=null&&(Number(m[2])>23||Number(m[3])>59||Number.isNaN(Date.parse(text))))throw Error('invalid timestamp');
  if(!m[2])return {date:m[1],time:null};
  const observed=new Date(text);const display=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(observed);
  const p=Object.fromEntries(display.map(x=>[x.type,x.value]));return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`};
}
const isEvent=x=>{const t=x?.['@type'];return typeof t==='string'?t.toLowerCase().split('/').pop().endsWith('event'):Array.isArray(t)&&t.some(v=>String(v).toLowerCase().endsWith('event'));};
function flatten(doc,arr){if(Array.isArray(doc)){for(const x of doc)flatten(x,arr)}else if(doc&&typeof doc==='object'){if(isEvent(doc))arr.push(doc);if(doc['@graph'])flatten(doc['@graph'],arr);if(doc.mainEntity)flatten(doc.mainEntity,arr)}}
function getUrl(e,baseUrl){const u=e.url||e.mainEntityOfPage?.['@id']||e['@id'];const p=typeof u==='string'?u:(typeof u?.url==='string'?u.url:null);return canonicalUrl(new URL(p||baseUrl,baseUrl).href)}
function classify(title){if(/concierto|m[uú]sica|recital|show musical|d[uú]o/i.test(title))return 'Música';if(/feria|gastronom|degustaci[oó]n|vino|cocina/i.test(title))return 'Gastronomía';if(/marat[oó]n|carrera|running|competencia deportiva/i.test(title))return 'Deportes';return 'Cultura'}
export function parseJSONLDEvents(html,{sourceId,baseUrl,city='Manantiales',sourceName=sourceId}={}){
  if(typeof html!=='string'||!sourceId||!baseUrl)throw Error('missing HTML or source config');
  const parsed=[],issues=[],seen=new Set();let scripts=0;let match;
  while((match=SCRIPTS.exec(html))!==null){
    if(!ATTR.test(match[1]))continue; scripts++;
    let doc;try{doc=JSON.parse(match[2].trim())}catch{issues.push({reason:'invalid-json-ld',scriptIndex:scripts});continue}
    const events=[];flatten(doc,events);
    for(const e of events){
      try{
        const title=String(e.name||'').trim();if(title.length<5)throw Error('title missing or short');
        const start=parseEventDate(e.startDate);const end=e.endDate?parseEventDate(e.endDate):null;
        const u=getUrl(e,baseUrl);if(new URL(u).host!==new URL(baseUrl).host)throw Error('off-domain event URL');
        const itemId=e.identifier?.value||e.identifier||e['@id']||null;
        const uniqueKey=String(itemId||u)+'|'+e.startDate;
        if(seen.has(uniqueKey))continue;seen.add(uniqueKey);
        const location=e.location;const place=typeof location==='string'?location:String(location?.name||'').trim()||city;
        const evidence=[{field:'date',text:String(e.startDate),origin:'jsonld.startDate'},{field:'title',text:title,origin:'jsonld.name'}];
        if(end)evidence.push({field:'endDate',text:String(e.endDate),origin:'jsonld.endDate'});
        const statusToken=String(e.eventStatus||'').split('/').pop().toLowerCase();
        const statusMap={eventcancelled:'cancelled',eventpostponed:'postponed',eventrescheduled:'rescheduled'};
        const externalStatus=statusMap[statusToken]||'';
        if(externalStatus)evidence.push({field:'eventStatus',text:String(e.eventStatus),origin:'jsonld.eventStatus'});
        const result={sourceId,sourceName,sourceUrl:u,title,date:start.date,time:start.time,endDate:end?.date||start.date,endTime:end?.time||null,place,city,category:classify(title),kind:'evento',sourceItemId:typeof itemId==='string'?itemId:null,externalStatus,evidence,derived:{category:true},snapshotOrigin:'html-file-jsonld'};
        if(end&&end.date===start.date&&end.time&&start.time&&end.time<start.time)throw Error('end before start');
        parsed.push(result);
      }catch(error){issues.push({reason:String(error.message),eventTitle:String(e.name||'').slice(0,90)})}
    }
  }
  return {candidates:parsed,issues,summary:{ldScripts:scripts,validItems:parsed.length,rejectedItems:issues.length,requiresHumanReview:true,networkAccess:false}};
}
