// ONDA Lab · Asignador visual v5.
// Uso: 'evento'/'experiencia'/'ambos'; coincidencia de actividad y territorio; unicidad en la selección visible.
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
'onda_musica_portal_jam_01','onda_musica_dj_casapueblo_01','onda_musica_acustico_jardin_01'
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
 if(culture&&matches(info,/\b(cine|cineclub|documental|pelicula|cortos|cortometraje|proyeccion)\b/))
  add('onda_evento_cine_proyeccion_generica_01',93,'formato','Proyección de cine');
 if(culture&&matches(info,/\b(ballet|danza clasica|masterclass de danza)\b/)&&matches(info,/\b(clase|masterclass|taller|practica)\b/))
  add('onda_evento_ballet_danza_clase_01',95,'formato','Clase de ballet y danza');
 if(culture&&matches(info,/\b(presentacion (de|del) libro|conversacion con autor|encuentro literario)\b/))
  add('onda_evento_presentacion_libro_autor_01',95,'formato','Presentación literaria');
 if(culture&&matches(info,/\b(charla|conferencia|conversatorio|debate|panel)\b/))
  add('onda_evento_charla_conferencia_generica_01',93,'formato','Charla o conferencia');
 if(culture&&matches(info,/\b(mosaico|ceramica|taller creativo|taller de arte|taller de dibujo)\b/))
  add('onda_cultura_taller_creativo_mosaicos_01',94,'formato','Taller artístico');
 if(music&&matches(info,/\b(jazz|swing|bebop)\b/))
  add('onda_evento_jazz_ensamble_vivo_01',96,'formato','Jazz en vivo');
 if(music&&matches(info,/\b(chelo|violonchelo)\b/)&&matches(info,/\b(piano|pianista)\b/))
  add('onda_evento_musica_camara_chelo_piano_01',96,'formato','Dúo de piano y violonchelo');
 if(music&&matches(info,/\b(acustico|acustica|cantautor|guitarra acustica)\b/)&&matches(info,/\b(concierto|musica|recital|canciones|show)\b/)&&!matches(info,/\b(orquesta|metal|sinfonica|rock pesado)\b/))
  add('onda_musica_acustico_jardin_01',83,'formato','Concierto acústico conceptual');
 if(sport&&matches(info,/\b(running|maraton|media maraton|5k|10k|recorre|rocha corre|urban race|carrera popular)\b/)&&!matches(info,/\b(triatlon|ironman)\b/))
  add('onda_evento_running_carrera_popular_01',96,'formato','Carrera a pie');
 if(sport&&matches(info,/\b(tenis)\b/))
  add('onda_deporte_tenis_ultimo_punto_01',94,'formato','Partido de tenis');
 if(sport&&matches(info,/\b(surf|surfista|surfear)\b/)&&matches(local,/playa brava|punta del este/))
  add('onda_deporte_surf_playa_brava_01',92,'formato','Surf en Punta del Este');
 if(sport&&matches(info,/\b(gravel|mountain bike|mountain-bike|mtb|ciclismo de sendero)\b/)&&matches(local,/arboretum|lussich/))
  add('onda_naturaleza_bicicleta_sendero_lussich_01',92,'sede','Ciclismo en Lussich');
 if(category==='bienestar'&&matches(info,/\b(yoga|meditacion guiada|asanas)\b/))
  add('onda_bienestar_yoga_patio_luminoso_01',92,'formato','Práctica de yoga');
 if(category==='aire libre'&&matches(info,/\b(dunas|caminata costera|senderismo costero|pasarela de playa)\b/))
  add('onda_naturaleza_caminata_dunas_pasarela_01',92,'formato','Caminata por las dunas');
 return arr.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
function fallback(e){return {id:null,src:null,score:0,usage:'evento',scope:'editorial',contextual:false,
 about:'Portada gráfica del evento sin fotografía inventada',
 caption:'Portada editorial de ONDA: no es el afiche oficial ni una fotografía del lugar.'};}
function select(e){return candidates(e)[0]||fallback(e);}
function allocate(events){
 const unique=[],seen=new Set();
 for(const e of events){if(!seen.has(e.id)){seen.add(e.id);unique.push(e);}}
 const ordered=unique.map((e,i)=>({e,i,options:candidates(e)}))
  .sort((a,b)=>(a.options.length||999)-(b.options.length||999)|| (b.options[0]?.score||0)-(a.options[0]?.score||0)||a.i-b.i);
 const result=new Map(),reserved=new Set();
 for(const item of ordered){
   const chosen=item.options.find(a=>!reserved.has(a.id))||fallback(item.e);
   result.set(item.e.id,chosen);if(chosen.id)reserved.add(chosen.id);
 }
 return result;
}
root.ONDAVisual=Object.freeze({usage,candidates,select,allocate});
})(globalThis);
