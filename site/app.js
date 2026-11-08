'use strict';
// ONDA V2 — curaduría experimental basada en datos, nunca en experiencias inventadas.
const $ = id => document.getElementById(id);
const ET = globalThis.ONDAEventTime;
if (!ET) throw new Error('ONDAEventTime no disponible: cargar event-time.js antes de app.js');
const state = {lastDataSync:null,events:[],when:'finde',mood:'todos',zone:'todos',category:'todos',free:false,query:'',shown:9,modal:null};
const escapeHtml = x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = x=>{try{const u=new URL(x);return u.protocol==='https:'?escapeHtml(u.href):'#'}catch{return '#'}};
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
function colors(e){const a=COLORS[e.category]||['#eae3d8','#182436','#f86959'];return `--poster-bg:${a[0]};--poster-ink:${a[1]};--poster-shape:${a[2]}`}
function dateLabel(e){return e.kind==='exposicion'&&e.endDate?`Hasta el ${fmtDate(e.endDate)}`:!e.endDate||e.date===e.endDate?fmtCompact(e.date):`${fmtCompact(e.date)} al ${fmtDate(e.endDate)}`}
function whereLabel(e){return `${e.place} · ${e.city}`}
function priceLabel(e){return e.priceTier==='gratis'?'Gratis / con reserva si corresponde':e.cost||'Precio a consultar'}
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
function recCard(e,i){const title=escapeHtml(e.title);const index=String(i+1).padStart(2,'0');const t=e.category.toUpperCase();return `<article class="rec-card">
  <div class="rec-poster" style="${colors(e)}"><span class="tag">${escapeHtml(t)}</span><span class="poster-head">${escapeHtml(e.city)}</span><span class="poster-index">ONDA / ${index}</span></div>
  <div class="rec-body"><div class="rec-overline">SELECCIÓN ${index} · ${escapeHtml(dateLabel(e))}</div><h3>${title}</h3><div class="rec-meta">⌖ ${escapeHtml(whereLabel(e))}</div>
  <div class="editor-note"><strong>LA MIRADA DE ONDA</strong>${escapeHtml(reason(e))}</div>
  <div class="rec-buttons"><button class="card-action detail-btn" data-id="${escapeHtml(e.id)}" type="button">Ver el plan →</button><a class="card-action link" target="_blank" rel="noopener noreferrer" href="${safeUrl(e.sourceUrl)}">Fuente ↗</a></div></div>
  </article>`}
