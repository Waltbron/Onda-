// ONDA Lab · Asignador visual v5.
// Uso: 'evento'/'experiencia'/'ambos'; coincidencia de formato y sede; reuso no contiguo.
(function(root){
'use strict';
const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const EVENT_ONLY=new Set([
'onda_evento_cine_proyeccion_generica_01','onda_evento_running_carrera_popular_01',
'onda_evento_jazz_ensamble_vivo_01','onda_evento_ballet_danza_clase_01',
'onda_evento_charla_conferencia_generica_01','onda_evento_presentacion_libro_autor_01',
'onda_evento_musica_camara_chelo_piano_01','onda_musica_sunset_casapueblo_publico_01',
'onda_musica_recital_plaza_san_carlos_01','onda_cultura_teatro_maca_funcion_01',
'onda_gastronomia_paella_gigante_piriapolis_01','onda_musica_arboretum_lussich_intimo_01',
'onda_musica_portal_jam_01','onda_musica_dj_casapueblo_01','onda_musica_acustico_jardin_01',
'onda_deporte_running_costero_brava_01',
'onda_deporte_triatlon_costero_mansa_01',
'onda_deporte_trail_running_sierras_animas_01',
'onda_deporte_natacion_aguas_abiertas_01',
'onda_musica_narakan_jam_01',
'onda_musica_concierto_vocal_femenina_01',
'onda_cultura_exposicion_pintura_sala_historica_01',
'onda_musica_ensamble_guitarra_clasica_01'
]);
const EXPERIENCE_ONLY=new Set([
'onda_lifestyle_paseo_jose_ignacio_01','onda_familias_pan_azucar_carpincho_01',
'onda_naturaleza_chajas_laguna_diario_01','onda_familias_jaguel_trepa_01',
'onda_familias_cometa_playa_mansa_01','onda_deporte_rollers_rambla_01',
'onda_bienestar_paseo_perro_mansa_01'
]);
const usage=id=>EVENT_ONLY.has(id)?'evento':EXPERIENCE_ONLY.has(id)?'experiencia':'ambos';
function candidates(e){
 const category=normal(e.category),name=normal(e.title),tags=normal(Array.isArray(e.tags)?e.tags.join(' '):'');
 const info=[name,normal(e.description),tags].join(' '),venue=normal(e.place),local=[venue,normal(e.city),normal(e.address)].join(' ');
 const music=/^(musica|fiestas)$/.test(category),culture=category==='cultura',sport=category==='deporte';
 const matches=(text,re)=>re.test(text),arr=[];
 function add(id,score,scope,description){
   if(usage(id)==='experiencia')return;
   const entry={id,src:'./assets/editorial/'+id+'.webp',score,scope,usage:usage(id),
     contextual:scope==='sede',about:description,caption:description+'. Ilustración conceptual ONDA, no es fotografía, cartel ni acreditación del evento.'};
   const prev=arr.findIndex(x=>x.id===id);
   if(prev<0)arr.push(entry);else if(arr[prev].score<score)arr[prev]=entry;
 }
 // Imágenes portables declaradas en un registro; permisos y contexto se siguen validando aquí.
 for(const item of root.ONDAFormats?.candidates(e)||[])add(item.id,item.score,item.scope,item.description);
 // Sede exacta + coincidencia temática: nunca proyectar otra ciudad o escenario.
 if(music&&matches(local,/casapueblo/)&&matches(info,/\b(dj|electronica|techno|house|sunset)\b/))
  add('onda_musica_sunset_casapueblo_publico_01',100,'sede','Sunset electrónico en Casapueblo');
 if(music&&matches(local,/plaza artigas/)&&matches(local,/san carlos/)&&matches(info,/\b(recital|concierto|festival|banda|jornadas carolinas)\b/))
  add('onda_musica_recital_plaza_san_carlos_01',100,'sede','Recital en Plaza Artigas de San Carlos');
 if(music&&matches(local,/arboretum|lussich/)&&matches(info,/\b(musica|recital|acustic|concierto|cantautor|guitarra|jazz)\b/))
  add('onda_musica_arboretum_lussich_intimo_01',100,'sede','Concierto en Arboretum Lussich');
 if(music&&matches(venue+' '+name,/portal bosque|portal jam/)&&matches(info,/\b(jam|improvisacion)\b/))
  add('onda_musica_portal_jam_01',100,'sede','Jam en Portal Bosque');
 if(culture&&matches(local,/maca|atchugarry/)&&matches(info,/\b(teatro|funcion teatral|obra teatral|comedia)\b/)&&!matches(info,/\b(cine|pelicula|documental|proyeccion)\b/))
  add('onda_cultura_teatro_maca_funcion_01',100,'sede','Función de teatro en MACA');
 if(culture&&matches(local,/maca|atchugarry/)&&matches(info,/\b(escultura|muestra de arte|exposicion de arte)\b/))
  add('onda_cultura_maca_esculturas_01',99,'sede','Recorrido de esculturas del MACA');
 if(culture&&matches(venue,/paseo san fernando/)&&matches(info,/\b(libro|literatura|feria literaria)\b/))
  add('onda_cultura_feria_libro_paseo_san_fernando_01',100,'sede','Feria de libros en Paseo San Fernando');
 if(culture&&matches(venue,/pueblo gaucho/)&&matches(info,/\b(feria|turismo|rural|artesania|productores)\b/))
  add('onda_cultura_feria_rural_pueblo_gaucho_01',100,'sede','Feria rural en Pueblo Gaucho');
 if(category==='gastronomia'&&matches(local,/piriapolis/)&&matches(info,/\b(paella|cocina comunitaria)\b/)&&!matches(info,/\b(monumento|inauguracion|homenaje)\b/))
  add('onda_gastronomia_paella_gigante_piriapolis_01',100,'sede','Paella comunitaria en Piriápolis');
 if(category==='gastronomia'&&matches(venue,/rambla/)&&matches(local,/piriapolis/)&&matches(info,/\b(feria|gastronomica|food truck|mercado)\b/))
  add('onda_gastronomia_feria_rambla_piriapolis_01',100,'sede','Feria gastronómica en rambla de Piriápolis');
 if(category==='encuentros'&&matches(venue,/el popu/)&&matches(info,/\b(bar|encuentro|social|musica)\b/))
  add('onda_lifestyle_patio_nocturno_la_barra_01',100,'sede','Encuentro en El Popu');
 if(sport&&matches(local,/laguna garzon/)&&matches(info,/\bkayak\b/))
  add('onda_naturaleza_kayak_laguna_garzon_01',100,'sede','Kayak en Laguna Garzón');
 if(sport&&matches(local,/laguna del sauce|laguna sauce/)&&matches(info,/\b(vela|navegacion)\b/))
  add('onda_deporte_vela_laguna_sauce_01',100,'sede','Navegación a vela en Laguna del Sauce');
 if(sport&&matches(local,/la barra|arroyo maldonado/)&&matches(info,/\b(sup|paddle|stand up paddle)\b/))
  add('onda_deporte_sup_puente_barra_01',100,'sede','Paddle sobre el Arroyo Maldonado');
 if(sport&&matches(local,/la barra/)&&matches(info,/\b(skate|skateboard)\b/))
  add('onda_deporte_skate_la_barra_01',100,'sede','Skate en La Barra');
 // Formatos sin identificación de sede.

 // Nuevas escenas aprobadas: compatibilidad de formato, sede y geografía.
 const formatId=root.ONDAFormats?.classify(e)?.id;
 if(culture&&e.kind==='exposicion'&&matches(venue,/museo regional francisco mazzoni|museo mazzoni/)&&matches(info,/\b(pintura|exposicion|muestra)\b/))
   add('onda_cultura_exposicion_pintura_sala_historica_01',103,'sede','Exposición pictórica en espacio cultural patrimonial');
 if(music&&matches(venue,/pueblo narakan/)&&matches(info,/\b(jam|improvisacion|soul|funk|jazz)\b/))
   add('onda_musica_narakan_jam_01',104,'sede','Música en vivo en Pueblo Narakan');
 if(music&&matches(info,/\b(hilda lizarazu|cantante femenina|voz femenina|cantautora)\b/)&&matches(info,/\b(concierto|rock|pop|show|canciones)\b/))
   add('onda_musica_concierto_vocal_femenina_01',96,'formato','Concierto con cantante femenina en sala');
 if(sport&&formatId==='running'&&matches(local,/playa brava|punta del este/))
   add('onda_deporte_running_costero_brava_01',102,'formato','Corrida costera en Punta del Este');
 if(sport&&formatId==='triatlon'&&matches(local,/punta del este|playa mansa/))
   add('onda_deporte_triatlon_costero_mansa_01',102,'formato','Triatlón costero en Punta del Este');
 if(sport&&formatId==='ciclismo'&&matches(local,/piriapolis/)&&matches(info,/\b(ciclismo|ruta|fondo|bicicleta)\b/))
   add('onda_deporte_ciclismo_ruta_piriapolis_01',102,'sede','Ciclismo de ruta en paisaje de Piriápolis');
 if(sport&&formatId==='trail_running'&&matches(local,/sierras?|animas|pan de azucar|maldonado|piriapolis/))
   add('onda_deporte_trail_running_sierras_animas_01',95,'formato','Trail running en terreno serrano');
 if(sport&&formatId==='beach_voley'&&matches(local,/playa mansa|punta del este/))
   add('onda_deporte_beach_volley_playa_mansa_01',96,'formato','Vóley de playa entre amigos');
 if(sport&&matches(info,/\b(surf|surfista|surfear)\b/)&&matches(local,/montoya|la barra/))
   add('onda_deporte_surf_montoya_maniobra_01',102,'sede','Surf en Playa Montoya o La Barra');





 if(culture&&matches(info,/\b(mosaico|ceramica|taller creativo|taller de arte|taller de dibujo)\b/))
  add('onda_cultura_taller_creativo_mosaicos_01',94,'formato','Taller artístico');


 if(music&&matches(info,/\b(acustico|acustica|cantautor|guitarra acustica)\b/)&&matches(info,/\b(concierto|musica|recital|canciones|show)\b/)&&!matches(info,/\b(orquesta|metal|sinfonica|rock pesado)\b/))
  add('onda_musica_acustico_jardin_01',83,'formato','Concierto acústico conceptual');


 if(sport&&matches(info,/\b(surf|surfista|surfear)\b/)&&matches(local,/playa brava|punta del este/))
  add('onda_deporte_surf_playa_brava_01',92,'formato','Surf en Punta del Este');
 if(sport&&matches(info,/\b(gravel|mountain bike|mountain-bike|mtb|ciclismo de sendero)\b/)&&matches(local,/arboretum|lussich/))
  add('onda_naturaleza_bicicleta_sendero_lussich_01',92,'sede','Ciclismo en Lussich');

 if(category==='aire libre'&&matches(info,/\b(dunas|caminata costera|senderismo costero|pasarela de playa)\b/))
  add('onda_naturaleza_caminata_dunas_pasarela_01',92,'formato','Caminata por las dunas');
 return arr.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}

const BRANDS=Object.freeze([
 {id:'onda_fallback_serigrafia_01_azul_naranja',variant:'fb-01',about:'Azul tinta, naranja y marfil'},
 {id:'onda_fallback_serigrafia_02_fucsia_naranja',variant:'fb-02',about:'Azul tinta, fucsia y naranja'},
 {id:'onda_fallback_serigrafia_03_lima_violeta',variant:'fb-03',about:'Lima, violeta y naranja'}
]);
function stableHash(input){let hash=2166136261;for(const ch of String(input??''))hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;return hash}
function fallback(e,blocked=new Set()){
 const shift=stableHash(e.id)%BRANDS.length;
 const choices=BRANDS.map((_,i)=>BRANDS[(shift+i)%BRANDS.length]);
 const brand=choices.find(x=>!blocked.has(x.id))||choices[0];
 return {id:brand.id,src:'./assets/editorial/'+brand.id+'.webp',scope:'identidad',usage:'evento',score:0,variant:brand.variant,contextual:false,
 about:brand.about,caption:'Identidad gráfica ONDA; no representa el evento, el artista ni la sede.'};
}
// Foto real solo con derechos documentados; luego ilustración; luego serigrafía.
const PHOTO_RIGHTS=new Set(['owned','licensed','authorized']);
const remoteHttps=x=>typeof x==='string'&&/^https:\/\/[a-z0-9.-]+(?:\/[^\s<>"']*)?$/i.test(x)&&!x.includes('@');
const photoAsset=x=>remoteHttps(x)||(typeof x==='string'&&/^\.\/assets\/[a-z0-9/_-]+\.(?:jpe?g|png|webp)$/i.test(x));
function photo(e){
 if(!e||!PHOTO_RIGHTS.has(e.imageRightsStatus)||!photoAsset(e.imageUrl)||!remoteHttps(e.imageSourceUrl))return null;
 if(e.imageType&&e.imageType!=='photo')return null;
 const alt=String(e.imageAlt||'').trim(),credit=String(e.imageCredit||'').trim();
 if(!alt||!credit)return null;
 return {id:'foto:'+e.imageUrl,src:e.imageUrl,score:200,scope:'foto',usage:'evento',
   contextual:true,caption:alt,credit,sourceUrl:e.imageSourceUrl};
}
function select(e){return photo(e)||candidates(e)[0]||fallback(e)}
function allocate(events,{columns=1}={}){
 // Imágenes reutilizables: prohibición local únicamente para vecinos reales en la grilla.
 const cols=Number.isInteger(columns)&&columns>0?columns:1;
 const result=new Map(),placed=[];
 for(const e of events){
  if(!e?.id||result.has(e.id))continue;
  const i=placed.length,blocked=new Set();
  if(i>0&&i%cols!==0)blocked.add(result.get(placed[i-1].id).id);
  if(i>=cols)blocked.add(result.get(placed[i-cols].id).id);
  const visual=photo(e)||candidates(e).find(x=>!blocked.has(x.id))||fallback(e,blocked);
  result.set(e.id,visual);placed.push(e);
 }
 return result;
}
root.ONDAVisual=Object.freeze({usage,candidates,photo,select,allocate,fallback});
})(globalThis);
