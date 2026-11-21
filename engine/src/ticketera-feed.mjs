// ONDA Lab · contrato para feeds ENTREGADOS y AUTORIZADOS por una ticketera.
// Nunca extrae HTML, páginas de compra, cookies ni endpoints privados.
const UY='America/Montevideo';
const localToday=(now)=>new Intl.DateTimeFormat('en-CA',{timeZone:UY,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
const ymd=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&new Date(v+'T12:00:00Z').toISOString().startsWith(v);
const hhmm=x=>x==null||/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
const str=x=>typeof x==='string'?x.trim():'';
const url=(value,hosts)=>{
 const u=new URL(value);
 if(u.protocol!=='https:'||u.username||u.password||u.port||!hosts.includes(u.hostname.toLowerCase()))throw Error('Enlace de ticket fuera de los dominios autorizados');
 u.hash='';return u.href;
};
const money=(p)=>{
 if(p==null)return {cost:'Precio a consultar',priceTier:'sin-informar',priceAmount:null,priceCurrency:null};
 if(typeof p!=='object'||Array.isArray(p)||!Number.isSafeInteger(p.amount)||p.amount<0||p.amount>10000000||!['UYU','USD'].includes(p.currency))throw Error('Precio de feed inválido');
 if(p.amount===0)return {cost:'Entrada gratis (según organizador)',priceTier:'gratis',priceAmount:0,priceCurrency:p.currency};
 return {cost:(p.label==='desde'?'Desde ':'')+p.currency+' '+p.amount.toLocaleString('es-UY'),priceTier:'pago',priceAmount:p.amount,priceCurrency:p.currency};
};
export function normalizeTicketeraFeed(feed,source,now=new Date().toISOString()){
 if(source.adapter!=='partner-ticket-feed-json'||source.permission!=='approved'||source.authorizationType!=='direct-partner-feed'||!source.permissionEvidence)throw Error('Conector sin autorización directa documentada');
 const hosts=source.allowedEventHosts;
 if(!Array.isArray(hosts)||!hosts.length||hosts.some(h=>!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(h)))throw Error('Lista de dominios autorizados inválida');
 if(!feed||feed.version!==1||str(feed.partner)!==source.partnerName||!Array.isArray(feed.events)||feed.events.length>500)throw Error('Feed o proveedor inesperado');
 const seen=new Set();
 const accepted=[];
 const today=localToday(now);
 const max=new Date(now);max.setUTCDate(max.getUTCDate()+400);
 for(const e of feed.events){
   if(!e||typeof e!=='object'||typeof e.id!=='string'||!/^[A-Za-z0-9_-]{2,100}$/.test(e.id)||seen.has(e.id))throw Error('ID de evento inválido o duplicado');
   seen.add(e.id);
   const date=str(e.date),endDate=str(e.endDate)||date,city=str(e.city),title=str(e.title),category=str(e.category);
   if(!ymd(date)||!ymd(endDate)||endDate<date)throw Error('Fecha no verificable en feed');
   if(!hhmm(e.time)||!hhmm(e.endTime)||(e.endTime&&!e.time))throw Error('Horario inválido');
   if(title.length<5||title.length>180||!city||!['Maldonado','Punta del Este','La Barra','Manantiales','Piriápolis','Punta Ballena','José Ignacio','San Carlos','Pan de Azúcar','Aiguá','Garzón','La Paloma','Rocha'].includes(city))throw Error('Evento o ciudad no admitidos');
   if(!['Cultura','Música','Fiestas','Deporte','Gastronomía','Encuentros','Aire libre','Bienestar'].includes(category))throw Error('Categoría desconocida');
   if(!['confirmed','cancelled','postponed'].includes(e.status))throw Error('Se requiere estado explícito del proveedor');
   const sourceUrl=url(e.eventUrl,hosts);
   const ticketUrl=e.ticketUrl?url(e.ticketUrl,hosts):sourceUrl;
   const price=money(e.price??null);
   if(endDate<today||date>max.toISOString().slice(0,10))continue;
   accepted.push({
     sourceId:source.id,sourceName:source.name,sourceItemId:e.id,sourceUrl,title,
     date,endDate,time:e.time??null,endTime:e.endTime??null,city,place:str(e.venue)||city,
     category,kind:'evento',ticketera:source.partnerName,ticketUrl,
     ...price,priceCheckedAt:e.price?now.slice(0,10):null,
     tags:[...new Set([category.toLowerCase(),...(Array.isArray(e.tags)?e.tags.filter(x=>typeof x==='string'&&x.length<=35).slice(0,8):[])])],
     note:'Precio y disponibilidad informados por el feed autorizado. Confirmar el valor final y cargos de servicio antes de comprar.',
     description:str(e.summary).slice(0,320),confidence:'A',
     externalStatus:e.status==='confirmed'?'':e.status==='cancelled'?'cancelled':'postponed',
     sourceVerification:'authorized-partner-feed',
     evidence:[{field:'date',text:date,origin:'partner-feed:'+source.partnerName},
       {field:'status',text:e.status,origin:'partner-feed:'+source.partnerName},
       ...(e.price?[{field:'price',text:String(e.price.amount)+' '+e.price.currency,origin:'partner-feed:'+source.partnerName}]:[])]
   });
 }
 return accepted;
}
export async function fetchPartnerTicketera(source,env=process.env,request=fetch,now=new Date().toISOString()){
 if(!source.enabled||source.permission!=='approved'||source.authorizationType!=='direct-partner-feed'||!source.permissionEvidence)return {sourceId:source.id,ok:false,error:'No hay autorización documental de la ticketera'};
 if(source.adapter!=='partner-ticket-feed-json')return {sourceId:source.id,ok:false,error:'Adapter no soportado'};
 try{
   const feed=new URL(source.url);
   if(feed.protocol!=='https:'||feed.hostname.toLowerCase()!==source.expectedHost||feed.username||feed.password||feed.port)throw Error('Feed fuera del host aprobado');
   const headers={'Accept':'application/json','User-Agent':'ONDA-Hormiga/1.0 (integración por acuerdo de datos)'};
   // Token opcional por nombre de variable EN ENTORNO; no se guarda en repositorio.
   if(source.tokenEnv){
     if(!/^ONDA_PARTNER_[A-Z0-9_]{1,40}_TOKEN$/.test(source.tokenEnv)||!env[source.tokenEnv])throw Error('Credencial de socio no configurada');
     headers.Authorization='Bearer '+env[source.tokenEnv];
   }
   const res=await request(source.url,{headers,redirect:'error',signal:AbortSignal.timeout(14000)});
   if(!res.ok)throw Error('Feed proveedor HTTP '+res.status);
   const length=Number(res.headers?.get?.('content-length')||0);
   if(length>500000)throw Error('Feed mayor de 500 KB');
   const raw=await res.text();
   if(raw.length>500000)throw Error('Feed excesivo');
   const candidates=normalizeTicketeraFeed(JSON.parse(raw),source,now);
   return {sourceId:source.id,ok:true,candidates,issues:[],parser:{partner:source.partnerName,accepted:candidates.length}};
 }catch(err){return {sourceId:source.id,ok:false,error:String(err.message).slice(0,190)}}
}
