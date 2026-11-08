# ONDA · Radar secundario y catálogo extenso (propuesta pendiente de aprobación)

Fecha: 2026-11-08. Este documento **no activa conexiones, tareas ni publicaciones**.

## Principio editorial de ONDA

Dos superficies comparten un catálogo confiable:
- **Explorar**: agenda amplia, buscable por fecha, zona, categoría, precio, con fuente original y estado de verificación visible.
- **Dame una idea / Ahora pinta**: 1–3 recomendaciones contextualizadas, seleccionadas entre eventos verificados y vigentes, con explicación y enlace. La relevancia editorial no debe decidir si un evento válido pertenece al catálogo general.

La fuente canónica de datos publicados continúa siendo `site/data/events.json`; el inventario y estado de fuentes reside en `data/sources.json` y `data/source-inventory-75.json`. Nunca confundir 75 fuentes inventariadas con 75 conectores activos: a esta fecha hay 0 conectores reales activos.

## Canal A: GitHub Actions (determinista)

Ingesta con fuentes autorizadas, adaptadores versionados, reconciliación por ID canónico, deduplicación y corte por fecha local `America/Montevideo`. Mantener el último catálogo bueno cuando hay degradación. Validación de permisos/robots/condiciones de uso por fuente. No asumir cancelación por desaparición. No replicar fotografías, reseñas ni descripciones completas de otras webs sin derechos.

## Canal B: tarea ChatGPT «Fiestas early bird Punta» (propuesta)

Tarea existente: `6ab6fd68baac8191a0c3ebce74d05fc5` (activa, frecuencia diaria). **No se modificó**.

Reconversión propuesta: `Radar ONDA · Descubrimiento diario`. Ampliar de electrónica a cultura, gastronomía, vida nocturna, música, deporte, exposiciones, aire libre, actividades gratuitas y eventos de última hora, focalizando Maldonado, Punta del Este, La Barra, Manantiales, José Ignacio, Punta Ballena, Piriápolis y San Carlos. Explorar ticketeras, productores, venues, municipios, museos, medios y agregadores (solo como pistas).

Cada candidato debe ajustarse a `data/radar-candidate.schema.json`: fuente original, URL de detalle, fecha del evento (no fecha de la publicación), ciudad, lugar, estado de validación y `observed_at`. Horario, entradas y precio solo si hay evidencia. Si falta una condición esencial: `needs_review` y **no publicar**.

Separar dos salidas:
1. **ONDA público:** candidatos verificados para alimentar la agenda; su amplitud no depende de gustos personales.
2. **Selección personal Waltbron:** avisos puntuales sobre oportunidades especialmente alineadas con preferencias personales, sin usar esos gustos para excluir de ONDA público.

**Traspaso automatizado:** hoy no está verificada la capacidad de una tarea ChatGPT de escribir un JSON directamente en este repositorio. Primero ejecutar un piloto con salida estructurada en el chat / Drive privado, medir duplicados y calidad, y confirmar de forma explícita la disponibilidad de un conector de escritura en la ejecución de Automations. Solo después conectar un archivo `data/inbox/radar-` al pipeline mediante PR o paso autorizado. Nunca asumir que «la tarea envía resultados a GitHub» porque la búsqueda se ejecutó.

## Estados

- `discovered`: pista encontrada, pendiente de corroboración.
- `needs_review`: ambigüedad en fechas, lugar, precio, duplicado o derechos.
- `verified`: fuente oficial vigente y datos esenciales confirmados.
- `rejected`: fuera de cobertura, erróneo o sin procedencia confiable.
- `expired`: evento transcurrido.
- `cancelled`: solo por cancelación explícita verificada.

## Dedupe y calidad

Unificar por ID estable / enlace canónico, título normalizado, venue, comienzo local y artistas. Guardar múltiples enlaces de evidencia pero una sola ficha; preservar ocurrencias distintas de ciclos y festivales. Entrada desde agregador = pista; revisar organizador/ticketera. Contrastar zona, geolocalización, horario y precio. No inventar. Fechas sin hora pueden publicarse indicando «hora no informada» si la fuente es confiable.

## Piloto medible

Durante 7 días recolectar candidatos en modo `no_publish`, con métricas: candidatos nuevos, confirmados, duplicados, vencidos, tasa de error, tiempo de verificación, eventos por localidad y cobertura por categoría. La primera publicación será pequeña y supervisada. Habilitar nuevas fuentes solo tras ensayos reales, autorización y aprobación.

## Aprobación solicitada al fundador

Autorizar la **reconversión de la tarea existente**, conservando frecuencia diaria y privilegiando notificaciones solo para hallazgos importantes; y autorizar un piloto de 7 días **sin publicar automáticamente**. No autoriza modificar sitio público, hacer gastos, scraping de sitios prohibidos ni publicar fuentes no verificadas.