function renderRecs(){const x=selectRecs();const area=$('recommendations');if(!area)return;
 $('recs-summary').textContent=x.length?`${x.length} ${x.length===1?'idea':'ideas'} reales para tu búsqueda. Elegidas por fecha, zona y categoría.`:'No encontramos propuestas confirmadas con estos filtros.';
 area.innerHTML=x.length?x.map(recCard).join(''):`<div class="loading"><strong>No encontramos una opción adecuada ahora.</strong><p>Probá «Próximos días» o «Sorprendeme». Nunca inventamos eventos para completar las tres recomendaciones.</p></div>`;
}
function eventCard(e){const day=e.kind==='exposicion'?'↗':new Date(e.date+'T12:00:00Z').getUTCDate();return `<article class="event-card"><div class="event-visual" style="${colors(e)}"><div class="ev-category">${escapeHtml(e.category)}</div><div class="ev-date">${day}<small>${escapeHtml(month(e.kind==='exposicion'?e.endDate:e.date))}</small></div></div><div class="event-content"><h3>${escapeHtml(e.title)}</h3><div class="event-meta">⌖ ${escapeHtml(e.city)} · ${escapeHtml(dateLabel(e))}</div><p>${escapeHtml(e.description)}</p><div class="event-meta">${escapeHtml(e.cost||'Consultar detalles')}</div><button type="button" class="card-action detail-btn" data-id="${escapeHtml(e.id)}">Ver detalles y fuente →</button></div></article>`}
function agendaItems(){return state.events.filter(e=>current(e)&&(state.category==='todos'||state.category===e.category)&&(!state.free||e.priceTier==='gratis')&&(!state.query||[e.title,e.city,e.place,e.description].join(' ').toLocaleLowerCase('es-UY').includes(state.query.toLocaleLowerCase('es-UY')))).sort((a,b)=>a.date.localeCompare(b.date)||String(a.time||'').localeCompare(String(b.time||'')))}
function renderAgenda(){const all=agendaItems();$('resultCount').textContent=`${all.length} ${all.length===1?'propuesta':'propuestas'} próximas`; $('eventGrid').innerHTML=all.slice(0,state.shown).map(eventCard).join('');$('empty').classList.toggle('hidden',all.length!==0);$('loadMore').classList.toggle('hidden',all.length<=state.shown)}
function findEvent(id){return state.events.find(e=>e.id===id)}
let focusBefore=null;
function openDetail(id){const e=findEvent(id);if(!e)return;focusBefore=document.activeElement;state.modal=id;const t=e.ticketUrl?`<a href="${safeUrl(e.ticketUrl)}" class="primary" target="_blank" rel="noopener noreferrer">${e.priceTier==='gratis'?'Reservar':'Ver entradas'} ↗</a>`:'';
 const gmaps=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address||e.place+', '+e.city+', Uruguay')}`;
 const startedNote=ET.timingNote(e);
 $('modalBody').innerHTML=`<div class="overline">${escapeHtml(e.category)} · ${escapeHtml(e.city)}</div><h2 id="modalTitle">${escapeHtml(e.title)}</h2><p>${escapeHtml(e.description)}</p><div class="modal-grid"><div><strong>FECHA</strong>${escapeHtml(dateLabel(e))}</div><div><strong>HORA</strong>${escapeHtml(e.time?e.time+' h'+(e.endTime?' — '+e.endTime+' h':''):'Horario a confirmar')}</div><div><strong>LUGAR</strong>${escapeHtml(whereLabel(e))}</div><div><strong>PRECIO</strong>${escapeHtml(priceLabel(e))}</div></div>
 ${startedNote?`<div class="modal-note"><strong>Horario:</strong> ${escapeHtml(startedNote)}</div>`:''}<div class="modal-note"><strong>Antes de salir:</strong> ${escapeHtml(e.note||'Comprobá posibles cambios de horario y disponibilidad en la fuente.')}${e.weatherSensitive?' · Si es al aire libre, consultá el pronóstico.':''}</div>
 <div class="modal-links">${t}<a target="_blank" rel="noopener noreferrer" href="${safeUrl(e.sourceUrl)}">Ver publicación original ↗</a><a target="_blank" rel="noopener noreferrer" href="${safeUrl(gmaps)}">Cómo llegar ↗</a></div><p>Fuente: ${escapeHtml(e.sourceName)} · Revisado: ${escapeHtml(e.checkedAt||'sin fecha')} · Estado: ${escapeHtml(e.status||'a confirmar')}.</p><p><small>La publicación original es la referencia para reprogramaciones, suspensión o cambios de precio. ONDA no vende entradas.</small></p>`;
 const overlay=$('overlay');overlay.classList.remove('hidden');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('closeModal').focus();
}
function closeDetail(){if(state.modal===null)return;state.modal=null;$('overlay').classList.add('hidden');$('overlay').setAttribute('aria-hidden','true');document.body.style.overflow='';if(focusBefore?.focus)focusBefore.focus()}
function initChoices(wrapper,attr,key,callback){$(wrapper).addEventListener('click',ev=>{const b=ev.target.closest(`[${attr}]`);if(!b)return;state[key]=b.dataset[attr==='data-time'?'time':'mood'];$(wrapper).querySelectorAll(`[${attr}]`).forEach(el=>{const a=el===b;el.classList.toggle('active',a);el.setAttribute('aria-pressed',String(a))});callback()})}
function init(){initChoices('whenChoices','data-time','when',renderRecs);initChoices('moodChoices','data-mood','mood',renderRecs);
 $('zoneSelect').addEventListener('change',ev=>{state.zone=ev.target.value;renderRecs()});$('categorySelect').addEventListener('change',ev=>{state.category=ev.target.value;state.shown=9;renderAgenda()});$('freeOnly').addEventListener('change',ev=>{state.free=ev.target.checked;state.shown=9;renderAgenda()});$('searchInput').addEventListener('input',ev=>{state.query=ev.target.value.trim();state.shown=9;renderAgenda()});$('loadMore').addEventListener('click',()=>{state.shown+=9;renderAgenda()});$('recommendBtn').addEventListener('click',()=>{$('recomendaciones').scrollIntoView({behavior:'smooth',block:'start'});renderRecs()});$('resetFilters').addEventListener('click',()=>{state.category='todos';state.free=false;state.query='';state.shown=9;$('categorySelect').value='todos';$('freeOnly').checked=false;$('searchInput').value='';renderAgenda()});
 document.addEventListener('click',ev=>{const btn=ev.target.closest('.detail-btn');if(btn)openDetail(btn.dataset.id)});$('closeModal').addEventListener('click',closeDetail);$('overlay').addEventListener('click',e=>{if(e.target===$('overlay'))closeDetail()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDetail()})}
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
  state.events=items;
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
async function start(){init();try{const embedded=document.getElementById('embedded-events');let data;if(embedded){data=JSON.parse(embedded.textContent)}else{const res=await fetch('./data/events.json',{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);data=await res.json()};if(!Array.isArray(data))throw Error('Formato inesperado');state.events=data;const cities=[...new Set(data.map(e=>e.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));for(const city of cities){const o=document.createElement('option');o.value=city;o.textContent=city;$('zoneSelect').append(o)}const cats=[...new Set(data.map(e=>e.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));for(const cat of cats){const o=document.createElement('option');o.value=cat;o.textContent=cat;$('categorySelect').append(o)}refreshTimeSensitiveUI();if(embedded){showDataStatus({automaticIngestionEnabled:false})}else{refreshCatalog()}}catch(err){$('recommendations').innerHTML='<div class="loading">No pudimos cargar la agenda. Revisá la conexión e intentá de nuevo.</div>';$('eventGrid').innerHTML='';$('resultCount').textContent='Agenda no disponible';console.error('ONDA: error cargando agenda',err)}}
start();
// Mantener vigente la vista aunque el usuario deje ONDA abierta toda la noche.
setInterval(refreshTimeSensitiveUI, 60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshTimeSensitiveUI()});
window.addEventListener('pageshow',refreshTimeSensitiveUI);
window.addEventListener('focus',refreshTimeSensitiveUI);

// Actualizar cambios en fichas sin recargar HTML; no repetir solicitudes excesivas.
setInterval(refreshCatalog,15*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCatalog()});
