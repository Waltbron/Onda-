// Auditoría reproducible sobre muestras verificadas fuera de ONDA.
// No mide cobertura total del mercado, solo el destino de casos detectados.
const normalizeHost = url => {try{return new URL(url).hostname.replace(/^www\./,'').toLowerCase()}catch{return null}};
export function summarizeCoverageAudits({audits=[],catalog=[],sources=[]}={}){
 if(!Array.isArray(audits)||!Array.isArray(catalog)||!Array.isArray(sources))throw Error('Listas inválidas');
 const known=new Set(catalog.map(e=>e.id));
 const seen=new Set(),items=[],issues=[];
 for(const audit of audits){
   if(audit?.schemaVersion!=='1.0'||!Array.isArray(audit.evidence)) {issues.push({auditDate:audit?.auditDate||null,error:'Auditoría sin evidencia válida'});continue}
   for(const e of audit.evidence){
     if(!e?.id || !e.sourceUrl || !e.date){issues.push({auditDate:audit.auditDate,error:'Evidencia incompleta'});continue}
     const signature=String(audit.auditDate)+'|'+e.id;
     if(seen.has(signature)){issues.push({auditDate:audit.auditDate,error:'Registro duplicado',id:e.id});continue}
     seen.add(signature);
     const sourceHost=normalizeHost(e.sourceUrl);
     const configured=sources.filter(s=>normalizeHost(s.url)===sourceHost);
     const active=configured.filter(s=>s.enabled===true&&s.permission==='approved'&&s.publicationPolicy==='automatic');
     items.push({
       id:e.id,title:e.event,date:e.date,auditDate:audit.auditDate,
       wasMissing:Boolean(e.wasMissing),currentlyPublished:known.has(e.id),
       sourceUrl:e.sourceUrl,sourceRegistered:configured.length>0,
       activeSourceCount:active.length,
       likelyGap:active.length===0?'sin-conector-activo':'requiere-investigacion',
       state:known.has(e.id)?'corregido':'pendiente'
     });
   }
 }
 return {schemaVersion:'1.0',mode:'sample-only',audits:audits.length,sampleSize:items.length,
    missedPreviously:items.filter(x=>x.wasMissing).length,
    resolved:items.filter(x=>x.wasMissing&&x.currentlyPublished).length,
    stillMissing:items.filter(x=>x.wasMissing&&!x.currentlyPublished).length,
    activeSources:sources.filter(s=>s.enabled===true&&s.permission==='approved'&&s.publicationPolicy==='automatic').length,
    coverageRate:null,items,issues};
}
