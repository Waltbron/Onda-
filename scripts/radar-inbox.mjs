import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validStatuses = new Set(['discovered','needs_review','verified','rejected','expired','cancelled']);
const domainKinds = new Set(['official','ticketing','municipal','venue']);
const validCategories = new Set(['Cultura','Música','Gastronomía','Fiestas','Aire libre','Deporte','Bienestar','Encuentros','Otros']);
const allowedCities = new Set(['maldonado','punta del este','la barra','manantiales','jose ignacio','punta ballena','piriapolis','san carlos','balneario buenos aires','sauce de portezuelo','solanas','garzon','aigua','pan de azucar','playa verde','punta colorada']);

export function clean(s) {
  return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
export function urlKey(s){
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') return '';
    u.hash='';
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|igshid)/i.test(k)) u.searchParams.delete(k);
    return `${u.hostname.toLowerCase()}${u.pathname.replace(/\/$/,'')}${u.searchParams.size ? '?'+u.searchParams.toString() : ''}`;
  }catch{return ''}
}
export function uyToday(now = new Date()){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
function validLocalDate(s){
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const dt = new Date(`${s}T12:00:00Z`);
  return Number.isFinite(dt.getTime()) && dt.toISOString().slice(0,10)===s;
}
function validate(c){
  const problems = [];
  if (!c || typeof c !== 'object' || Array.isArray(c)) return ['Candidato debe ser un objeto'];
  if (!c.candidate_id || typeof c.candidate_id !== 'string' || c.candidate_id.length<8) problems.push('candidate_id ausente/inválido');
  if (!c.title || typeof c.title !== 'string' || c.title.trim().length<3) problems.push('title ausente/inválido');
  if (!c.source_name || typeof c.source_name !== 'string') problems.push('source_name ausente');
  if (!urlKey(c.source_url)) problems.push('source_url debe ser HTTPS');
  if (!validCategories.has(c.category)) problems.push('category inválida');
  if (!c.city || typeof c.city !== 'string' || !c.city.trim()) problems.push('city ausente');
  if (c.date!=null && !validLocalDate(c.date)) problems.push('date inválida');
  if (!c.observed_at || Number.isNaN(Date.parse(c.observed_at))) problems.push('observed_at inválido');
  if (!validStatuses.has(c.verification_status)) problems.push('verification_status inválido');
  if (!Array.isArray(c.evidence) || !c.evidence.length || c.evidence.some(e=>!e?.assertion || !urlKey(e.url))) problems.push('evidence inválida');
  if (c.time!=null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(c.time)) problems.push('time inválida');
  return problems;
}
export function triageRadar(candidates, existing=[], now = new Date()){
  if(!Array.isArray(candidates)) throw new TypeError('Se espera un array JSON de candidatos');
  const seen = new Set(); const today=uyToday(now);
  const records = candidates.map(c=>{
    const errors=validate(c);
    if(errors.length) return {candidate_id:c?.candidate_id??null,decision:'invalid',reasons:errors};
    const cId=c.candidate_id;
    if(seen.has(cId)) return {candidate_id:cId,decision:'possible_duplicate',reasons:['candidate_id repetido dentro del lote']};
    seen.add(cId);
    const exact = existing.find(e=>urlKey(e.sourceUrl || e.source_url)===urlKey(c.source_url));
    const fuzzy = !exact && existing.find(e=>clean(e.title)===clean(c.title) && clean(e.city)===clean(c.city) && (!c.date||e.date===c.date));
    if(exact || fuzzy) return {candidate_id:cId,decision:'possible_duplicate',existing_id:(exact||fuzzy).id??null,reasons:[exact?'URL canónica coincidente':'título, localidad y fecha potencialmente coincidentes']};
    if(c.verification_status==='cancelled'||c.verification_status==='rejected') return {candidate_id:cId,decision:'hold',reasons:[`estado: ${c.verification_status}`]};
    if(c.date && c.date<today || c.verification_status==='expired') return {candidate_id:cId,decision:'expired',reasons:['evento vencido']};
    const caveats=[];
    if(!c.date) caveats.push('fecha del evento no confirmada');
    if(!allowedCities.has(clean(c.city))) caveats.push('localidad fuera de las zonas iniciales; confirmar cobertura');
    if(c.verification_status!=='verified') caveats.push('validación pendiente');
    if(!domainKinds.has(c.source_kind)) caveats.push('fuente primaria no confirmada');
    if(c.date && !c.evidence.some(e=>/fecha|date|programa|horario|schedule|día|dia/i.test(e.assertion))) caveats.push('evidencia explícita de fecha insuficiente');
    return {candidate_id:cId,decision:caveats.length?'needs_review':'ready_for_review',reasons:caveats};
  });
  const counts={};for(const r of records)counts[r.decision]=(counts[r.decision]||0)+1;
  return {generated_at:now.toISOString(),timezone:'America/Montevideo',mode:'review_only',published:0,candidates:candidates.length,counts,results:records};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const input=process.argv[2];
  if(!input){console.error('Uso: node scripts/radar-inbox.mjs <candidatos.json> [salida.json]');process.exitCode=2}
  else{
    try{
      const candidates=JSON.parse(fs.readFileSync(input,'utf8'));
      const manual=JSON.parse(fs.readFileSync(path.join(root,'data/manual.json'),'utf8'));
      const automatic=JSON.parse(fs.readFileSync(path.join(root,'data/automatic.json'),'utf8'));
      const report=triageRadar(candidates,[...manual,...automatic]);
      const json=JSON.stringify(report,null,2)+'\n';
      if(process.argv[3])fs.writeFileSync(process.argv[3],json);else process.stdout.write(json);
      if((report.counts.invalid||0)>0)process.exitCode=1;
    }catch(e){console.error(`Error: ${e.message}`);process.exitCode=1}
  }
}
