// ONDA Lab: planificador de fuentes. Inventario != conector != publicación.
// Puro, sin red, sin escrituras, sin autorizar capturas de terceros.
const WEIGHTS={Ticketeras:7,Institucional:6,Venues:5,Nightlife:5,'Arte independiente':4,Gastronomía:4,Hoteles:3,'Naturaleza y deporte':4,'Medios y agendas':3,Buscadores:1,Instagram:1,Organizadores:4};
const host=x=>{try{const u=new URL(x);return u.protocol==='https:'?u.hostname.replace(/^www\./,'').toLowerCase():null}catch{return null}};
const canonical=x=>{try{const u=new URL(x);if(u.protocol!=='https:')return null;u.hash='';u.search='';u.hostname=u.hostname.replace(/^www\./,'');return u.href.replace(/\/$/,'')}catch{return null}};
const isApproved=x=>x?.enabled===true && x?.permission==='approved' && x?.publicationPolicy==='automatic';
export function planSources(inventory,connectors=[],now=new Date().toISOString()){
  if(!Array.isArray(inventory?.sources)||!Array.isArray(connectors))throw Error('Inventario o conectores inválidos');
  const ids=new Set();
  const sources=inventory.sources.map(item=>{
    if(!item.id||ids.has(item.id))throw Error('ID de inventario ausente o duplicado');
    ids.add(item.id);
    const hostname=host(item.url);
    const linked=connectors.filter(c=>c.id===item.id||(canonical(item.url)&&canonical(item.url)===canonical(c.url)));
    const active=linked.some(isApproved);
    const hasEndpoint=Boolean(item.endpointObserved&&hostname);
    // "listo para revisión" no implica permiso ni API.
    const status=active?'activo-autorizado':hostname?'revision-de-acceso':'localizar-url';
    const priorityScore=(WEIGHTS[item.layerName]??0)+(item.priority==='alta'?4:item.priority==='media'?2:0)+(item.trust==='A'?2:0)+(hasEndpoint?1:0);
    return {id:item.id,name:item.name,layer:item.layerName,url:item.url??null,host:hostname,
      status,priorityScore,priority:item.priority??'sin-prioridad',
      connectionFound:linked.length>0,authorized:active,
      legalReview:item.legalReview??'sin-revisión',adapterCandidate:item.methodCandidate??'por-definir',
      endpointObserved:Boolean(item.endpointObserved),
      nextAction:active?'auditar frescura y cobertura':!hostname?'localizar URL oficial':'revisar términos, robots y posible feed/API; pedir autorización antes de activar'};
  }).sort((a,b)=>b.priorityScore-a.priorityScore||a.name.localeCompare(b.name,'es'));
  const byLayer=Object.fromEntries(Object.keys(WEIGHTS).map(layer=>[layer,sources.filter(s=>s.layer===layer).length]));
  return {schemaVersion:'1.0',at:now,mode:'planning-only',networkRequests:0,published:false,
    total:sources.length,active:sources.filter(s=>s.authorized).length,
    accessReview:sources.filter(s=>s.status==='revision-de-acceso').length,
    missingUrl:sources.filter(s=>s.status==='localizar-url').length,byLayer,sources};
}
