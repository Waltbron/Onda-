// ONDA · Diagnóstico de catálogo, determinista, sin IA, red ni publicación.
// Indicadores de la propia agenda: NO equivalen a cobertura del mercado.
import '../../site/event-time.js';

const ET = globalThis.ONDAEventTime;
const fold = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const required = ['id','title','date','city','place','sourceUrl'];
const validHttps = value => { try {const u=new URL(value);return u.protocol==='https:' && !u.username && !u.password;}catch{return false;} };
const counts = (items,field) => Object.fromEntries([...new Set(items.map(e=>String(e[field]||'Sin indicar')))].sort().map(k=>[k,items.filter(e=>String(e[field]||'Sin indicar')===k).length]));

export function auditQuality({events,sources=[],radar=null,meta={},now=new Date().toISOString()}={}){
  if(!Array.isArray(events)||!Array.isArray(sources))throw Error('events y sources deben ser listas');
  const timestamp=new Date(now).valueOf();
  if(!Number.isFinite(timestamp))throw Error('now inválido');
  const today=ET.uyDate(timestamp);
  const tomorrowWeek=ET.addDays(today,6),monthEnd=ET.addDays(today,29);
  const active=events.filter(e=>ET.isCurrent(e,timestamp));
  const seven=active.filter(e=>ET.overlapsRange(e,today,tomorrowWeek,timestamp));
  const thirty=active.filter(e=>ET.overlapsRange(e,today,monthEnd,timestamp));

  const invalid=[],duplicates=[],staleChecks=[];
  const byId=new Set(),bySignature=new Map();
  for(const e of events){
    if(!e || typeof e!=='object'){invalid.push({id:null,reason:'ficha no es objeto'});continue;}
    const id=String(e.id||'');
    const gaps=required.filter(field=>typeof e[field]!=='string'||!e[field].trim());
    if(gaps.length)invalid.push({id,reason:'campos obligatorios: '+gaps.join(', ')});
    if(!ET.validDate(e.date)|| (e.endDate!=null&&!ET.validDate(e.endDate))|| !ET.eventWindow(e))invalid.push({id,reason:'fecha/horario de evento inválido'});
    if(!validHttps(e.sourceUrl))invalid.push({id,reason:'URL de fuente no HTTPS'});
    if(byId.has(id))invalid.push({id,reason:'ID duplicado'});
    byId.add(id);
    const signature=[fold(e.title),String(e.date||''),fold(e.city)].join('|');
    if(bySignature.has(signature))duplicates.push({id,possibleDuplicateOf:bySignature.get(signature),reason:'mismo título, fecha y localidad'});
    else bySignature.set(signature,id);
    if(ET.isCurrent(e,timestamp)){
      if(!ET.validDate(e.checkedAt))staleChecks.push({id,checkedAt:e.checkedAt||null,reason:'sin fecha de verificación válida'});
      else if(new Date(e.checkedAt+'T12:00:00Z').valueOf()<timestamp-14*86400000)
        staleChecks.push({id,checkedAt:e.checkedAt,reason:'más de 14 días desde revisión'});
    }
  }
  const activeConnectors=sources.filter(s=>s.enabled===true&&s.permission==='approved'&&s.publicationPolicy==='automatic').length;
  const radarPending=radar && Number.isInteger(radar.pending) ? radar.pending : null;
  const findings=[];
  if(invalid.length)findings.push({priority:'P0',code:'invalid-records',count:invalid.length,action:'Corregir fichas malformadas o con datos esenciales ausentes'});
  if(activeConnectors===0)findings.push({priority:'P0',code:'no-live-sources',count:0,action:'Validar y activar el primer conector real, sin forzar publicación'});
  if(seven.length===0)findings.push({priority:'P0',code:'empty-week',count:0,action:'Revisar descubrimiento y relevancia de la agenda próxima'});
  else if(seven.length<3)findings.push({priority:'P1',code:'thin-week',count:seven.length,action:'Auditar la cobertura de los próximos 7 días; no inventar eventos para subir el indicador'});
  if(staleChecks.length)findings.push({priority:'P1',code:'stale-reviews',count:staleChecks.length,action:'Revalidar fuentes de fichas vigentes con revisión antigua'});
  if(duplicates.length)findings.push({priority:'P1',code:'possible-duplicates',count:duplicates.length,action:'Revisar coincidencias antes de fusionar fichas'});
  if(radarPending>0)findings.push({priority:'P2',code:'radar-backlog',count:radarPending,action:'Revisar candidatos Radar; no convertirlos automáticamente en publicaciones'});
  if(meta.activeConnectors!=null&&meta.activeConnectors!==activeConnectors)
    findings.push({priority:'P1',code:'connector-meta-drift',count:activeConnectors,action:'Revisar discrepancia entre metadatos publicados y fuentes habilitadas'});
  return {
    schemaVersion:'1.0',at:new Date(timestamp).toISOString(),mode:'static-internal-audit',
    publicationAttempted:false,networkRequests:0,aiCalls:0,
    coverageRate:null,coverageNote:'Mide calidad de las fichas ONDA, no cobertura real del mercado.',
    metrics:{publishedTotal:events.length,activeNow:active.length,notCurrent:events.length-active.length,
      availableNext7Days:seven.length,availableNext30Days:thirty.length,
      activeCategories:counts(active,'category'),activeCities:counts(active,'city'),
      activeConnectors,radarPending},
    invalid,possibleDuplicates:duplicates,staleChecks,findings
  };
}
