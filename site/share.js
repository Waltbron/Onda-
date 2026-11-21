// ONDA Lab · compartir cada plan por WhatsApp con link permanente a su ficha.
(function(root){
  'use strict';
  function permalink(pageUrl,id){
    if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,159}$/.test(String(id||'')))throw Error('ID de plan inválido');
    const u=new URL(pageUrl);
    if(!['https:','http:'].includes(u.protocol))throw Error('URL base inválida');
    u.search='';u.hash='';
    u.searchParams.set('plan',id);
    return u.href;
  }
  function directions(e){
    const place=[e.address||e.place||'',e.address?'':(e.city||''),'Uruguay'].filter(Boolean).join(', ');
    return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place);
  }
  function message(e,pageUrl){
    const date=String(e.date||'');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Evento sin fecha concreta');
    const [year,month,day]=date.split('-');
    const time=/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time||'')?' a las '+e.time+' h':'';
    const place=[e.place||e.city||'',e.city&&e.place!==e.city?e.city:''].filter(Boolean).join(' · ');
    return [
      '✨ Mirá este plan en ONDA',
      '*'+String(e.title||'Plan en el Este').trim()+'*',
      '📅 '+day+'/'+month+'/'+year+time,
      '📍 '+place,
      e.cost?'🎟️ '+String(e.cost).trim():'',
      '🗺️ Cómo llegar: '+directions(e),
      '🔗 Ficha del plan en ONDA: '+permalink(pageUrl,e.id),
      'Confirmá horarios, entradas y cambios con el organizador.'
    ].filter(Boolean).join('\n');
  }
  function whatsapp(e,pageUrl){
    return 'https://wa.me/?text='+encodeURIComponent(message(e,pageUrl));
  }
  root.ONDAShare=Object.freeze({permalink,directions,message,whatsapp});
})(globalThis);
