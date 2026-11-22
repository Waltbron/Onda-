// ONDA · Acceso directo sin simular disponibilidad ni reservar por el usuario.
// Fuente de verdad: URL oficial documentada en la ficha. No consulta ticketera ni cuenta personal.
(function(root){
 'use strict';
 const generic=new Set(['','/','/evento','/eventos','/inscripciones','/inscripcion','/register','/registro','/reservas','/tickets','/entradas','/checkout','/comprar']);
 const parse=raw=>{
  try{const u=new URL(String(raw||''));if(u.protocol!=='https:'||u.username||u.password||!u.hostname)return null;
   return u;}catch{return null}
 };
 function access(e){
  const source=parse(e?.sourceUrl),ticket=parse(e?.ticketUrl);
  // Una portada de ticketera NO es un enlace de compra a la ficha.
  const path=ticket?.pathname.replace(/\/+$/,'').toLowerCase()||'';
  const direct=!!ticket&&!generic.has(path)&&path.length>1;
  const url=direct?ticket.href:source?.href||null;
  const ticketSource=direct ? (ticket.hostname.includes('redtickets')?'RedTickets':ticket.hostname.includes('passline')?'Passline':ticket.hostname==='entradas.macamuseo.org'?'MACA':ticket.hostname.includes('lolograste')?'Lo Lograste':e.ticketera||e.ticketingPlatform||'Sitio oficial') : null;
  const action=direct ? (e.priceTier==='gratis'?'Reservar':e.category==='Deporte'?'Inscribirme':'Ver entradas') : 'Fuente oficial';
  return Object.freeze({url,hasDirectTicket:direct,label:action+' ↗',ticketSource,sourceUrl:source?.href||null});
 }
 root.ONDATickets=Object.freeze({access,parse});
})(globalThis);
