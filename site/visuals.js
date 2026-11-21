// ONDA Lab · Biblioteca Visual v3 aprobada: diez ilustraciones nuevas, sin imágenes antiguas.
// Las imágenes ambientan el tipo de plan; NO afirman documentar a un artista, sede ni evento.
(function(root){
  'use strict';
  const catalog=Object.freeze([
  {
    "id": "onda_musica_sunset_casapueblo_publico_01",
    "title": "Sunset electrónico en Casapueblo",
    "category": "Música",
    "place": "Punta Ballena / Casapueblo",
    "src": "./assets/editorial/onda_musica_sunset_casapueblo_publico_01.webp"
  },
  {
    "id": "onda_musica_recital_plaza_san_carlos_01",
    "title": "La plaza también canta",
    "category": "Música",
    "place": "Plaza Artigas, San Carlos",
    "src": "./assets/editorial/onda_musica_recital_plaza_san_carlos_01.webp"
  },
  {
    "id": "onda_cultura_teatro_maca_funcion_01",
    "title": "Que empiece la función",
    "category": "Cultura",
    "place": "Teatro MACA, Manantiales",
    "src": "./assets/editorial/onda_cultura_teatro_maca_funcion_01.webp"
  },
  {
    "id": "onda_gastronomia_feria_rambla_piriapolis_01",
    "title": "Algo rico en la rambla",
    "category": "Gastronomía",
    "place": "Rambla de los Argentinos, Piriápolis",
    "src": "./assets/editorial/onda_gastronomia_feria_rambla_piriapolis_01.webp"
  },
  {
    "id": "onda_gastronomia_paella_gigante_piriapolis_01",
    "title": "La paella nos reúne",
    "category": "Gastronomía",
    "place": "Piriápolis / puerto",
    "src": "./assets/editorial/onda_gastronomia_paella_gigante_piriapolis_01.webp"
  },
  {
    "id": "onda_musica_arboretum_lussich_intimo_01",
    "title": "Música entre árboles",
    "category": "Música",
    "place": "Arboretum Lussich, Punta Ballena",
    "src": "./assets/editorial/onda_musica_arboretum_lussich_intimo_01.webp"
  },
  {
    "id": "onda_cultura_feria_libro_paseo_san_fernando_01",
    "title": "Paseo entre libros",
    "category": "Cultura",
    "place": "Paseo San Fernando, Maldonado",
    "src": "./assets/editorial/onda_cultura_feria_libro_paseo_san_fernando_01.webp"
  },
  {
    "id": "onda_cultura_feria_rural_pueblo_gaucho_01",
    "title": "Tarde de feria en Pueblo Gaucho",
    "category": "Cultura",
    "place": "Pueblo Gaucho, Maldonado",
    "src": "./assets/editorial/onda_cultura_feria_rural_pueblo_gaucho_01.webp"
  },
  {
    "id": "onda_lifestyle_patio_nocturno_la_barra_01",
    "title": "Una más y nos vamos",
    "category": "Encuentros",
    "place": "El Popu, La Barra",
    "src": "./assets/editorial/onda_lifestyle_patio_nocturno_la_barra_01.webp"
  },
  {
    "id": "onda_lifestyle_paseo_jose_ignacio_01",
    "title": "Una tarde en José Ignacio",
    "category": "Aire libre",
    "place": "José Ignacio",
    "src": "./assets/editorial/onda_lifestyle_paseo_jose_ignacio_01.webp"
  }
].map(item=>Object.freeze(item)));
  const byId=new Map(catalog.map(x=>[x.id,x]));
  const key=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function forEvent(e){
    const place=key([e.place,e.city,e.address].filter(Boolean).join(' '));
    const description=key([e.title,e.description].filter(Boolean).join(' '));
    const category=key(e.category);
    let id,contextual=false;
    // Coincidencias concretas de escena y territorio antes de recurrir a ilustración de ambiente.
    if(/casapueblo|punta ballena/.test(place) && /(dj|electronic|techno|house|sunset)/.test(description)){
      id='onda_musica_sunset_casapueblo_publico_01';contextual=true;
    }else if(/arboretum|lussich/.test(place) && /(musica|recital|concierto|acustic|canto|jazz)/.test(description)){
      id='onda_musica_arboretum_lussich_intimo_01';contextual=true;
    }else if(/plaza artigas/.test(place)&&/san carlos/.test(place)&&/(musica|recital|festival|show|banda)/.test(description)){
      id='onda_musica_recital_plaza_san_carlos_01';contextual=true;
    }else if(/maca|atchugarry/.test(place)&&/(teatro|funcion teatral|obra teatral|actores|escena)/.test(description)){
      id='onda_cultura_teatro_maca_funcion_01';contextual=true;
    }else if(/piriapolis/.test(place) && /paella/.test(description)){
      id='onda_gastronomia_paella_gigante_piriapolis_01';contextual=true;
    }else if(/piriapolis/.test(place) && /(feria gastronomica|food truck|mercado gastronomico)/.test(description)){
      id='onda_gastronomia_feria_rambla_piriapolis_01';contextual=true;
    }else if(/paseo san fernando/.test(place) && /(libro|lectura|literatura)/.test(description)){
      id='onda_cultura_feria_libro_paseo_san_fernando_01';contextual=true;
    }else if(/pueblo gaucho/.test(place) && /(feria|turismo|rural|artesania)/.test(description)){
      id='onda_cultura_feria_rural_pueblo_gaucho_01';contextual=true;
    }else if(/el popu/.test(place) && /(bar|encuentro|amigos|musica|fiesta)/.test(description)){
      id='onda_lifestyle_patio_nocturno_la_barra_01';contextual=true;
    }else if(/jose ignacio/.test(place)&&/(paseo|caminar|bicicleta|aire libre)/.test(description)){
      id='onda_lifestyle_paseo_jose_ignacio_01';contextual=true;
    }
    // Sin foto oficial válida: siempre una ilustración de la biblioteca NUEVA.
    // Una correspondencia de categoría es conceptual, nunca equivalencia de sede.
    if(!id){
      if(category==='musica'){
        id=/(jazz|acustic|cantautor|guitarra|intimo|jam)/.test(description)
          ?'onda_musica_arboretum_lussich_intimo_01'
          :/(electronic|techno|house|dj|sunset)/.test(description)
            ?'onda_musica_sunset_casapueblo_publico_01'
            :'onda_musica_recital_plaza_san_carlos_01';
      }else if(category==='fiestas'){
        id=/(dj|electronic|techno|house|sunset)/.test(description)
          ?'onda_musica_sunset_casapueblo_publico_01'
          :'onda_lifestyle_patio_nocturno_la_barra_01';
      }else if(category==='cultura'){
        id=/(feria|productores|rural|artesania)/.test(description)
          ?'onda_cultura_feria_rural_pueblo_gaucho_01'
          :/(teatro|ballet|danza|obra|funcion|masterclass)/.test(description)
            ?'onda_cultura_teatro_maca_funcion_01'
            :'onda_cultura_feria_libro_paseo_san_fernando_01';
      }else if(category==='gastronomia'){
        id=/paella/.test(description)?'onda_gastronomia_paella_gigante_piriapolis_01':'onda_gastronomia_feria_rambla_piriapolis_01';
      }else if(category==='encuentros'){
        id='onda_lifestyle_patio_nocturno_la_barra_01';
      }else if(category==='deporte'||category==='bienestar'||category==='aire libre'){
        id='onda_lifestyle_paseo_jose_ignacio_01';
      }else id='onda_lifestyle_paseo_jose_ignacio_01';
    }
    const selected=byId.get(id);
    if(!selected)throw Error('Asset visual no inventariado: '+id);
    return {src:selected.src,id:selected.id,contextual,caption:contextual?'Ilustración editorial del lugar o tema':'Escena conceptual de ONDA, no foto del evento'};
  }
  root.ONDAVisuals=Object.freeze({catalog,forEvent});
})(globalThis);
