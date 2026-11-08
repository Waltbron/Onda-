// ONDA V2.2 · núcleo determinístico de ingestión (laboratorio sin red).
// Recibe capturas YA estructuradas: no afirma parsear MACA ni pedir permiso.
export const ID_PREFIX='src';
export function canonicalUrl(raw) {
  const u=new URL(raw);
  if(!['https:','http:'].includes(u.protocol)||!u.hostname)throw Error('invalid sourceUrl');
  u.hash='';u.searchParams.delete('utm_source');u.searchParams.delete('utm_medium');u.searchParams.delete('utm_campaign');
  return u.toString().replace(/\/$/,'');
}
function validYmd(s){const d=new Date(`${s}T12:00:00Z`);return !Number.isNaN(d.valueOf())&&d.toISOString().startsWith(s)}
export function validateCandidate(c) {
  if(!c||typeof c!=='object')throw Error('candidate not object');
  const required=['sourceId','sourceUrl','title','date','category','city','evidence'];
  for(const k of required)if(!c[k])throw Error('missing '+k);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(c.date)||!validYmd(c.date))throw Error('invalid date');
  if(c.time!=null&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(c.time))throw Error('invalid time');
  if(c.endTime!=null&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(c.endTime))throw Error('invalid endTime');
  if(c.endDate && (!/^\d{4}-\d{2}-\d{2}$/.test(c.endDate)||!validYmd(c.endDate)))throw Error('invalid endDate');
  if(c.endDate && c.endDate<c.date)throw Error('endDate before date');
  if(c.endTime && !c.time)throw Error('endTime requires start time');
  if(c.endTime && c.time && (c.endDate??c.date)===c.date && c.endTime<c.time)throw Error('endTime before time on same day');
  if(!Array.isArray(c.evidence)||!c.evidence.some(x=>x.field==='date' && x.text))throw Error('missing date evidence');
  const url=canonicalUrl(c.sourceUrl);
  if(!url.startsWith('https://'))throw Error('sourceUrl must use HTTPS');
  if((c.title+'').trim().length<5)throw Error('short title');
  return {...c,sourceUrl:url,endDate:c.endDate??c.date,time:c.time??null,endTime:c.endTime??null,place:c.place??c.city};
}
function stableSlug(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)}
function sourceKey(c){return `${c.sourceId}|${canonicalUrl(c.sourceUrl)}`;}
const fields=['title','date','endDate','time','endTime','place','city','category'];
export function reconcile(prev,candidates,opts={}) {
  const at=opts.at||new Date().toISOString();
  if(!Array.isArray(prev)||!Array.isArray(candidates))throw Error('expected two arrays');
  const prior=prev.map(e=>({...e}));
  const logs=[],issues=[];
  if(candidates.length===0)return {events:prior,report:{mode:'offline-fixture',at,degraded:true,reason:'empty snapshot',new:0,updated:0,unchanged:0,issues:[]},changes:[]};
  let checked;
  try{checked=candidates.map(validateCandidate)}catch(err){return {events:prior,report:{mode:'offline-fixture',at,degraded:true,reason:String(err.message),new:0,updated:0,unchanged:0,issues:[String(err.message)]},changes:[]}}
  const seen=new Set();
  for(const c of checked){const k=sourceKey(c);if(seen.has(k))return {events:prior,report:{mode:'offline-fixture',at,degraded:true,reason:'duplicate canonical URL in snapshot',new:0,updated:0,unchanged:0,issues:[k]},changes:[]};seen.add(k)}
  let created=0,modified=0,unchanged=0;
  const byKey=new Map(prior.filter(e=>e.sourceId).map(e=>[sourceKey(e),e]));
  for(const c of checked){
    const key=sourceKey(c),known=byKey.get(key);
    if(known){
      const changes={};for(const f of fields)if((known[f]??null)!==(c[f]??null))changes[f]={before:known[f]??null,after:c[f]??null};
      if(Object.keys(changes).length){
        for(const f of Object.keys(changes))known[f]=c[f]??null;
        known.evidence=c.evidence;known.snapshotSeenAt=at;
        logs.push({type:'modified',id:known.id,changes});modified++;
      }else unchanged++;
    }else{
      const namePart=stableSlug(new URL(c.sourceUrl).pathname.split('/').filter(Boolean).pop()||c.title);
      let id=ID_PREFIX+'-'+stableSlug(c.sourceId)+'-'+namePart;
      const existingIds=new Set(prior.map(e=>e.id));if(existingIds.has(id)){issues.push({reason:'id collision',id,sourceUrl:c.sourceUrl});continue}
      const event={id,title:c.title,kind:c.kind||'evento',category:c.category,date:c.date,endDate:c.endDate??c.date,time:c.time??null,endTime:c.endTime??null,city:c.city,place:c.place||c.city,address:c.address||'',cost:c.cost||'Consultar en fuente',priceTier:'sin-informar',tags:c.tags||[],description:'',note:'Ensayo offline: confirmar en la fuente.',sourceName:c.sourceName||c.sourceId,sourceUrl:c.sourceUrl,sourceId:c.sourceId,checkedAt:null,confidence:'pendiente',status:'dudoso',timezone:'America/Montevideo',evidence:c.evidence,snapshotSeenAt:at,demo:true};
      // No publicar automáticamente al no haber confirmación de captura/permiso.
      prior.push(event);logs.push({type:'new_demo_pending',id});created++;
    }
  }
  // Nunca retirar por ausencia. Para eso se exige verificación de la URL canónica.
  return {events:prior,changes:logs,report:{mode:'offline-fixture',at,degraded:false,new:created,updated:modified,unchanged,issues,notSeenIsNotCancellation:true,liveConnectorActive:false}};
}
