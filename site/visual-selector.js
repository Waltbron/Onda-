// ONDA Lab · selector visual de ilustraciones previamente aprobadas.
// Ningún recurso se presenta como foto ni afiche oficial del evento.
// Rechaza fallbacks planos/antiguos de onda_musica_01..04 y onda_gastronomia_03..06.
// Cuando no existe portada compatible: usa escena AMBIENTAL explícitamente rotulada.
(function(root){
  'use strict';
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const path=id=>'./assets/editorial/'+id+'.webp';
  function select(e){
    const name=norm(e.title),place=norm([e.place,e.city,e.address].join(' ')),desc=norm(e.description);
    const tags=norm(Array.isArray(e.tags)?e.tags.join(' '):'');
    const all=[name,desc,tags].join(' ');
    const category=e.category||'';
    function asset(id,scope,about){return Object.freeze({src:path(id),id,scope,about});}
    // Formatos reutilizables: un escenario ficticio nunca representa un artista real.
    if(/\b(cine|cineclub|cinemateca|documental|documentales|pelicula|peliculas|cortometraje|cortometrajes|cortos|proyeccion)\b/.test(all))
      return asset('onda_evento_cine_proyeccion_generica_01','formato','Proyección cinematográfica conceptual');
    if(/\b(ballet|danza clasica|masterclass de danza|clase abierta de danza)\b/.test(all)&&/\b(clase|masterclass|taller|practica)\b/.test(all))
      return asset('onda_evento_ballet_danza_clase_01','formato','Clase de ballet y danza conceptual');
    if(/\b(presentacion de libro|presentacion del libro|conversacion con autor|charla con autor|encuentro literario)\b/.test(all))
      return asset('onda_evento_presentacion_libro_autor_01','formato','Conversación literaria conceptual');
    if(/\b(charla|conferencia|conversatorio|entrevista en vivo|panel de debate|masterclass teorica)\b/.test(all))
      return asset('onda_evento_charla_conferencia_generica_01','formato','Charla presencial conceptual');
    if(/\b(mosaico|mosaicos|ceramica|taller creativo|taller de arte|taller de dibujo)\b/.test(all))
      return asset('onda_cultura_taller_creativo_mosaicos_01','formato','Taller creativo conceptual');
    if(category==='Deporte'){
      if(/\b(running|maraton|media maraton|5k|10k|recorre|rocha corre|urban race|carrera popular|atletismo popular)\b/.test(all))
        return asset('onda_evento_running_carrera_popular_01','formato','Carrera popular conceptual');
      if(/\b(ciclismo|mountain-bike|mountain bike|bicicleta|gravel|brevets|randos|gran fondo|tour|gfny)\b/.test(all))
        return asset('onda_naturaleza_bicicleta_sendero_lussich_01','ambiente','Escena de ciclismo ilustrativa; no es el circuito real');
      if(/\b(triatlon|ironman)\b/.test(all))
        return asset('onda_evento_running_carrera_popular_01','ambiente','Running: una disciplina del triatlón, no representa la prueba completa');
      if(/\b(surf|surfear|surfista)\b/.test(all))
        return asset('onda_deporte_surf_playa_brava_01','formato','Surf conceptual en la costa del Este');
      if(/\b(tenis)\b/.test(all))
        return asset('onda_deporte_tenis_ultimo_punto_01','formato','Partido de tenis conceptual');
      if(/\b(skate|skateboard)\b/.test(all))
        return asset('onda_deporte_skate_la_barra_01','formato','Práctica de skate conceptual');
      if(/\b(vela|navegacion a vela)\b/.test(all))
        return asset('onda_deporte_vela_laguna_sauce_01','ambiente','Escena de navegación a vela conceptual');
    }
    if(category==='Música'||category==='Fiestas'){
      if(/\b(jazz|swing|bebop)\b/.test(all))
        return asset('onda_evento_jazz_ensamble_vivo_01','formato','Jazz en vivo ilustrativo; formación y sede pueden diferir');
      if(/\b(chelo|violonchelo)\b/.test(all)&&/\b(piano|pianista)\b/.test(all))
        return asset('onda_evento_musica_camara_chelo_piano_01','formato','Dúo de piano y violonchelo conceptual');
      if(/\b(casapueblo|punta ballena)\b/.test(place)&&/\b(dj|electronica|techno|house|sunset)\b/.test(all))
        return asset('onda_musica_sunset_casapueblo_publico_01','sede','Sunset electrónico conceptual en Casapueblo');
      if(/\b(san carlos|plaza artigas)\b/.test(place)&&/\b(jornadas carolinas|recital en plaza)\b/.test(all))
        return asset('onda_musica_recital_plaza_san_carlos_01','sede','Recital conceptual en Plaza Artigas de San Carlos');
      if(/\b(arboretum|lussich)\b/.test(place)&&/\b(acustic|concierto|recital|cantaut|guitarr|musica)\b/.test(all))
        return asset('onda_musica_arboretum_lussich_intimo_01','sede','Concierto acústico conceptual en Arboretum Lussich');
      if(/\b(portal bosque|portal jam)\b/.test(place+' '+name)&&/\b(jam|improvisacion)\b/.test(all))
        return asset('onda_musica_portal_jam_01','sede','Jam conceptual en Portal Bosque');
      // Para actuaciones o fiestas sin formato aprobado no mostrar DJ/jazz como si fuera otro género.
      return asset('onda_lifestyle_patio_nocturno_la_barra_01','ambiente','Escena de ambiente nocturno del Este; NO representa el show');
    }
    if(category==='Cultura'){
      if(/\b(teatro|obra teatral|funcion teatral)\b/.test(all)&&/\b(maca|atchugarry)\b/.test(place))
        return asset('onda_cultura_teatro_maca_funcion_01','sede','Función teatral conceptual del MACA');
      if(/\b(escultura|muestra de arte|exposicion de arte)\b/.test(all)&&/\b(maca|atchugarry)\b/.test(place))
        return asset('onda_cultura_maca_esculturas_01','sede','Esculturas conceptuales del MACA');
      if(/\b(libro|lectura|literatura)\b/.test(all)&&/paseo san fernando/.test(place))
        return asset('onda_cultura_feria_libro_paseo_san_fernando_01','sede','Feria del libro conceptual del Paseo San Fernando');
      if(/\b(feria|turismo rural|artesan)\b/.test(all)&&/pueblo gaucho/.test(place))
        return asset('onda_cultura_feria_rural_pueblo_gaucho_01','sede','Feria rural conceptual en Pueblo Gaucho');
    }
    if(category==='Gastronomía'&&/piriapolis/.test(place)&&/\b(paella|cocina comunitaria)\b/.test(all))
      return asset('onda_gastronomia_paella_gigante_piriapolis_01','sede','Preparación de paella conceptual en Piriápolis');
    if(category==='Gastronomía'&&/piriapolis/.test(place)&&/\b(feria|food truck|gastronomica)\b/.test(all))
      return asset('onda_gastronomia_feria_rambla_piriapolis_01','sede','Feria gastronómica conceptual en Piriápolis');
    if(category==='Bienestar'&&/\b(yoga|meditacion|asanas)\b/.test(all))
      return asset('onda_bienestar_yoga_patio_luminoso_01','formato','Práctica de yoga conceptual');
    if(category==='Bienestar'&&/\b(perro|mascota)\b/.test(all))
      return asset('onda_bienestar_paseo_perro_mansa_01','formato','Paseo con mascota conceptual');
    if(category==='Aire libre'){
      if(/\b(dunas|pasarela|senderismo costero|caminata)\b/.test(all))
        return asset('onda_naturaleza_caminata_dunas_pasarela_01','formato','Caminata costera conceptual');
      if(/\b(kayak)\b/.test(all)&&/garzon/.test(place))
        return asset('onda_naturaleza_kayak_laguna_garzon_01','sede','Kayak conceptual en Laguna Garzón');
      return asset('onda_naturaleza_caminata_dunas_pasarela_01','ambiente','Paisaje del Este; no representa el recorrido');
    }
    if(category==='Encuentros')return asset('onda_lifestyle_patio_nocturno_la_barra_01','ambiente','Encuentro social conceptual, no la sede del evento');
    // El resto recibe una imagen de marca, rotulada como ambiente, nunca un falso afiche.
    return asset('onda_lifestyle_paseo_jose_ignacio_01','ambiente','Ilustración de ambiente del Este; no representa el evento');
  }
  root.ONDAVisual=Object.freeze({select});
})(globalThis);
