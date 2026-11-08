// ONDA: validación pura de pistas descubiertas por un radar de investigación.
// NUNCA convierte ni publica eventos; sólo produce una bandeja de revisión.
const text = v => String(v ?? '').trim();
const folded = v => text(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function validDate(s) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const d=new Date(s+'T12:00:00Z');
  return !Number.isNaN(d.valueOf()) && d.toISOString().startsWith(s);
}
function httpsUrl(s) {
  try {
    const u=new URL(s);
    return u.protocol==='https:' && !u.username && !u.password && !['localhost','127.0.0.1'].includes(u.hostname) ? u.href : null;
  } catch { return null; }
}
const signature = e => [folded(e.title),e.date,folded(e.city)].join('|');
export function evaluateRadarInboxes({inboxes,manual=[],automatic=[],now=new Date().toISOString()}){
  if(!Array.isArray(inboxes)||!Array.isArray(manual)||!Array.isArray(automatic))throw Error('Datos inválidos');
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
  const existing=new Set([...manual,...automatic].map(signature));
  const seenKeys=new Set(), seenSignals=new Set();
  const issues=[],leads=[];
  for(const batch of inboxes){
    const file=text(batch.file||'sin-archivo');
    const d=batch.data;
    if(!d || d.schemaVersion!=='1.0' || d.ingestionStatus!=='review-only' || d.published!==false || !Array.isArray(d.candidates)){
      issues.push({file,reason:'cabecera de bandeja inválida o intento de publicación'});
      continue;
    }
    for(const c of d.candidates){
      const errors=[];
      if(!c || typeof c!=='object'){issues.push({file,reason:'registro no es objeto'});continue}
      const key=text(c.key),url=httpsUrl(c.sourceUrl),date=text(c.date),title=text(c.title),city=text(c.city);
      if(!key || key.length>120 || !/^[a-z0-9-]+$/.test(key))errors.push('identificador incorrecto');
      if(!url)errors.push('fuente HTTPS inválida');
      if(!validDate(date))errors.push('fecha inválida');
      if(title.length<5 || !city)errors.push('título/localidad insuficiente');
      if(c.publicationAllowed!==false || c.verificationStatus!=='descubierto')errors.push('estado editorial incorrecto');
      if(errors.length){issues.push({file,key,reason:errors.join('; ')});continue}
      const dedupeKey=url.split('?')[0]+'|'+date;
      let status='pendiente-de-verificar';
      if(date<day)status='vencido';
      else if(existing.has(signature(c)) || seenKeys.has(key) || seenSignals.has(dedupeKey))status='posible-duplicado';
      seenKeys.add(key);seenSignals.add(dedupeKey);
      leads.push({key,title,date,city,venue:text(c.venue),category:text(c.category),sourceUrl:url,status,sourceFile:file});
    }
  }
  return {
    schemaVersion:'1.0',at:now,mode:'review-only',published:false,sourceFiles:inboxes.length,
    total:leads.length,pending:leads.filter(x=>x.status==='pendiente-de-verificar').length,
    expired:leads.filter(x=>x.status==='vencido').length,
    possibleDuplicates:leads.filter(x=>x.status==='posible-duplicado').length,
    invalid:issues.length,leads,issues
  };
}
