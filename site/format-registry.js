// ONDA · Registro único de formatos y correspondencias con ilustraciones portables.
// Agregar un formato o una imagen genérica implica editar datos de este registro, no el selector.
// No confundir lugar/evento con categoría; la asignación de sedes exactas se conserva aparte.
(function(root){
 'use strict';
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const rules=Object.freeze([
  {id:'cine_proyeccion',category:'Cultura',label:'Cine',any:['\\b(cine|cineclub|documental|cortometrajes?|cortos|proyeccion|peliculas?)\\b'],asset:'onda_evento_cine_proyeccion_generica_01'},
  {id:'teatro_funcion',category:'Cultura',label:'Teatro',any:['\\b(teatro|funcion teatral|obra teatral|comedia escenica)\\b']},
  {id:'feria_literaria',category:'Cultura',label:'Literatura',any:['\\b(euforia del libro|feria (del |de )?libro|programacion literaria|tour literario|festival literario)\\b']},
  {id:'presentacion_libro',category:'Cultura',label:'Presentación de libro',any:['\\b(presentacion (de|del) (un )?libro|conversacion con autor|encuentro literario con autor)\\b'],asset:'onda_evento_presentacion_libro_autor_01'},
  {id:'ballet_clase',category:'Cultura',label:'Clase de danza',all:['\\b(ballet|danza clasica|masterclass de danza)\\b','\\b(clase|masterclass|taller|practica)\\b'],asset:'onda_evento_ballet_danza_clase_01'},
  {id:'charla',category:'Cultura',label:'Charla',any:['\\b(charla|conferencia|conversatorio|debate|panel)\\b'],asset:'onda_evento_charla_conferencia_generica_01'},
  {id:'taller_mosaico',category:'Cultura',label:'Taller artístico',any:['\\b(mosaico|taller de ceramica|taller de arte|taller de dibujo)\\b'],asset:'onda_cultura_taller_creativo_mosaicos_01'},
  {id:'exposicion',category:'Cultura',label:'Exposición',any:['\\b(exposicion|muestra de arte|exhibicion de pintura|esculturas)\\b']},
  {id:'jam_session',category:'Música',label:'Jam session',any:['\\b(jam( session)?|improvisacion musical)\\b']},
  {id:'jazz_en_vivo',category:'Música',label:'Jazz',any:['\\b(jazz|swing|bebop)\\b'],asset:'onda_evento_jazz_ensamble_vivo_01'},
  {id:'musica_camara',category:'Música',label:'Música de cámara',all:['\\b(chelo|violonchelo)\\b','\\b(piano|pianista)\\b'],asset:'onda_evento_musica_camara_chelo_piano_01'},
  {id:'concierto_rock_pop',category:'Música',label:'Rock / pop',any:['\\b(rock|pop)\\b']},
  {id:'concierto_en_vivo',category:'Música',label:'Concierto',any:['\\b(concierto|recital|musica en vivo|banda|cantautor)\\b']},
  {id:'electronica',category:'Fiestas',label:'Electrónica',any:['\\b(dj|techno|house|electronica|rave)\\b']},
  {id:'triatlon',category:'Deporte',label:'Triatlón',any:['\\b(triatlon|ironman)\\b']},
  {id:'running',category:'Deporte',label:'Running',any:['\\b(running|maraton|media maraton|5k|10k|recorre|rocha corre|urban race|carrera popular)\\b'],not:['\\b(triatlon|ironman)\\b'],asset:'onda_evento_running_carrera_popular_01'},
  {id:'ciclismo',category:'Deporte',label:'Ciclismo',any:['\\b(ciclismo|gravel|mountain bike|mountain-bike|mtb|bicicleta)\\b']},
  {id:'tenis',category:'Deporte',label:'Tenis',any:['\\btenis\\b'],asset:'onda_deporte_tenis_ultimo_punto_01'},
  {id:'surf',category:'Deporte',label:'Surf',any:['\\b(surf|surfear|surfista)\\b']},
  {id:'yoga',category:'Bienestar',label:'Yoga',any:['\\b(yoga|asanas|meditacion guiada)\\b'],asset:'onda_bienestar_yoga_patio_luminoso_01'},
  {id:'feria_gastronomica',category:'Gastronomía',label:'Feria gastronómica',any:['\\b(feria gastronomica|festival gastronomico|food trucks?)\\b']},
  {id:'feria_rural',category:'Cultura',label:'Feria rural',any:['\\b(feria de turismo rural|feria rural|pueblo gaucho)\\b']},
  {id:'paseo_naturaleza',category:'Aire libre',label:'Aire libre',any:['\\b(senderismo|caminata|dunas|naturaleza)\\b']}
 ].map(x=>Object.freeze(x)));
 function classify(event){
  const category=norm(event?.category);
  const desired=norm(event?.format_id);
  const text=norm([event?.title,event?.description,...(Array.isArray(event?.tags)?event.tags:[])].join(' '));
  const matches=(expr)=>new RegExp(expr).test(text);
  const explicit=rules.find(x=>x.id===desired&&norm(x.category)===category);
  if(explicit)return Object.freeze({...explicit,evidence:'format_id'});
  const rule=rules.find(x=>norm(x.category)===category&&(!x.any||x.any.some(matches))&&(!x.all||x.all.every(matches))&&(!x.not||!x.not.some(matches)));
  return rule?Object.freeze({...rule,evidence:'inferred'}):null;
 }
 function candidates(event){
  const format=classify(event);
  return format?.asset?[{id:format.asset,score:97,scope:'formato',description:format.label}]:[];
 }
 root.ONDAFormats=Object.freeze({rules,classify,candidates});
})(globalThis);
