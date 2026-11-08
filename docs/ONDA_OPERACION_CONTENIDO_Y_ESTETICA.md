# ONDA · Sistema operativo de contenido y estética
Fecha de auditoría: 2026-11-08. Entorno: rama de prueba, sin publicación automática habilitada.

## Qué es ONDA
Dos experiencias complementarias:
- **Explorar agenda**: inventario amplio y confiable de eventos, exposiciones, actividades, experiencias recurrentes y efímeras del Este; buscador, filtros, fechas y localización.
- **Dame una idea / Ahora pinta**: selección corta (hasta tres) basada en el inventario, con un porqué editorial basado en señales, jamás eventos inventados.

Área inicial: Maldonado, Punta del Este, La Barra, Manantiales, José Ignacio, Punta Ballena, Piriápolis, San Carlos, Garzón y lugares próximos.

## Fuentes (situación real)
Inventario de 75 fuentes o familias: NO equivale a 75 conectores. En `data/sources.json` hoy hay **2 configuraciones y 0 fuentes activas**: MACA agenda pública y noticias de IDM, ambas pendientes de permisos y de verificación con HTML real. No usar sitios de reservas de terceros si sus condiciones prohíben la extracción.

Prioridad de captura:
1. Sitios oficiales y fuentes primarias de organizadores, instituciones y ticketeras que permitan consultas automatizadas.
2. RSS, feeds, APIs, calendarios ICS o datos estructurados con permiso, cuando existan.
3. Agregadores y agendas competidoras para descubrir pistas y cobertura faltante; **volver a la fuente primaria para verificar cada dato** y respetar condiciones de uso.
4. Redes sociales para señales y difusión cuando la información sea accesible legítimamente; una historia o imagen aislada no basta para publicar fecha/hora.

Etiquetar orígenes: origen inicial, URL oficial, hora observada, hora verificada, evidencia de fecha/hora/lugar, vigencia, estado de venta, posibles duplicados, reprogramaciones, fuente de imagen y permisos.

## Canal 1 · Motor determinístico (GitHub Actions)
Captura autorizada -> parser de la fuente -> normalización con America/Montevideo -> validación -> deduplicación por identidad estable + coincidencias posibles -> revisión para dudas -> `data/automatic.json` -> `site/data/events.json` -> Netlify (solo rama/entorno autorizado).

Conservar último catálogo bueno si una fuente falla, sin inferir cancelación por ausencia. No modificar `data/manual.json` de forma automática. Reportar salud, cantidad de eventos nuevos, modificaciones, caducados y bloqueos.

La automatización programada está en `.github/workflows/onda-actualizar.yml`, pero no captura fuentes reales hasta habilitación explícita. El entorno de laboratorio no debe confundirse con producción.

## Canal 2 · Radar ONDA (tarea programada de ChatGPT)
Reutilizar, **solo con aprobación del usuario**, la tarea existente «Fiestas early bird Punta». Extender la investigación de electrónica a música, arte, instituciones, cultura, cine, deporte, talleres, gastronomía, ferias, caminatas guiadas y experiencias de temporada. No sustituye al motor: es un **descubridor de candidatos**, que puede detectar pistas donde no hay feeds.

Cada corrida debería emitir una pequeña ficha estructurada con fecha/hora y URL; una sola evidencia ambigua queda en estado pendiente. La tarea no publica fichas en la web ni supone que puede modificar GitHub/Drive si esas acciones no están disponibles en su ambiente. Cuando se confirme la capacidad de escritura del entorno de automatizaciones, su destino será `data/radar/inbox-YYYY-MM-DD.json`; si no, el reporte se almacena en la bandeja Drive y se procesa en sesión. Nunca prometer sincronía automática sin una prueba real de extremo a extremo.

**Bandeja Drive creada:** https://drive.google.com/drive/folders/19m8P_RhdzOR1F-92dmkYHqKfIc3ck8Q_

## Estados mínimos
`descubierto` (señal con URL) -> `por_verificar` (evidencia insuficiente) -> `verificado` (datos oficiales corroborados) -> `publicable` (política de fuente aprobada) -> `publicado` (JSON de web con versión y fuente). Las cancelaciones explícitas cambian estado; la desaparición de un listado no.

La curaduría de «Dame una idea» se hace después sobre eventos ya publicados, no antes, y no debe limitar la cantidad que aparece en agenda.

## Biblioteca gráfica única
Fuente editorial canónica: https://drive.google.com/drive/folders/1CD-3bDJRX4eujSznyH9cmx_IE2HLRjPK
Manifiesto canónico: `onda_assets_manifest.json` versión 1.3.0 (13/10/2026). De 26 variantes previstas: 13 imágenes aprobadas y con referencia de archivo (4 música, 4 gastronomía, 4 arte y cultura, 1 naturaleza), 11 pendientes; otras dos gastronómicas anteriormente aprobadas sin originales localizados. El manifiesto **no** es licencia de uso de imágenes ajenas.

Dirección: editorial costera; marfil/arena, azul tinta, coral, detalles pop, siluetas 4:3 individuales sin rótulos, variedad estable por evento. Evitar repetir una imagen entre eventos cercanos cuando haya alternativas. Priorizar fotografía oficial con autorización; las ilustraciones son **genéricas**, no fotos del evento.

**Drive es taller de producción, no CDN.** Para Netlify: aprobar + exportar WebP optimizado + subir a `site/assets/editorial/` con nombres estables + asociar imagen con categoría/ID en el renderizador. No enlazar archivos privados de Drive directamente en `src` público. No reemplazar recursos pendientes con versiones inventadas o no aprobadas.

## Métricas de lanzamiento
Contar por semana: eventos futuros publicados y confirmados, tasa de error/duplicados, fuentes automáticas realmente activas, cobertura por localidad/categoría y % de fichas verificadas en los últimos 7 días. Validar si «Dame una idea» reduce tiempo hasta decidir, no solo clics o visitas.

## Próxima fase
1. Autorizar reconversión de la tarea early bird; probar un reporte antes de cualquier integración de escritura.
2. Verificar y conectar la primera fuente oficial con permisos y parser real.
3. Conectar las 13 imágenes aprobadas al frontend en la rama de laboratorio y revisar visualmente.
4. Ampliar a fuentes oficiales/ticketeras y lanzar métricas de cobertura. No desplegar cambios al sitio anterior sin autorización.
