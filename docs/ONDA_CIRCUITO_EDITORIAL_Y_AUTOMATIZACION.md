# ONDA — Dos capas, una base de datos de eventos

**Estado al 08/11/2026.** Documento de operación. No implica permiso para scrapeo, publicación ni modificación de la automatización existente.

## Objetivo de producto

**Capa 1: Agenda extensa** — permitir descubrir y filtrar una gran cobertura de eventos reales en Maldonado, Punta del Este, La Barra, Manantiales, José Ignacio, Punta Ballena, Piriápolis y San Carlos. Buscar por día, zona, precio, tipo de experiencia y lugar. La cobertura no obliga a recomendar todos los eventos.

**Capa 2: Curador ONDA / «Ahora pinta»** — producir pocas recomendaciones elegidas entre el catálogo **validado**, considerando inmediatez, singularidad, precio, cercanía, clima cuando corresponda y oportunidad. Las recomendaciones no deben fabricarse si el catálogo está vacío.

**Separar fichas de eventos de experiencias permanentes**, como paseos o museos sin función puntual, en el modelo de datos (`event`, `recurring`, `experience`, `offer`). Un anuncio de prensa o cambio de precio no es automáticamente un evento.

## Pipeline propuesto

```
Fuentes oficiales / ticketeras / agendas / agregadoras
    -> observación con URL y fecha de consulta
    -> candidatos normalizados (bandeja de entrada)
    -> comprobación fecha-lugar-fuente / duplicados / vigencia
    -> catálogo automático + catálogo manual + exclusiones editoriales
    -> JSON público versionado
    -> GitHub Actions + Netlify
    -> AGENDA COMPLETA + CURADOR («Ahora pinta»)
```

Un agregador o competidor puede servir para **descubrir** un candidato, pero preferir la fuente primaria al verificar y publicar. Respetar permisos, condiciones de uso, límites de consulta y derechos sobre imágenes. No tomar fotografías, copys extensos ni bases de datos completas de terceros sin autorización.

## Dos motores complementarios

### A. Motor estructurado (GitHub Actions)

Es la fuente de verdad para el JSON publicado. Mantiene IDs estables, checks de validez temporal, deduplicación, conservadurismo ante fuentes que fallan, fechas `America/Montevideo`, histórico de cambios y reportes.

**Situación actual:** versión V3.1 probada; 55 pruebas correctas; 29 eventos históricos manuales; 0 conectores reales activos. MACA requiere permiso y HTML real, Intendencia necesita parser. Las 75 fuentes son inventario de trabajo, NO conectores en producción.

### B. Radar de hallazgos (tarea ChatGPT)

Radar secundario propuesto: reutilizar la tarea existente `Fiestas early bird Punta` para descubrir nuevos candidatos en todas las categorías y zonas. Debe generar objetos conforme a `data/discovery-inbox/schema.json`, distinguir fuente primaria de agregador y notificar al fundador solo si hay un bloqueo o hallazgo excepcional. **No modificar la tarea hasta aprobación expresa.**

**Importante:** una tarea de ChatGPT que responde en el chat **no es una ingesta en GitHub**. Hay que validar en una corrida de prueba si el entorno de esa automatización puede escribir en Drive/GitHub. Sin esa prueba, guardar el resultado en el chat y no afirmar publicación. Como puente robusto, preparar importador/revisión de candidatos en GitHub, con escritura autenticada y trazabilidad.

## Política editorial y de datos

- **Descubrimiento:** dato incompleto puede ingresar a la bandeja, nunca a la web.
- **Validación:** exigir título, inicio o recurrencia confiable, lugar o zona verificable, URL de fuente, fecha de consulta, estado de venta cuando aplica. Fuentes independientes o primarias preferibles.
- **Duplicados:** comparar nombre normalizado, fecha, ciudad, lugar, URL original/alias; nunca fusionar sin evidencia suficiente.
- **Cambios:** ante reprogramación confirmar fuente; un listado vacío NO significa cancelación.
- **Caducidad:** expirar visualmente con zona horaria Uruguay y preservar registro histórico.
- **Publicación:** una misma ficha puede aparecer en agenda y curaduría, pero no duplicada como evento.
- **Criterios personales:** mantener las preferencias personales de los radares de Waltbron separadas de las prioridades del producto ONDA.
- **Arte:** usar biblioteca ilustrativa aprobada de Drive, no copiar imágenes de competidores. Nombre/evento y etiquetas van como HTML/CSS, no impresos en la ilustración.

## Entregables ya registrados

- `data/visual-assets-registry.json`: estado auditado de recursos de Drive, sin asumir que están publicados.
- `data/discovery-inbox/schema.json`: contrato de candidatos de las tareas.
- `data/discovery-inbox/README.md`: protocolo de validación y revisión de candidatos.

## Próximas prioridades reales

1. Activar y validar **una** fuente primaria autorizada; lograr una primera actualización real verificable, con fuente original y sin duplicados.
2. Demostrar el paso `radar ChatGPT -> inbox GitHub/Drive` en una corrida observada, **antes** de depender de él.
3. Incorporar WebP aprobados de Drive al frontend de prueba con selección estable, sin sustituir gradientes cuando no existe asset.
4. Ampliar cobertura mediante fuentes priorizadas. Medir eventos únicos vigentes, precisión y tiempo desde anuncio a publicación.
5. Solo entonces escalar número de fuentes y curaduría «Ahora pinta».

**Aprobaciones pendientes:** modificación de tarea existente; primera activación de extracción externa; publicación automática en sitio.
