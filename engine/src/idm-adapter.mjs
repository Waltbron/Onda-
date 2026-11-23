// ONDA · Parser del listado público de actividades de la Intendencia de Maldonado (Drupal, sin JSON-LD).
// Solo lee el listado (fecha, título, lugar, etiquetas, enlace a ficha). No lee horarios ni texto libre de fichas.
import {canonicalUrl} from './engine.mjs';
const MONTHS={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12};
const CITIES=['Punta del Este','Piriápolis','Maldonado','San Carlos','La Barra','Manantiales','José Ignacio','Punta Ballena','Pan de Azúcar','Aiguá','Garzón'];
const text=h=>h.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/\s+/g,' ').trim();
function ymd(s){
  const m=/^(\d{1,2}) de ([a-záéíóú]+),? (\d{4})$/i.exec(s.trim());if(!m)throw Error('fecha no reconocida: '+s.slice(0,40));
  const mo=MONTHS[m[2].toLowerCase()];if(!mo)throw Error('mes desconocido');
  const iso=`${m[3]}-${String(mo).padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  if(new Date(iso+'T12:00:00Z').toISOString().slice(0,10)!==iso)throw Error('fecha inválida');return iso;
}
function category(title,tags){
  const t=(title+' '+tags.join(' ')).toLowerCase();
  if(/deport|marat|carrera|torneo|campeonato/.test(t))return 'Deporte';
  if(/guitarra|m[uú]sica|concierto|recital|coro|orquesta|jazz|candombe/.test(t))return 'Música';
  if(/gastronom|feria|degustaci|vino/.test(t))return 'Gastronomía';
  if(/naturaleza|rural|senderis|aire libre|playa/.test(t))return 'Aire libre';
  if(/cultura|arte|exposici|teatro|museo|cine|inauguraci/.test(t))return 'Cultura';
  return 'Encuentros';
}
export function parseIdmAgenda(html,{sourceId,baseUrl,sourceName=sourceId,city='Maldonado'}={}){
  if(typeof html!=='string'||!sourceId||!baseUrl)throw Error('missing HTML or source config');
  const host=new URL(baseUrl).host,candidates=[],issues=[],seen=new Set();
  const blocks=html.split('<div class="agenda__item ').slice(1);
  if(!blocks.length)throw Error('estructura de agenda no reconocida (0 elementos)');
  for(const b of blocks){
    const title=text((/text__title">([\s\S]*?)<\/span>/.exec(b)||[])[1]||'');
    try{
      const href=(/href="([^"]+)"/.exec(b)||[])[1];
      const u=canonicalUrl(new URL(href||'','https://'+host).href);
      if(new URL(u).host!==host||!/\/node\/\d+$/.test(u))throw Error('enlace de ficha inesperado');
      if(title.length<5)throw Error('título corto');
      const dateText=text((/text__date">([\s\S]*?)<\/span>/.exec(b)||[])[1]||'');
      const [a,z]=dateText.split(/\s+-\s+/);const date=ymd(a),endDate=z?ymd(z):date;
      if(endDate<date)throw Error('fin anterior al inicio');
      if(seen.has(u))continue;seen.add(u);
      let place=text((/text__info">([\s\S]*?)<\/div>/.exec(b)||[])[1]||'');
      if(!place||/programa|adjunto|consultar/i.test(place))place='';
      const tags=[...b.matchAll(/tag-item">([\s\S]*?)<\/div>/g)].map(m=>text(m[1])).filter(Boolean);
      const found=CITIES.find(c=>new RegExp(c,'i').test(place+' '+title));
      candidates.push({sourceId,sourceName,sourceUrl:u,title,date,time:null,endDate,endTime:null,place:place||city,city:found||city,category:category(title,tags),kind:'evento',sourceItemId:u.split('/').pop(),externalStatus:'',tags,
        evidence:[{field:'date',text:dateText,origin:'idm.agenda__date'},{field:'title',text:title,origin:'idm.text__title'}],derived:{category:true,city:!found},snapshotOrigin:'idm-agenda-html'});
    }catch(e){issues.push({reason:String(e.message),eventTitle:title.slice(0,90)})}
  }
  return {candidates,issues,summary:{items:blocks.length,validItems:candidates.length,rejectedItems:issues.length,requiresHumanReview:true,networkAccess:false}};
}
