// ONDA · Radar secundario: saneamiento de hallazgos, SIN publicación automática.
// Un hallazgo de una tarea de IA no equivale a un evento verificado.
const CATEGORIES = new Set(['Música','Cultura','Fiestas','Gastronomía','Aire libre','Deporte','Bienestar','Encuentros','Familia','Cine','Teatro','Ferias','Otros']);
const trim=x=>typeof x==='string'?x.trim():'';
const httpsUrl=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}};
const isoDate=x=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;
  const d=new Date(x+'T12:00:00Z');
  return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===x;
};
const uyDay=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
const clean=x=>trim(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const timeOK=x=>x===null||x===undefined||/^([01]\d|2[0-3]):[0-5]\d$/.test(x);

export function inspectRadarBatch(batch,{now=new Date().toISOString()}={}){
  if(!batch||typeof batch!=='object'||Array.isArray(batch))throw Error('Se requiere objeto JSON');
  if(batch.schemaVersion!==1)throw Error('Esquema de radar no compatible');
  if(batch.origin!=='chatgpt-radar-onda')throw Error('Origen de radar desconocido');
  if(!Array.isArray(batch.events)||batch.events.length>100)throw Error('events debe ser lista de 0–100');
  if(!Number.isFinite(Date.parse(now)))throw Error('Instante de corrida inválido');
  const seen=new Set(), candidates=[], rejected=[];
  const today=uyDay(now);
  batch.events.forEach((raw,index)=>{
    const issues=[];
    if(!raw||typeof raw!=='object'||Array.isArray(raw)){rejected.push({index,issues:['Ficha inválida']});return}
    const title=trim(raw.title), city=trim(raw.city), place=trim(raw.place);
    const date=trim(raw.date),time=raw.time??null;
    const sourceUrl=httpsUrl(raw.sourceUrl),officialUrl=raw.officialUrl?httpsUrl(raw.officialUrl):null;
    const category=trim(raw.category), discoveredAt=trim(raw.discoveredAt);
    if(title.length<4||title.length>200)issues.push('Título incompleto');
    if(city.length<2||city.length>80)issues.push('Localidad incompleta');
    if(place.length<2||place.length>160)issues.push('Lugar incompleto');
    if(!isoDate(date))issues.push('Fecha inválida o ausente');
    if(!timeOK(time))issues.push('Hora inválida (usar HH:mm o null)');
    if(!sourceUrl||raw.officialUrl&&!officialUrl)issues.push('URL de fuente inválida');
    if(!category||!CATEGORIES.has(category))issues.push('Categoría desconocida');
    if(!discoveredAt||!Number.isFinite(Date.parse(discoveredAt)))issues.push('Fecha de descubrimiento inválida');
    if(issues.length){rejected.push({index,issues});return}
    const key=[clean(title),date,clean(city),clean(place),time||''].join('|');
    if(seen.has(key)){rejected.push({index,issues:['Duplicado dentro del lote']});return}
    seen.add(key);
    const sources=Array.isArray(raw.evidence)?raw.evidence.filter(e=>e&&httpsUrl(e.url)&&trim(e.field)&&trim(e.excerpt)).slice(0,8):[];
    const status=(date<today?'caducado':!officialUrl||sources.length===0?'por_verificar':'candidato_documentado');
    candidates.push({
      title,date,time,place,city,category,sourceUrl,officialUrl,
      discoveredAt,price:trim(raw.price)||null,evidence:sources.map(e=>({field:trim(e.field),url:httpsUrl(e.url),excerpt:trim(e.excerpt).slice(0,500)})),
      status,reviewRequired:true,publishable:false,
      note:status==='caducado'?'Fecha anterior a hoy en Uruguay':status==='por_verificar'?'Requiere fuente oficial y evidencia':'Requiere corroboración editorial y permisos de fuente'
    });
  });
  return {origin:batch.origin,schemaVersion:1,runAt:now,received:batch.events.length,accepted:candidates.length,rejectedCount:rejected.length,candidates,rejected,automaticPublication:false};
}
