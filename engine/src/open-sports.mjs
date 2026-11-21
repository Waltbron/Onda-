// ONDA Lab · Fuente abierta, un piloto real de datos deportivos CC BY 4.0.
// API GitHub (no scraping de HTML ni imágenes de terceros).
const REPO='suzrik/data.events.uy';
const AREA=/maldonado|punta-del-este|punta-del|san-carlos|piriapolis|piriapolis|la-barra|jose-ignacio|caracoles|rocha|pan-de-azucar|pde|manantiales|sauce-de-portezuelo|balneario-buenos-aires|laguna-garzon|garzon|solanas|sierra-de-las-animas/i;
const LOCAL=new Set(['maldonado','punta del este','san carlos','piriapolis','punta ballena','la barra','jose ignacio','aigua','pan de azucar','garzon','solanas','las flores','rocha','la paloma','sauce de portezuelo','balneario buenos aires','manantiales']);
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const clean=x=>{let s=String(x??'').trim();if(s.startsWith('"')&&s.endsWith('"')){try{return JSON.parse(s)}catch{return s.slice(1,-1)}}if(s.startsWith("'")&&s.endsWith("'"))return s.slice(1,-1).replace(/''/g,"'");return s};
const ymd=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().startsWith(s);
const safe=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}};
export function parseSportsYaml(input){
  if(typeof input!=='string'||input.length>30000)throw Error('YAML fuente inválido o excesivo');
  const out={links:{},description:{}};
  let section='';
  for(const l of input.split(/\r?\n/)){
    if(!l.trim()||l.trim().startsWith('#'))continue;
    const child=/^  ([a-z_]+):\s*(.*)$/.exec(l);
    if(child){if((section==='links'||section==='description')&&child[2]!=='|'&&child[2]!=='>')out[section][child[1]]=clean(child[2]);continue}
    const top=/^([a-z_]+):\s*(.*)$/.exec(l);
    if(top){section=top[1];if(top[2]!==''&&top[2]!=='|'&&top[2]!=='>')out[section]=clean(top[2]);else if(section!=='links'&&section!=='description')section='';}
  }
  return out;
}
const sportTags={run:'running',trail:'trail',road:'ciclismo',mtb:'mountain-bike',gravel:'gravel',tri:'triatlon',swim:'natacion',roll:'patinaje'};
const sportList=s=>String(s||'').replace(/[\[\]]/g,'').split(',').map(x=>fold(x)).filter(Boolean);
export function sportsCandidate(file,source,now){
  const item=parseSportsYaml(file.content),date=String(item.date||'').trim(),endDate=String(item.end_date||date).trim();
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
  const ceiling=new Date(now);ceiling.setUTCDate(ceiling.getUTCDate()+400);
  if(!ymd(date)||!ymd(endDate)||endDate<today||date>ceiling.toISOString().slice(0,10))return null;
  if(fold(item.status)==='tentative'||!LOCAL.has(fold(item.city)))return null;
  const name=String(item.name||'').trim();
  const tags=sportList(item.sport).map(x=>sportTags[x]).filter(Boolean);
  if(name.length<5||!tags.length)return null;
  const venue=String(item.venue||item.city).trim();
  const time=/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time||'')?item.time:null;
  const official=safe(item.links.site)||safe(item.links.instagram)||safe(item.links.facebook);
  if(!official)return null;
  const ticket=safe(item.links.register);
  const sourceUrl='https://github.com/'+REPO+'/blob/main/'+file.path;
  const dist=String(item.distances||'').replace(/^\[|\]$/g,'').trim();
  const detail=[dist?'Modalidades/distancias: '+dist+'.':'',item.organizer?'Organiza: '+item.organizer+'.':''].filter(Boolean).join(' ');
  return {sourceId:source.id,sourceName:source.name,sourceItemId:file.path,sourceUrl,title:name,
    date,endDate,time,endTime:null,place:venue,city:item.city,category:'Deporte',kind:'evento',
    tags:['deporte',...tags],ticketUrl:ticket,organizerUrl:official,
    description:detail||'Actividad deportiva en '+item.city+'.',
    note:'Datos de events.uy contributors (CC BY 4.0), revisados por esa comunidad. Confirmá horarios, inscripciones y cambios con el organizador.',
    sourceVerification:'upstream-reviewed-cc-by-4.0',confidence:'B',
    evidence:[{field:'date',text:date,origin:'events.uy YAML con licencia CC BY 4.0'},
      {field:'title',text:name,origin:'events.uy YAML'},
      {field:'organizer',text:official,origin:'enlace declarado por la fuente'}]};
}
export function selectSportsFiles(tree,now){
  if(tree.truncated||!Array.isArray(tree.tree))throw Error('Árbol de datos de origen incompleto');
  const year=new Intl.DateTimeFormat('en-CA',{year:'numeric',timeZone:'America/Montevideo'}).format(new Date(now));
  const paths=tree.tree.filter(x=>x.type==='blob'&&/^events\/\d{4}\/[a-z0-9-]+\.yaml$/.test(x.path)&&AREA.test(x.path)&&
     Number(x.path.split('/')[1])>=Number(year)&&Number(x.path.split('/')[1])<=Number(year)+2);
  if(paths.length>100)throw Error('Demasiados archivos: revisar cobertura antes de ejecutar');
  return paths.map(x=>({path:x.path,sha:x.sha}));
}
export async function fetchOpenSports(source,env={},fetchImpl=fetch,now=new Date().toISOString()){
  if(source.id!=='events-uy-deportes'||source.url!=='https://github.com/suzrik/data.events.uy'||source.expectedHost!=='github.com')throw Error('Configuración de fuente deportiva no autorizada');
  const headers={'Accept':'application/vnd.github+json','User-Agent':'ONDA-Hormiga-Lab/1.0','X-GitHub-Api-Version':'2022-11-28'};
  if(env.GITHUB_TOKEN)headers.Authorization='Bearer '+env.GITHUB_TOKEN;
  async function getJSON(url,maxSize){
    const res=await fetchImpl(url,{headers,signal:AbortSignal.timeout(14000),redirect:'error'});
    if(!res.ok)throw Error('API GitHub HTTP '+res.status);
    const txt=await res.text();
    if(txt.length>maxSize)throw Error('Respuesta origen excesiva');
    return JSON.parse(txt);
  }
  try{
    const tree=await getJSON('https://api.github.com/repos/'+REPO+'/git/trees/main?recursive=1',250000);
    const files=selectSportsFiles(tree,now);
    const collected=[];
    let offset=0;
    // Concurrencia acotada, sin recorrer URLs de terceros.
    async function worker(){
      while(offset<files.length){
        const index=offset++,f=files[index];
        if(!/^[0-9a-f]{40}$/i.test(f.sha))throw Error('SHA no válido de origen');
        const blob=await getJSON('https://api.github.com/repos/'+REPO+'/git/blobs/'+f.sha,70000);
        if(blob.encoding!=='base64'||blob.size>30000||typeof blob.content!=='string')throw Error('Blob origen inesperado');
        const decoded=Buffer.from(blob.content.replace(/\s/g,''),'base64').toString('utf8');
        const candidate=sportsCandidate({path:f.path,content:decoded},source,now);
        if(candidate)collected.push(candidate);
      }
    }
    await Promise.all(Array.from({length:Math.min(4,files.length)},()=>worker()));
    collected.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
    return {sourceId:source.id,ok:true,candidates:collected,issues:[],parser:{source:'public-github-data-CC-BY-4.0',filesRead:files.length,accepted:collected.length}};
  }catch(err){return {sourceId:source.id,ok:false,error:String(err.message).slice(0,220)}}
}
