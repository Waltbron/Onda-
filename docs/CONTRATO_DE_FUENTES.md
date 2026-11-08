# Contrato de fuentes y reglas de calidad

Cada adaptador devuelve: `sourceId`, `sourceUrl`, `title`, `date`, `endDate?`, `time?`, `endTime?`, `city`, `place?`, `category`, `evidence[]`, `sourceItemId?`, `externalStatus?`.

- `date` y `endDate`: `YYYY-MM-DD` locales en `America/Montevideo`.
- `time`, `endTime`: `HH:MM` locales. No inventar horas; fecha sin hora es aceptable.
- El HTML estructurado debe contener fecha/hora con zona en ISO cuando incluye hora. Un ISO sin offset no puede convertirse de forma segura.
- `sourceUrl`: HTTPS, del dominio de la fuente aprobada; enlaza a un detalle canónico publicado.
- `evidence`: evidencia directa de la fecha, no la fecha de publicación de una noticia. Conserva origen en el propio campo.
- `externalStatus`: `cancelled`, `postponed`, `rescheduled` o vacío, basado en datos explícitos, nunca inferido por desaparición.
- No se deduce «gratis» por no encontrar precio; se muestra `Consultar en fuente`.

No se incluyen descripciones inventadas ni fotografías de eventos. No se descarga el HTML completo para publicar. Cada parser admite versión, test contra un HTML real autorizado y un umbral de confianza derivado de evidencia verificable.

## Puertas de calidad actuales

1. Fuentes sin permiso, sin evidencia o sin adaptador quedan apagadas.
2. robots.txt restrictivo, error HTTP, host distinto, respuesta rara o HTML demasiado grande → se conserva la última versión.
3. No hay fechas válidas / título / URL / evidencia / zona ISO → no se ingiere.
4. Cero fichas o errores del parser → fuente degradada.
5. Duplicado posible con las 29 manuales → revisión antes de fusionar.
6. Un 30 % de cambios o altas inesperados sobre una fuente con historial suficiente → bloqueo.
7. Un candidato nuevo caducado no se publica automáticamente.
8. Las correcciones manuales se justifican y no pueden alterar URL de procedencia.
9. Fechas de vencimiento visibles en la web siguen el módulo `event-time.js`; no son horas de finalización fácticas.
10. Los registros solo pasan a público desde una fuente expresamente marcada `automatic`, probada, autorizada y exitosa. El modo `fixture` jamás escribe el catálogo público.

## Limitaciones por resolver en los pilotos

- El parser genérico actual solo reconoce JSON-LD Event; la agenda MACA auténtica puede requerir otra implementación.
- Actividades recurrentes y múltiples funciones del mismo evento necesitan adaptadores específicos para no colapsar ocurrencias.
- Una URL que cambia de forma externa puede exigir reconciliación asistida; los aliases sugeridos no autorizan merge automático.
- Una ausencia en un listado no significa cancelación: no se eliminan automáticamente fichas en base a ausencias.
- Fechas o precios en prosa no se interpretan automáticamente, porque requieren evidencia suficiente.
- Cambios de último momento fuera de los canales publicados y entradas solo en Stories pueden no detectarse.
