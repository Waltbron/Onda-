'use strict';
// ONDA V2 — curaduría experimental basada en datos, nunca en experiencias inventadas.
const $ = id => document.getElementById(id);
const ET = globalThis.ONDAEventTime;
const TIX = globalThis.ONDATickets;
const FMT = globalThis.ONDAFormats;
if (!ET) throw new Error('ONDAEventTime no disponible: cargar event-time.js antes de app.js');
const ONDAShare = globalThis.ONDAShare;
if (!ONDAShare) throw new Error('ONDAShare no disponible: cargar share.js antes de app.js');
const state = {lastDataSync:null,events:[],imageIndex:{},when:'todos',mood:'todos',zone:'todos',category:'todos',free:false,query:'',shown:9,modal:null};
const escapeHtml = x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = x=>{try{const u=new URL(x);return u.protocol==='https:'?escapeHtml(u.href):'#'}catch{return '#'}};
// El catálogo visual externo al JSON de eventos sobrevive a la ingesta diaria.
function attachImages(events){
 return events.map(e=>{
  const media=state.imageIndex[e.id];
  return media&&!e.imageUrl?{...e,...media}:e;
 });
}
const uyToday=()=>ET.uyDate();
const plusDays=ET.addDays;
const current=e=>ET.isCurrent(e);
const spans=(e,a,b)=>ET.overlapsRange(e,a,b);
const fmtDate=s=>new Intl.DateTimeFormat('es-UY',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));
const fmtCompact=s=>new Intl.DateTimeFormat('es-UY',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')).replace(/\./g,'');
const month=s=>new Intl.DateTimeFormat('es-UY',{month:'short',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')).replace('.','').toUpperCase();
function weekend(){const now=uyToday();const day=new Date(now+'T12:00:00Z').getUTCDay();const untilFriday=(5-day+7)%7;const first=(day===6||day===0)?plusDays(now,day===6?-1:-2):plusDays(now,untilFriday);return [first,plusDays(first,2)]}
function matchTime(e,when){const t=uyToday();if(when==='hoy')return ET.overlapsDate(e,t);if(when==='manana')return ET.overlapsDate(e,plusDays(t,1));if(when==='finde'){const [a,b]=weekend();return spans(e,a,b)}return true}
const COLORS={
  'Cultura':['#e6ddf1','#202a56','#b4a3d0'],'Música':['#cddfff','#152c62','#f66b5d'],
  'Gastronomía':['#fbd6ba','#472c2e','#f66b5d'],'Fiestas':['#17243c','#ffffff','#ed6054'],
  'Aire libre':['#d3e8df','#193d4a','#85b8cd'],'Deporte':['#d8e5fc','#142b51','#f2ab83'],
  'Bienestar':['#e5e1fb','#312961','#a39cc8'],'Encuentros':['#f5e2c3','#463325','#e1a362']
};
// Recursos aprobados en Drive: decorativos, no fotografías del evento.
// La variante depende de un ID estable, de modo que una actualización no reordena imágenes.
const VISUALS=globalThis.ONDAVisuals;
if (!VISUALS) throw new Error('ONDAVisuals no disponible: cargar visuals.js antes de app.js');
const EDITORIAL_STORIES=VISUALS.catalog.map(({title,category,place,src})=>({title,category:category+' · '+place,src}));
function editorialArt(e){return VISUALS.forEvent(e).src}
function colors(e){const a=COLORS[e.category]||['#eae3d8','#182436','#f86959'];return `--poster-bg:${a[0]};--poster-ink:${a[1]};--poster-shape:${a[2]}`}
function dateLabel(e){return e.kind==='exposicion'&&e.endDate?`Hasta el ${fmtDate(e.endDate)}`:!e.endDate||e.date===e.endDate?fmtCompact(e.date):`${fmtCompact(e.date)} al ${fmtDate(e.endDate)}`}
function whereLabel(e){return `${e.place} · ${e.city}`}
function priceLabel(e){return e.priceTier==='gratis'?'Gratis / con reserva si corresponde':e.cost||'Precio a consultar'}
function freshnessLabel(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e.checkedAt||''))return 'Sin revisión fechada · confirmar en fuente';const days=Math.floor((Date.parse(uyToday()+'T12:00:00Z')-Date.parse(e.checkedAt+'T12:00:00Z'))/86400000);return days>7?'Revisión anterior a 7 días · confirmar en fuente':'Revisado '+e.checkedAt}
function ticketLabel(e){return e.ticketera||e.ticketingPlatform||e.sourceName||'Fuente original'}
const moodCategories={cultura:['Cultura','Encuentros'],musica:['Música'],gastro:['Gastronomía'],aire:['Aire libre','Deporte','Bienestar'],noche:['Fiestas','Música']};
function matchMood(e){return state.mood==='todos'||(moodCategories[state.mood]||[]).includes(e.category)}
function relevant(){return state.events.filter(e=>current(e)&&matchTime(e,state.when)&&(state.zone==='todos'||e.city===state.zone)&&matchMood(e))}
function reason(e){
  const p={Cultura:'Una pausa cultural para salir de lo de siempre.',Música:'Para salir a escuchar algo, en vez de seguir buscando qué hacer.',Gastronomía:'Si el plan empieza por algo rico, mirá esta propuesta.',Fiestas:'Para cuando te pinta una salida con más movimiento.',Deporte:'Si preferís una actividad para moverte y hacer algo distinto.',Bienestar:'Una alternativa para cambiar de ritmo.',Encuentros:'Una buena excusa para encontrarte con algo nuevo.','Aire libre':'Si querés cambiar pantallas por aire libre.'};
  return `${p[e.category]||'Una idea distinta para salir.'} ${e.city} · ${dateLabel(e)}.`;
}
function selectRecs(){
 const list=relevant();const seen=new Set();const timeNow=uyToday();
 const scored=list.map(e=>({e,score:(e.kind==='exposicion'?0:5)+(e.date<=timeNow?4:0)+(e.ticketUrl?2:0)+(e.confidence==='A'?2:0)+Math.max(0,14-Math.max(0,(new Date(e.date+'T12:00:00Z')-new Date(timeNow+'T12:00:00Z'))/86400000))}));
 scored.sort((a,b)=>b.score-a.score||a.e.date.localeCompare(b.e.date)||a.e.title.localeCompare(b.e.title));
 const out=[];
 for(const item of scored){if(!seen.has(item.e.category)){out.push(item.e);seen.add(item.e.category);if(out.length===3)break}}
 if(out.length<3)for(const item of scored){if(!out.some(e=>e.id===item.e.id)){out.push(item.e);if(out.length===3)break}}
 return out;
}
function activeVisualPlan(section){
 const mobile=window.innerWidth<=720;
 const columns=section==='recommendations'?(mobile?1:3):(mobile?1:window.innerWidth<=1050?2:3);
 const cards=section==='recommendations'?selectRecs():agendaItems().slice(0,state.shown);
 return VISUALS.allocate(cards,{columns});
}
function visualBackups(e,visual){
 const curated=visual.scope==='foto'?(globalThis.ONDAVisual.candidates(e)[0]||globalThis.ONDAVisual.fallback(e,new Set([visual.id]))):globalThis.ONDAVisual.fallback(e,new Set([visual.id]));
 const final=globalThis.ONDAVisual.fallback(e,new Set([visual.id,curated.id]));
 return {curated,final};
}
function visualLabel(visual){
 return visual.scope==='foto'?'Imagen del evento · filtro ONDA':visual.scope==='identidad'?'Portada ONDA · no es el afiche oficial':'Ilustración ONDA · no es fotografía del evento';
}
function editorialCover(e,visual){
 const {curated,final}=visualBackups(e,visual);
 const label=visual.scope==='foto'?'Imagen del evento':visual.scope==='identidad'?'':'Ilustración ONDA';
 const badge=label?'<span class="visual-disclaimer'+(visual.scope==='foto'?' photo-label':'')+'">'+label+'</span>':'';
 if(visual.src){
  const typeClass=visual.scope==='foto'?' onda-photo':visual.scope==='identidad'?' brand-fallback':'';
  return '<img class="editorial-art event-art-img'+typeClass+'" src="'+escapeHtml(visual.src)+'" data-fallback-src="'+escapeHtml(curated.src)+'" data-fallback-kind="'+escapeHtml(curated.scope)+'" data-fallback-caption="'+escapeHtml(visualLabel(curated))+'" data-final-src="'+escapeHtml(final.src)+'" alt="'+escapeHtml(visual.caption)+'" loading="lazy" decoding="async">'+badge;
 }
 if(visual.scope==='identidad')return '<span class="editorial-cover brand-cover '+escapeHtml(visual.variant)+'" role="img" aria-label="Portada gráfica ONDA; no representa al evento"><span class="brand-echo" aria-hidden="true">ONDA ONDA ONDA</span><span class="brand-lettering" aria-hidden="true">ONDA</span><span class="brand-signature" aria-hidden="true">EL ESTE TE LLAMA</span></span>';
 const symbol={'Cultura':'✳','Música':'♫','Deporte':'◉','Gastronomía':'✺','Fiestas':'✹','Aire libre':'❋','Bienestar':'☀','Encuentros':'✦'}[e.category]||'✦';
 return '<span class="editorial-cover" role="img" aria-label="Portada tipográfica editorial del evento: '+escapeHtml(e.title)+'"><span class="editorial-symbol" aria-hidden="true">'+escapeHtml(symbol)+'</span><span class="editorial-word">ONDA / '+escapeHtml(e.category)+'</span></span>';
}
function formatChip(e){
 const fmt=FMT?.classify(e);
 return fmt?'<span class="format-chip">'+escapeHtml(fmt.label)+'</span>':'';
}
function ticketAction(e){
 const link=TIX.access(e);
 return link.hasDirectTicket?'<a class="card-action ticket-cta" target="_blank" rel="noopener noreferrer" href="'+safeUrl(link.url)+'" aria-label="'+escapeHtml(link.label+' para '+e.title)+'">'+escapeHtml(link.label)+'</a>':'';
}
function recCard(e,i,visualOverride){const title=escapeHtml(e.title);const index=String(i+1).padStart(2,'0');const t=e.category.toUpperCase();const visual=visualOverride||VISUALS.forEvent(e);const cover=editorialCover(e,visual);const visualClass=visual.src?('rec-poster has-art'+(visual.scope==='identidad'?' has-brand':visual.scope==='foto'?' has-photo':'')):'rec-poster has-editorial';return `<article class="rec-card">
  <div class="${visualClass}" style="${colors(e)}">${cover}<span class="tag">${escapeHtml(t)}</span><span class="poster-head">${escapeHtml(e.city)}</span><span class="poster-index">ONDA / ${index}</span></div>
  <div class="rec-body"><div class="rec-overline">SELECCIÓN ${index} · ${escapeHtml(dateLabel(e))}</div><h3>${title}</h3><div class="rec-meta">⌖ ${escapeHtml(whereLabel(e))} ${formatChip(e)}</div>
  <div class="editor-note"><strong>LA MIRADA DE ONDA</strong>${escapeHtml(reason(e))}</div>
  <div class="rec-buttons">${ticketAction(e)}<button class="card-action detail-btn" data-id="${escapeHtml(e.id)}" type="button">Ver el plan →</button><a class="card-action wa-cta" target="_blank" rel="noopener noreferrer" href="${safeUrl(ONDAShare.whatsapp(e,window.location.href))}" aria-label="Compartir ${title} por WhatsApp">WhatsApp ↗</a><a class="card-action link" target="_blank" rel="noopener noreferrer" href="${safeUrl(e.sourceUrl)}">Fuente ↗</a></div></div>
  </article>`}
function renderRecs(){const x=selectRecs();const area=$('recommendations');if(!area)return;
 $('recs-summary').textContent=x.length?`${x.length} ${x.length===1?'idea':'ideas'} reales para tu búsqueda. Elegidas por fecha, zona y categoría.`:'No encontramos propuestas confirmadas con estos filtros.';
 const assigned=activeVisualPlan('recommendations');
 area.innerHTML=x.length?x.map((e,i)=>recCard(e,i,assigned.get(e.id))).join(''):`<div class="loading"><strong>No encontramos una opción adecuada ahora.</strong><p>Probá «Próximos días» o «Sorprendeme». Nunca inventamos eventos para completar las tres recomendaciones.</p></div>`;
}
function eventCard(e,visualOverride){const visual=visualOverride||VISUALS.forEvent(e);const cover=editorialCover(e,visual);const visualClass=visual.src?('event-visual has-art'+(visual.scope==='identidad'?' has-brand':visual.scope==='foto'?' has-photo':'')):'event-visual has-editorial';const day=e.kind==='exposicion'?'↗':new Date(e.date+'T12:00:00Z').getUTCDate();return `<article class="event-card"><div class="${visualClass}" style="${colors(e)}">${cover}<div class="ev-category">${escapeHtml(e.category)}</div><div class="ev-date">${day}<small>${escapeHtml(month(e.kind==='exposicion'?e.endDate:e.date))}</small></div></div><div class="event-content"><h3>${escapeHtml(e.title)}</h3><div class="event-meta">⌖ ${escapeHtml(e.city)} · ${escapeHtml(dateLabel(e))} ${formatChip(e)}</div><p>${escapeHtml(e.description)}</p><div class="event-meta">${escapeHtml(priceLabel(e))} · ${escapeHtml(ticketLabel(e))}</div><div class="event-meta">${escapeHtml(freshnessLabel(e))}</div><div class="event-actions">${ticketAction(e)}<button type="button" class="card-action detail-btn" data-id="${escapeHtml(e.id)}">Ver detalles →</button><a class="card-action wa-cta" target="_blank" rel="noopener noreferrer" href="${safeUrl(ONDAShare.whatsapp(e,window.location.href))}" aria-label="Compartir ${escapeHtml(e.title)} por WhatsApp">WhatsApp ↗</a></div></div></article>`}
function agendaItems(){return state.events.filter(e=>current(e)&&(state.category==='todos'||state.category===e.category)&&(!state.free||e.priceTier==='gratis')&&(!state.query||[e.title,e.city,e.place,e.description,e.category,e.sourceName,e.ticketera,e.cost,FMT?.classify(e)?.label||'',...(Array.isArray(e.tags)?e.tags:[])].join(' ').toLocaleLowerCase('es-UY').includes(state.query.toLocaleLowerCase('es-UY')))).sort((a,b)=>a.date.localeCompare(b.date)||String(a.time||'').localeCompare(String(b.time||'')))}
function renderAgenda(){const all=agendaItems();$('resultCount').textContent=`${all.length} ${all.length===1?'propuesta':'propuestas'} próximas`; const assigned=activeVisualPlan('agenda');$('eventGrid').innerHTML=all.slice(0,state.shown).map(e=>eventCard(e,assigned.get(e.id))).join('');$('empty').classList.toggle('hidden',all.length!==0);$('loadMore').classList.toggle('hidden',all.length<=state.shown)}
function findEvent(id){return state.events.find(e=>e.id===id)}
let focusBefore=null;
function openDetail(id){const e=findEvent(id);if(!e)return;focusBefore=document.activeElement;state.modal=id;const ticket=TIX.access(e);const t=ticket.hasDirectTicket?`<a href="${safeUrl(ticket.url)}" class="primary" target="_blank" rel="noopener noreferrer">${escapeHtml(ticket.label)}</a>`:'';
 const visual=activeVisualPlan('recommendations').get(e.id)||activeVisualPlan('agenda').get(e.id)||VISUALS.forEvent(e);
 const {curated,final}=visualBackups(e,visual);
 const photoCredit=visual.scope==='foto'?(visual.sourceUrl?'<a href="'+safeUrl(visual.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Imagen: '+escapeHtml(visual.credit)+'</a> · filtro ONDA':'Imagen del evento · filtro ONDA'):escapeHtml(visualLabel(visual));
 const modalCover=visual.src
  ?'<figure class="modal-visual'+(visual.scope==='foto'?' has-photo':'')+'"><img class="event-art-img'+(visual.scope==='foto'?' onda-photo':'')+'" src="'+escapeHtml(visual.src)+'" data-fallback-src="'+escapeHtml(curated.src)+'" data-fallback-kind="'+escapeHtml(curated.scope)+'" data-fallback-caption="'+escapeHtml(visualLabel(curated))+'" data-final-src="'+escapeHtml(final.src)+'" alt="'+escapeHtml(visual.caption)+'" decoding="async"><figcaption>'+photoCredit+'</figcaption></figure>'
  :'<div class="modal-visual modal-editorial" style="'+colors(e)+'"><span>ONDA / '+escapeHtml(e.category)+'</span><strong>'+escapeHtml(e.title)+'</strong><small>Portada editorial · no es el afiche oficial</small></div>';
 const gmaps=ONDAShare.directions(e);
 const startedNote=ET.timingNote(e);
 $('modalBody').innerHTML=`${modalCover}<div class="overline">${escapeHtml(e.category)} · ${escapeHtml(e.city)}</div><h2 id="modalTitle">${escapeHtml(e.title)}</h2><p>${escapeHtml(e.description)}</p><div class="modal-grid"><div><strong>FECHA</strong>${escapeHtml(dateLabel(e))}</div><div><strong>HORA</strong>${escapeHtml(e.time?e.time+' h'+(e.endTime?' — '+e.endTime+' h':''):'Horario a confirmar')}</div><div><strong>LUGAR</strong>${escapeHtml(whereLabel(e))}</div><div><strong>PRECIO</strong>${escapeHtml(priceLabel(e))}</div></div>
 ${startedNote?`<div class="modal-note"><strong>Horario:</strong> ${escapeHtml(startedNote)}</div>`:''}<div class="modal-note"><strong>Antes de salir:</strong> ${escapeHtml(e.note||'Comprobá posibles cambios de horario y disponibilidad en la fuente.')}${e.weatherSensitive?' · Si es al aire libre, consultá el pronóstico.':''}</div>
 <div class="modal-links">${t}<a class="wa-share-link" target="_blank" rel="noopener noreferrer" href="${safeUrl(ONDAShare.whatsapp(e,window.location.href))}">Compartir por WhatsApp ↗</a><a target="_blank" rel="noopener noreferrer" href="${safeUrl(gmaps)}">Cómo llegar ↗</a><a target="_blank" rel="noopener noreferrer" href="${safeUrl(e.sourceUrl)}">Fuente original ↗</a></div><p>Fuente: ${escapeHtml(e.sourceName)} · Ticketera: ${escapeHtml(e.ticketera||e.ticketingPlatform||'no informada')} · ${escapeHtml(freshnessLabel(e))} · Estado: ${escapeHtml(e.status||'a confirmar')}.</p><p><small>La publicación original es la referencia para reprogramaciones, suspensión o cambios de precio. ONDA no vende entradas.</small></p>`;
 const overlay=$('overlay');overlay.classList.remove('hidden');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('closeModal').focus();
}
function closeDetail(){if(state.modal===null)return;state.modal=null;$('overlay').classList.add('hidden');$('overlay').setAttribute('aria-hidden','true');document.body.style.overflow='';if(focusBefore?.focus)focusBefore.focus()}
function initChoices(wrapper,attr,key,callback){$(wrapper).addEventListener('click',ev=>{const b=ev.target.closest(`[${attr}]`);if(!b)return;state[key]=b.dataset[attr==='data-time'?'time':'mood'];$(wrapper).querySelectorAll(`[${attr}]`).forEach(el=>{const a=el===b;el.classList.toggle('active',a);el.setAttribute('aria-pressed',String(a))});callback()})}
function init(){initChoices('whenChoices','data-time','when',renderRecs);initChoices('moodChoices','data-mood','mood',renderRecs);
 $('zoneSelect').addEventListener('change',ev=>{state.zone=ev.target.value;renderRecs()});$('categorySelect').addEventListener('change',ev=>{state.category=ev.target.value;state.shown=9;renderAgenda()});$('freeOnly').addEventListener('change',ev=>{state.free=ev.target.checked;state.shown=9;renderAgenda()});$('searchInput').addEventListener('input',ev=>{state.query=ev.target.value.trim();state.shown=9;renderAgenda()});$('loadMore').addEventListener('click',()=>{state.shown+=9;renderAgenda()});$('recommendBtn').addEventListener('click',()=>{$('recomendaciones').scrollIntoView({behavior:'smooth',block:'start'});renderRecs()});$('resetFilters').addEventListener('click',()=>{state.category='todos';state.free=false;state.query='';state.shown=9;$('categorySelect').value='todos';$('freeOnly').checked=false;$('searchInput').value='';renderAgenda()});
 document.addEventListener('click',ev=>{const btn=ev.target.closest('.detail-btn');if(btn)openDetail(btn.dataset.id)});$('closeModal').addEventListener('click',closeDetail);$('overlay').addEventListener('click',e=>{if(e.target===$('overlay'))closeDetail()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDetail()});lastLayout=layoutKey();window.addEventListener('resize',refreshLayout)}
let lastLayout='';
function layoutKey(){return window.innerWidth<=720?'movil':window.innerWidth<=1050?'tablet':'escritorio'}
function refreshLayout(){const k=layoutKey();if(k===lastLayout)return;lastLayout=k;if(state.events.length){renderRecs();renderAgenda()}}
let lastClockSignature = '';
function refreshTimeSensitiveUI(){
 if (!state.events.length) return;
 const signature=uyToday()+'|'+state.events.filter(current).map(e=>e.id).join('|');
 if (signature===lastClockSignature) return;
 lastClockSignature=signature;
 renderRecs();renderAgenda();
 if (state.modal && !current(findEvent(state.modal))) closeDetail();
}
function showDataStatus(meta) {
 const label=$('dataStatus');if(!label)return;
 if(!meta?.automaticIngestionEnabled || !meta?.activeConnectors) {
  label.textContent='Catálogo de prueba · sin fuentes automáticas activas · confirmá en la fuente original.';
  return;
 }
 const date=meta.lastSuccessfulRunAt?new Intl.DateTimeFormat('es-UY',{dateStyle:'short',timeStyle:'short',timeZone:'America/Montevideo'}).format(new Date(meta.lastSuccessfulRunAt)):'sin fecha';
 label.textContent=`${meta.activeConnectors} ${meta.activeConnectors===1?'fuente automatizada':'fuentes automatizadas'} · última actualización: ${date} · confirmá cambios en la fuente`;
}
async function refreshCatalog() {
 if(document.getElementById('embedded-events'))return;
 try {
  const [feed,meta]=await Promise.all([fetch('./data/events.json',{cache:'no-store'}),fetch('./data/meta.json',{cache:'no-store'})]);
  if(!feed.ok||!meta.ok)return;
  const [items,info]=await Promise.all([feed.json(),meta.json()]);
  if(!Array.isArray(items)||items.some(e=>!e.id||!e.date||!e.sourceUrl))return;
  showDataStatus(info);
  const signature=JSON.stringify(items);
  if(signature===state.lastDataSync)return;
  state.lastDataSync=signature;
  state.events=attachImages(items);
  const refreshOptions=(selectId,values)=>{
   const el=$(selectId),selected=el.value;
   [...el.options].slice(1).forEach(o=>o.remove());
   for(const val of values){const opt=document.createElement('option');opt.value=val;opt.textContent=val;el.append(opt)}
   el.value=values.includes(selected)?selected:'todos';
  };
  refreshOptions('zoneSelect',[...new Set(items.map(e=>e.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')));
  refreshOptions('categorySelect',[...new Set(items.map(e=>e.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')));
  state.zone=$('zoneSelect').value;state.category=$('categorySelect').value;
  lastClockSignature='';refreshTimeSensitiveUI();
 }catch(error){console.warn('ONDA: no fue posible comprobar actualizaciones; se conserva el último catálogo válido',error)}
}
async function start(){
 init();
 try{
  const mediaResponse=await fetch('./data/event-images.json',{cache:'no-store'});
  if(mediaResponse.ok){
   const media=await mediaResponse.json();
   if(media&&typeof media==='object'&&!Array.isArray(media))state.imageIndex=media;
  }
 }catch(error){console.warn('ONDA: sin catálogo extra de fotos, se usa biblioteca visual',error)}
 try{const embedded=document.getElementById('embedded-events');let data;if(embedded){data=JSON.parse(embedded.textContent)}else{const res=await fetch('./data/events.json',{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);data=await res.json()};if(!Array.isArray(data))throw Error('Formato inesperado');state.events=attachImages(data);const cities=[...new Set(data.map(e=>e.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));for(const city of cities){const o=document.createElement('option');o.value=city;o.textContent=city;$('zoneSelect').append(o)}const cats=[...new Set(data.map(e=>e.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));for(const cat of cats){const o=document.createElement('option');o.value=cat;o.textContent=cat;$('categorySelect').append(o)}refreshTimeSensitiveUI();const linkedPlan=new URLSearchParams(window.location.search).get('plan');if(linkedPlan&&findEvent(linkedPlan))openDetail(linkedPlan);if(embedded){showDataStatus({automaticIngestionEnabled:false})}else{refreshCatalog()}}catch(err){$('recommendations').innerHTML='<div class="loading">No pudimos cargar la agenda. Revisá la conexión e intentá de nuevo.</div>';$('eventGrid').innerHTML='';$('resultCount').textContent='Agenda no disponible';console.error('ONDA: error cargando agenda',err)}}
// Recorte móvil/escritorio: si cambia la cantidad de columnas, se recalculan vecinos.
let visualLayout=window.innerWidth<=720?1:window.innerWidth<=1050?2:3;
window.addEventListener('resize',()=>{
 const layout=window.innerWidth<=720?1:window.innerWidth<=1050?2:3;
 if(layout===visualLayout)return;
 visualLayout=layout;
 if(state.events.length){renderRecs();renderAgenda()}
});
// Foto rota: ilustración compatible -> serigrafía ONDA -> tarjeta tipográfica.
document.addEventListener('error',ev=>{
 const img=ev.target;
 if(!img?.classList?.contains('event-art-img'))return;
 const choices=[
  {src:img.dataset.fallbackSrc,kind:img.dataset.fallbackKind,caption:img.dataset.fallbackCaption},
  {src:img.dataset.finalSrc,kind:'identidad',caption:'Portada ONDA · no es el afiche oficial'}
 ];
 let step=Number(img.dataset.backupStage||0);
 while(step<choices.length){
  const next=choices[step++];
  if(!next.src||next.src===img.getAttribute('src'))continue;
  img.dataset.backupStage=String(step);
  img.classList.remove('onda-photo');
  img.parentElement?.classList.remove('has-photo');
  img.src=next.src;
  img.alt=next.kind==='identidad'?'Identidad ONDA; no representa el evento.':'Ilustración ONDA, no fotografía del evento.';
  const badge=img.parentElement?.querySelector('.visual-disclaimer');
  if(badge){if(next.kind==='identidad')badge.remove();else{badge.textContent='Ilustración ONDA';badge.classList.remove('photo-label')}}
  const caption=img.parentElement?.querySelector('figcaption');
  if(caption)caption.textContent=next.caption||'Portada ONDA';
  return;
 }
 const tile=document.createElement('span');
 tile.className='editorial-cover brand-cover fb-01';
 tile.setAttribute('role','img');tile.setAttribute('aria-label','Identidad ONDA; no representa el evento');
 tile.innerHTML='<span class="brand-lettering" aria-hidden="true">ONDA</span>';
 img.replaceWith(tile);
},true);
start();
// Mantener vigente la vista aunque el usuario deje ONDA abierta toda la noche.
setInterval(refreshTimeSensitiveUI, 60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshTimeSensitiveUI()});
window.addEventListener('pageshow',refreshTimeSensitiveUI);
window.addEventListener('focus',refreshTimeSensitiveUI);

// Actualizar cambios en fichas sin recargar HTML; no repetir solicitudes excesivas.
setInterval(refreshCatalog,15*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCatalog()});
