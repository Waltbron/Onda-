// ONDA v3 — reconciliación pura, sin red ni efectos laterales.
// Los eventos manuales son inmutables. Los cambios automáticos siempre tienen procedencia.
import { createHash } from 'node:crypto';
import { validateCandidate, canonicalUrl } from './engine.mjs';

const string = x => String(x ?? '');
const clean = s => string(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const same = (a,b) => clean(a) === clean(b);
const isoDay = timestamp => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(timestamp));
const fields = ['title','date','endDate','time','endTime','place','city','category','sourceUrl','externalStatus'];
const historyDiff = (a,b) => Object.fromEntries(fields.filter(k => JSON.stringify(a[k] ?? null)!==JSON.stringify(b[k] ?? null)).map(k => [k,{before:a[k]??null,after:b[k]??null}]));
const hash = s => createHash('sha256').update(s).digest('hex').slice(0,16);
const fingerprint = c => `${c.sourceId}|${c.sourceItemId || canonicalUrl(c.sourceUrl)}`;
const eventId = c => `onda-${hash(fingerprint(c))}`;
const rootUrl = x => {try{return canonicalUrl(x)}catch{return null}};
const significant = (a,b) => a.date===b.date && same(a.title,b.title) && same(a.city,b.city);

export function candidateDuplicate(c, manual, automatic, suggestedAliases={}) {
  const key = `${c.sourceId}|${c.sourceUrl}`;
  // Los aliases de V2.4 son candidatos, NO equivalencias confirmadas.
  if(suggestedAliases[key]) return {id:suggestedAliases[key],cause:'alias-sugerido-pendiente'};
  const matches = [...manual,...automatic].filter(e=>
    rootUrl(e.sourceUrl)===rootUrl(c.sourceUrl) || significant(e,c)
  );
  const other = matches.find(e=>e.sourceId !== c.sourceId || !e.sourceId);
  return other ? {id:other.id,cause: rootUrl(other.sourceUrl)===rootUrl(c.sourceUrl)?'misma-url':'titulo-fecha-ciudad'} : null;
}
export function convertCandidate(c, now, source) {
  const v = validateCandidate(c);
  if(new URL(v.sourceUrl).hostname !== source.expectedHost) throw Error('URL fuera del dominio permitido');
  const dateToday=isoDay(now);
  const max = new Date(now);max.setUTCDate(max.getUTCDate()+400);
  if(v.date > max.toISOString().slice(0,10)) throw Error('fecha más allá de 400 días');
  if(!['', 'cancelled','postponed','rescheduled'].includes(c.externalStatus || '')) throw Error('estado externo desconocido');
  const base = {
    id:eventId(v), sourceId:v.sourceId, sourceItemId:v.sourceItemId??null,
    sourceUrl:v.sourceUrl,sourceName:source.name,title:v.title,kind:v.kind||'evento',
    category:v.category,date:v.date,endDate:v.endDate,time:v.time,endTime:v.endTime,
    place:v.place,city:v.city,address:v.address??'',cost:'Consultar en fuente',
    priceTier:'sin-informar',description:'',note:'Consultá posibles cambios en el enlace oficial.',
    weatherSensitive:false,tags:[],ticketUrl:null,imageUrl:null,
    timezone:'America/Montevideo',confidence:'A',status:'verificado',
    checkedAt:now.slice(0,10),lastSeenAt:now,evidence:v.evidence,
    externalStatus:c.externalStatus||'',sourceVerification:'jsonld-structured'
  };
  if(c.externalStatus==='cancelled')base.status='cancelado';
  if(c.externalStatus==='postponed')base.status='dudoso';
  if(v.endDate < dateToday)base.status='finalizado';
  return base;
}
export function validateOverrides(overrides={}) {
  const hidden=overrides.hide??[], correct=overrides.correct??{};
  if(!Array.isArray(hidden)||!hidden.every(x=>typeof x==='string'))throw Error('hide debe ser lista de IDs');
  if(!correct||typeof correct!=='object'||Array.isArray(correct))throw Error('correct debe ser objeto');
  const allowed=new Set(['title','date','endDate','time','endTime','place','city','cost','priceTier','status','note','address']);
  for(const [id,record] of Object.entries(correct)){
    if(!record||typeof record!=='object'||!record.reason||typeof record.reason!=='string'||!record.patch||typeof record.patch!=='object')throw Error(`override ${id} sin reason/patch`);
    if(Object.keys(record.patch).some(k=>!allowed.has(k)))throw Error(`override ${id} modifica campo prohibido`);
  }
  return {hide:hidden,correct};
}
export function publicCatalog(manual, automatic, overrides={}) {
  const o=validateOverrides(overrides);
  const ids=new Set();
  const items=[];
  for(const e of [...manual,...automatic]) {
    if(ids.has(e.id))throw Error('ID duplicado en el catálogo: '+e.id);
    ids.add(e.id);
    if(o.hide.includes(e.id))continue;
    let item={...e};
    if(o.correct[e.id]){
      item={...item,...o.correct[e.id].patch};
      if(item.date||item.endDate)validateCandidate({sourceId:item.sourceId||'manual',sourceUrl:item.sourceUrl,title:item.title,date:item.date,endDate:item.endDate,time:item.time,endTime:item.endTime,category:item.category,city:item.city,evidence:[{field:'date',text:item.date}]});
    }
    if(['cancelado','dudoso','retirado','finalizado','agotado','reprogramado'].includes(item.status))continue;
    items.push(item);
  }
  return items;
}
export function updatePipeline({manual,automatic=[],state={schema:1,sources:{}},sources=[],results=[],overrides={},suggestedAliases={},now=new Date().toISOString(),mode='live'}) {
  validateOverrides(overrides);
  const nextAutomatic=automatic.map(e=>({...e})), nextState=structuredClone(state);
  nextState.sources ||= {};
  const issues=[],changes=[],sourceReports=[];
  const priorIds=new Set([...manual,...automatic].map(e=>e.id));
  if(priorIds.size !== manual.length+automatic.length)throw Error('IDs duplicados en base inicial');
  for(const result of results) {
    const source=sources.find(s=>s.id===result.sourceId);
    if(!source) throw Error('fuente no registrada '+result.sourceId);
    const prevStatus=nextState.sources[source.id]||{successes:0,failures:0};
    const summary={sourceId:source.id,name:source.name,status:'',found:0,new:0,modified:0,duplicates:0,held:0,error:null};
    if(!result.ok) {
      summary.status='degradada';summary.error=string(result.error).slice(0,220);
      nextState.sources[source.id]={...prevStatus,failures:(prevStatus.failures||0)+1,lastAttemptAt:now,status:'degradada',lastError:summary.error};
      sourceReports.push(summary);continue;
    }
    const raw=result.candidates??[];
    summary.found=raw.length;
    if(raw.length < (source.minItems||1) || (result.issues||[]).length) {
      summary.status='degradada';summary.error=raw.length===0?'lista vacía':`volumen insuficiente o ${result.issues?.length||0} fallas del parser`;
      nextState.sources[source.id]={...prevStatus,failures:(prevStatus.failures||0)+1,lastAttemptAt:now,status:'degradada',lastError:summary.error};
      sourceReports.push(summary);continue;
    }
    let converted;
    try {
      converted=raw.map(c=>{
        if(c.sourceId!==source.id)throw Error('sourceId de candidato no coincide');
        return convertCandidate(c,now,source);
      });
      const keys=converted.map(x=>fingerprint(x));
      if(new Set(keys).size!==keys.length)throw Error('identificador de origen duplicado');
    } catch(e) {
      summary.status='degradada';summary.error=string(e.message);
      nextState.sources[source.id]={...prevStatus,failures:(prevStatus.failures||0)+1,lastAttemptAt:now,status:'degradada',lastError:summary.error};
      sourceReports.push(summary);continue;
    }
    const preexisting=nextAutomatic.filter(e=>e.sourceId===source.id);
    let modifications=0;
    const tentative=[];
    for(let i=0;i<converted.length;i++) {
      const c=converted[i], rawCandidate=raw[i];
      const match=nextAutomatic.find(e=>e.id===c.id || (e.sourceId===source.id&&rootUrl(e.sourceUrl)===rootUrl(c.sourceUrl)));
      const duplicate=candidateDuplicate(rawCandidate,manual,nextAutomatic.filter(e=>e.id!==match?.id),suggestedAliases);
      if(duplicate){tentative.push({type:'possible-duplicate',sourceId:source.id,sourceUrl:c.sourceUrl,candidateId:c.id,existingId:duplicate.id,reason:duplicate.cause});summary.duplicates++;continue}
      if(match){
        const diff=historyDiff(match,c);
        if(Object.keys(diff).length){modifications++;tentative.push({type:'modified',id:match.id,sourceId:source.id,diff,newEvent:{...match,...c,id:match.id}})}
        else tentative.push({type:'unchanged',id:match.id,sourceId:source.id,newEvent:{...match,checkedAt:now.slice(0,10),lastSeenAt:now}});
      } else {
        if(priorIds.has(c.id)||nextAutomatic.some(e=>e.id===c.id))throw Error('Colisión de ID: '+c.id);
        tentative.push({type:'new',id:c.id,sourceId:source.id,newEvent:c});
      }
    }
    const proposedNew=tentative.filter(t=>t.type==='new').length;
    if((preexisting.length>=5 && modifications/preexisting.length>0.3) || (preexisting.length>=10 && proposedNew/preexisting.length>0.3)) {
      summary.status='bloqueada';summary.error='cambios masivos inesperados';summary.held=tentative.length;
      issues.push({sourceId:source.id,reason:summary.error});sourceReports.push(summary);continue;
    }
    const allowedAuto=mode==='live'&&source.enabled===true&&source.permission==='approved'&&source.publicationPolicy==='automatic';
    for(const t of tentative){
      if(t.type==='possible-duplicate'){issues.push(t);continue}
      if(!allowedAuto) {if(t.type==='new'||t.type==='modified') {summary.held++;issues.push({type:'pending-review',sourceId:source.id,id:t.id,why:'publicación no autorizada'});}continue}
      if(t.type==='new'){
        // Publicar solo fichas futuras verificadas. Candidatos caducados no se acumulan.
        if(t.newEvent.status==='finalizado'||t.newEvent.status==='cancelado'||t.newEvent.status==='dudoso')continue;
        nextAutomatic.push(t.newEvent);priorIds.add(t.id);summary.new++;changes.push({type:'new',id:t.id,sourceId:source.id});
      } else {
        const i=nextAutomatic.findIndex(x=>x.id===t.id);
        nextAutomatic[i]=t.newEvent;
        if(t.type==='modified'){summary.modified++;changes.push({type:'modified',id:t.id,sourceId:source.id,diff:t.diff});}
      }
    }
    summary.status=allowedAuto?'ok':'revisión';
    nextState.sources[source.id]={...prevStatus,successes:(prevStatus.successes||0)+1,lastAttemptAt:now,lastSuccessAt:now,status:summary.status,failures:0,lastError:null,lastFound:summary.found};
    sourceReports.push(summary);
  }
  if(sourceReports.some(s=>s.status==='ok'))nextState.lastSuccessfulRunAt=now;
  const publicEvents=publicCatalog(manual,nextAutomatic,overrides);
  const activeConnectors=sources.filter(s=>s.enabled===true&&s.permission==='approved'&&s.publicationPolicy==='automatic').length;
  const report={version:'3.0',at:now,mode,status:!results.length?'sin-fuentes':sourceReports.some(r=>r.status==='degradada'||r.status==='bloqueada')?'atención':'ok',activeConnectors,automaticUpdatesEnabled:mode==='live'&&activeConnectors>0,publishedChanges:changes.length,publicItems:publicEvents.length,sources:sourceReports,issues,changes,notSeenIsNotCancellation:true};
  return {automatic:nextAutomatic,state:nextState,publicEvents,report};
}
