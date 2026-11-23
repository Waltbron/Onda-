// ONDA · Parser conservador de calendarios iCalendar (.ics) publicados por la propia fuente.
// Sin red. No expande recurrencias, no adivina zonas horarias y exige URL de ficha en el host de la fuente.
import {canonicalUrl} from './engine.mjs';
import {classify} from './html-adapter.mjs';
const TZ='America/Montevideo';
const unfold=t=>t.replace(/\r\n?/g,'\n').replace(/\n[ \t]/g,'');
const unescapeText=v=>v.replace(/\\n/gi,' ').replace(/\\([,;\\])/g,'$1').trim();
function parseLine(line){
  const i=line.indexOf(':');if(i<1)return null;
  const [name,...params]=line.slice(0,i).split(';');
  return {name:name.toUpperCase(),params:Object.fromEntries(params.map(p=>{const [k,...v]=p.split('=');return [k.toUpperCase(),v.join('=')]})),value:line.slice(i+1)};
}
const fmt=d=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).map(x=>[x.type,x.value]));return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`}};
function parseDt({value,params}){
  let m=/^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if(m){const date=`${m[1]}-${m[2]}-${m[3]}`;if(new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('fecha inválida');return {date,time:null,allDay:true}}
  m=/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(value);
  if(!m)throw Error('formato de fecha no soportado');
  const date=`${m[1]}-${m[2]}-${m[3]}`,time=`${m[4]}:${m[5]}`;
  if(Number(m[4])>23||Number(m[5])>59||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('fecha inválida');
  if(m[7]==='Z')return {...fmt(new Date(`${date}T${time}:${m[6]}Z`)),allDay:false};
  if(params.TZID===TZ)return {date,time,allDay:false};
  throw Error('hora sin zona reconocida (ambigua)');
}
const addDay=(d,n)=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
export function parseICS(text,{sourceId,baseUrl,sourceName=sourceId,city='Maldonado'}={}){
  if(typeof text!=='string'||!sourceId||!baseUrl)throw Error('missing ICS or source config');
  if(!/BEGIN:VCALENDAR/i.test(text))throw Error('no es un calendario iCalendar');
  const host=new URL(baseUrl).host,candidates=[],issues=[],seen=new Set();let total=0,cur=null;
  for(const raw of unfold(text).split('\n')){
    const l=parseLine(raw);if(!l)continue;
    if(l.name==='BEGIN'&&l.value.toUpperCase()==='VEVENT'){cur={};total++;continue}
    if(l.name==='END'&&l.value.toUpperCase()==='VEVENT'&&cur){
      const e=cur;cur=null;
      try{
        if(e.RRULE)throw Error('evento recurrente no soportado');
        const title=unescapeText(e.SUMMARY?.value||'');if(title.length<5)throw Error('título ausente o corto');
        if(!e.DTSTART)throw Error('falta DTSTART');
        const s=parseDt(e.DTSTART);let endDate=s.date,endTime=null;
        if(e.DTEND){const en=parseDt(e.DTEND);endDate=s.allDay&&en.allDay?addDay(en.date,-1):en.date;endTime=en.time;if(endDate<s.date)throw Error('fin anterior al inicio');if(endDate===s.date&&endTime&&s.time&&endTime<s.time)throw Error('fin anterior al inicio')}
        const u=e.URL?.value?canonicalUrl(new URL(e.URL.value.trim(),baseUrl).href):null;
        if(!u||new URL(u).host!==host)throw Error('sin URL de ficha en el host de la fuente');
        const uid=e.UID?.value||u;const key=uid+'|'+e.DTSTART.value;if(seen.has(key))continue;seen.add(key);
        const st=(e.STATUS?.value||'').toUpperCase();
        const evidence=[{field:'date',text:e.DTSTART.value,origin:'ics.DTSTART'},{field:'title',text:title,origin:'ics.SUMMARY'}];
        if(st==='CANCELLED')evidence.push({field:'eventStatus',text:'CANCELLED',origin:'ics.STATUS'});
        candidates.push({sourceId,sourceName,sourceUrl:u,title,date:s.date,time:s.time,endDate,endTime,place:unescapeText(e.LOCATION?.value||'')||city,city,category:classify(title),kind:'evento',sourceItemId:uid,externalStatus:st==='CANCELLED'?'cancelled':'',evidence,derived:{category:true},snapshotOrigin:'ics-feed'});
      }catch(err){issues.push({reason:String(err.message),eventTitle:unescapeText(e.SUMMARY?.value||'').slice(0,90)})}
      continue;
    }
    if(cur&&!cur[l.name])cur[l.name]=l;
  }
  return {candidates,issues,summary:{vevents:total,validItems:candidates.length,rejectedItems:issues.length,requiresHumanReview:true,networkAccess:false}};
}
