// ONDA Lab · Catálogo de 37 escenas editoriales aprobadas (22 recientes + 15 anteriores).
// El selector de formatos distingue imagen de la actividad, sede y escena de ambiente.
(function(root){
  'use strict';
  const catalog=Object.freeze([
  {
    "id": "onda_evento_cine_proyeccion_generica_01",
    "title": "Cine y documentales",
    "category": "Cultura",
    "place": "Proyección conceptual",
    "src": "./assets/editorial/onda_evento_cine_proyeccion_generica_01.webp"
  },
  {
    "id": "onda_evento_running_carrera_popular_01",
    "title": "Running y carreras populares",
    "category": "Deporte",
    "place": "Evento deportivo conceptual",
    "src": "./assets/editorial/onda_evento_running_carrera_popular_01.webp"
  },
  {
    "id": "onda_evento_jazz_ensamble_vivo_01",
    "title": "Jazz en vivo",
    "category": "Música",
    "place": "Ensambles musicales",
    "src": "./assets/editorial/onda_evento_jazz_ensamble_vivo_01.webp"
  },
  {
    "id": "onda_evento_ballet_danza_clase_01",
    "title": "Ballet y danza",
    "category": "Cultura",
    "place": "Clase conceptual",
    "src": "./assets/editorial/onda_evento_ballet_danza_clase_01.webp"
  },
  {
    "id": "onda_evento_charla_conferencia_generica_01",
    "title": "Charlas y conferencias",
    "category": "Cultura",
    "place": "Conversación y aprendizaje",
    "src": "./assets/editorial/onda_evento_charla_conferencia_generica_01.webp"
  },
  {
    "id": "onda_evento_presentacion_libro_autor_01",
    "title": "Presentación de libros",
    "category": "Cultura",
    "place": "Encuentro con autores",
    "src": "./assets/editorial/onda_evento_presentacion_libro_autor_01.webp"
  },
  {
    "id": "onda_evento_musica_camara_chelo_piano_01",
    "title": "Música de cámara",
    "category": "Música",
    "place": "Concierto instrumental",
    "src": "./assets/editorial/onda_evento_musica_camara_chelo_piano_01.webp"
  },
  {
    "id": "onda_cultura_taller_creativo_mosaicos_01",
    "title": "Manos a la obra",
    "category": "Cultura",
    "place": "Taller creativo",
    "src": "./assets/editorial/onda_cultura_taller_creativo_mosaicos_01.webp"
  },
  {
    "id": "onda_deporte_surf_playa_brava_01",
    "title": "Surf en el Este",
    "category": "Deporte",
    "place": "Playa Brava",
    "src": "./assets/editorial/onda_deporte_surf_playa_brava_01.webp"
  },
  {
    "id": "onda_naturaleza_bicicleta_sendero_lussich_01",
    "title": "Paseo en bicicleta",
    "category": "Deporte",
    "place": "Senderos de Lussich",
    "src": "./assets/editorial/onda_naturaleza_bicicleta_sendero_lussich_01.webp"
  },
  {
    "id": "onda_bienestar_yoga_patio_luminoso_01",
    "title": "Yoga y bienestar",
    "category": "Bienestar",
    "place": "Patio conceptual del Este",
    "src": "./assets/editorial/onda_bienestar_yoga_patio_luminoso_01.webp"
  },
  {
    "id": "onda_naturaleza_caminata_dunas_pasarela_01",
    "title": "Caminata entre dunas",
    "category": "Aire libre",
    "place": "Costa del Este",
    "src": "./assets/editorial/onda_naturaleza_caminata_dunas_pasarela_01.webp"
  },
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
    "place": "Rambla de Piriápolis",
    "src": "./assets/editorial/onda_gastronomia_feria_rambla_piriapolis_01.webp"
  },
  {
    "id": "onda_gastronomia_paella_gigante_piriapolis_01",
    "title": "La paella nos reúne",
    "category": "Gastronomía",
    "place": "Piriápolis",
    "src": "./assets/editorial/onda_gastronomia_paella_gigante_piriapolis_01.webp"
  },
  {
    "id": "onda_musica_arboretum_lussich_intimo_01",
    "title": "Música entre árboles",
    "category": "Música",
    "place": "Arboretum Lussich",
    "src": "./assets/editorial/onda_musica_arboretum_lussich_intimo_01.webp"
  },
  {
    "id": "onda_cultura_feria_libro_paseo_san_fernando_01",
    "title": "Paseo entre libros",
    "category": "Cultura",
    "place": "Paseo San Fernando",
    "src": "./assets/editorial/onda_cultura_feria_libro_paseo_san_fernando_01.webp"
  },
  {
    "id": "onda_cultura_feria_rural_pueblo_gaucho_01",
    "title": "Tarde de feria en Pueblo Gaucho",
    "category": "Cultura",
    "place": "Pueblo Gaucho",
    "src": "./assets/editorial/onda_cultura_feria_rural_pueblo_gaucho_01.webp"
  },
  {
    "id": "onda_lifestyle_patio_nocturno_la_barra_01",
    "title": "Una más y nos vamos",
    "category": "Encuentros",
    "place": "La Barra",
    "src": "./assets/editorial/onda_lifestyle_patio_nocturno_la_barra_01.webp"
  },
  {
    "id": "onda_lifestyle_paseo_jose_ignacio_01",
    "title": "Una tarde en José Ignacio",
    "category": "Aire libre",
    "place": "José Ignacio",
    "src": "./assets/editorial/onda_lifestyle_paseo_jose_ignacio_01.webp"
  },
  {
    "id": "onda_naturaleza_kayak_laguna_garzon_01",
    "title": "Kayak en Laguna Garzón",
    "category": "Deporte",
    "place": "Laguna Garzón",
    "src": "./assets/editorial/onda_naturaleza_kayak_laguna_garzon_01.webp"
  },
  {
    "id": "onda_deporte_skate_la_barra_01",
    "title": "Una tarde de skate",
    "category": "Deporte",
    "place": "La Barra",
    "src": "./assets/editorial/onda_deporte_skate_la_barra_01.webp"
  },
  {
    "id": "onda_deporte_rollers_rambla_01",
    "title": "Rollers por la rambla",
    "category": "Deporte",
    "place": "Punta del Este",
    "src": "./assets/editorial/onda_deporte_rollers_rambla_01.webp"
  },
  {
    "id": "onda_familias_pan_azucar_carpincho_01",
    "title": "Descubriendo al carpincho",
    "category": "Familias",
    "place": "Cerro Pan de Azúcar",
    "src": "./assets/editorial/onda_familias_pan_azucar_carpincho_01.webp"
  },
  {
    "id": "onda_naturaleza_chajas_laguna_diario_01",
    "title": "Familia de chajás",
    "category": "Naturaleza",
    "place": "Laguna del Diario",
    "src": "./assets/editorial/onda_naturaleza_chajas_laguna_diario_01.webp"
  },
  {
    "id": "onda_deporte_vela_laguna_sauce_01",
    "title": "Aprender a navegar",
    "category": "Deporte",
    "place": "Laguna del Sauce",
    "src": "./assets/editorial/onda_deporte_vela_laguna_sauce_01.webp"
  },
  {
    "id": "onda_musica_dj_casapueblo_01",
    "title": "Un sunset distinto",
    "category": "Música",
    "place": "Casapueblo · escena conceptual",
    "src": "./assets/editorial/onda_musica_dj_casapueblo_01.webp"
  },
  {
    "id": "onda_familias_jaguel_trepa_01",
    "title": "Yo puedo sola",
    "category": "Familias",
    "place": "Parque El Jagüel",
    "src": "./assets/editorial/onda_familias_jaguel_trepa_01.webp"
  },
  {
    "id": "onda_musica_acustico_jardin_01",
    "title": "Música en el jardín",
    "category": "Música",
    "place": "Jardín cultural",
    "src": "./assets/editorial/onda_musica_acustico_jardin_01.webp"
  },
  {
    "id": "onda_cultura_maca_esculturas_01",
    "title": "Mirar el arte de cerca",
    "category": "Cultura",
    "place": "MACA",
    "src": "./assets/editorial/onda_cultura_maca_esculturas_01.webp"
  },
  {
    "id": "onda_musica_portal_jam_01",
    "title": "La noche improvisa",
    "category": "Música",
    "place": "Portal Bosque Jam",
    "src": "./assets/editorial/onda_musica_portal_jam_01.webp"
  },
  {
    "id": "onda_familias_cometa_playa_mansa_01",
    "title": "La cometa",
    "category": "Familias",
    "place": "Playa Mansa",
    "src": "./assets/editorial/onda_familias_cometa_playa_mansa_01.webp"
  },
  {
    "id": "onda_deporte_tenis_ultimo_punto_01",
    "title": "El último punto",
    "category": "Deporte",
    "place": "Cancha entre pinos",
    "src": "./assets/editorial/onda_deporte_tenis_ultimo_punto_01.webp"
  },
  {
    "id": "onda_deporte_sup_puente_barra_01",
    "title": "Remar sobre el arroyo",
    "category": "Deporte",
    "place": "Puente de La Barra",
    "src": "./assets/editorial/onda_deporte_sup_puente_barra_01.webp"
  },
  {
    "id": "onda_bienestar_paseo_perro_mansa_01",
    "title": "El paseo es de los dos",
    "category": "Bienestar",
    "place": "Playa Mansa",
    "src": "./assets/editorial/onda_bienestar_paseo_perro_mansa_01.webp"
  }
].map(x=>Object.freeze(x)));
  if(!root.ONDAVisual)throw Error('Falta cargar visual-selector.js antes de visuals.js');
  const published=Object.freeze(catalog.map(x=>Object.freeze({...x,usage:root.ONDAVisual.usage(x.id)})));
  function forEvent(e){return root.ONDAVisual.select(e);}
  function allocate(events){return root.ONDAVisual.allocate(events);}
  root.ONDAVisuals=Object.freeze({catalog:published,forEvent,allocate});
})(globalThis);
