#!/usr/bin/env node
// Auditoría local determinista: sin llamadas externas, sin alterar catálogo ni publicar nada.
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const events=read('site/data/events.json');
const sources=read('data/sources.json');
const format=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit'});
const parts=Object.fromEntries(format.formatToParts(new Date()).map(x=>[x.type,x.value]));
const today=[parts.year,parts.month,parts.day].join('-');
const daysBetween=(a,b)=>Math.floor((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);
const active=events.filter(x=>(x.endDate||x.date)>=today&&!['cancelado','finalizado','retirado'].includes(x.status));
const generic=new Set(['','/','/evento','/eventos','/inscripciones','/inscripcion','/register','/registro','/reservas','/tickets','/entradas','/checkout','/comprar']);
const ticketQuality=x=>{
 try{const u=new URL(x.ticketUrl);if(u.protocol!=='https:')return 'invalid';
  return generic.has(u.pathname.replace(/\/+$/,'').toLowerCase())?'portal':'event';
 }catch{return x.ticketUrl?'invalid':'none'}
};
const future=active.map(e=>({
 id:e.id,title:e.title,date:e.date,city:e.city,source:e.sourceName,
 ticket:ticketQuality(e),checkedAt:e.checkedAt||null,
 daysSinceCheck:e.checkedAt?daysBetween(e.checkedAt,today):null,
 hasTime:!!e.time,hasSource:typeof e.sourceUrl==='string'&&e.sourceUrl.startsWith('https://')
}));
const stale=future.filter(x=>x.daysSinceCheck===null||x.daysSinceCheck>7);
const totals={events:events.length,remainingByDate:future.length,
 freshWithinSevenDays:future.length-stale.length,stale:stale.length,
 withEventTicket:future.filter(x=>x.ticket==='event').length,
 withPortalOnly:future.filter(x=>x.ticket==='portal').length,
 withoutTicket:future.filter(x=>x.ticket==='none').length,
 withStartTime:future.filter(x=>x.hasTime).length,
 withoutSource:future.filter(x=>!x.hasSource).length,
 enabledAuthorizedConnectors:sources.filter(x=>x.enabled&&x.permission==='approved'&&x.publicationPolicy==='automatic').length};
const report={schema:'onda.catalog-health.v1',generatedAt:new Date().toISOString(),today,analysis:'static-file-audit',
 note:'Son señales de calidad de los archivos. La presencia de URL no confirma disponibilidad en vivo ni existencia de entradas.',
 totals,stale:stale.map(x=>({id:x.id,title:x.title,date:x.date,checkedAt:x.checkedAt,daysSinceCheck:x.daysSinceCheck})),
 genericTicketLinks:future.filter(x=>x.ticket==='portal').map(x=>({id:x.id,title:x.title,checkedAt:x.checkedAt})),
 missingTicketLinks:future.filter(x=>x.ticket==='none').map(x=>({id:x.id,title:x.title,date:x.date}))};
const output=new URL('../data/reports/catalog-quality.json',import.meta.url);
fs.mkdirSync(new URL('../data/reports/',import.meta.url),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({today,totals,report:'data/reports/catalog-quality.json'}));
if(totals.withoutSource)process.exitCode=1;
