# ONDA · Hormiga Lab | Motor de eventos

**Estado comprobado:** 21/11/2026. **Entorno:** [ONDA Lab](https://onda-lab-hormiga.netlify.app/) (no es el sitio principal de Hormiga). **Rama:** `chore/instalar-motor-v3-1`.

## Resultado operativo

- 1 conector real habilitado: `events-uy-deportes`, mediante API pública GitHub, sin scraping de HTML. Datos deportivos de [events.uy contributors](https://github.com/suzrik/data.events.uy) bajo **CC BY 4.0**, con atribución en cada ficha y enlace al origen.
- La primera captura incorporó 15 eventos; una segunda corrida volvió a detectar 15 y produjo **0 altas, 0 modificaciones y 0 duplicados**.
- Catálogo de Lab: **75 fichas = 60 editoriales/manuales + 15 automáticas**. De esas, 30 tienen fecha de cierre desde el 21/11/2026. Una fecha futura NO garantiza que el evento esté reconfirmado hoy. Se conservan los `checkedAt` históricos.
- Biblioteca visual: **38 WebP**, respaldados en Drive. La ingesta preserva los metadatos de biblioteca; las ilustraciones son conceptuales, no fotografías de cada evento.
- Cuatro incorporaciones editoriales comprobadas el 21/11: Festival Internacional de Guitarra de Maldonado, El coleccionista de cuentos (MACA), Natalio Faingold y Amelí (MACA), clase abierta/masterclass (MACA).
- Pruebas: [primera captura](https://github.com/Waltbron/Onda-/actions/runs/44953937448), [segunda corrida idempotente](https://github.com/Waltbron/Onda-/actions/runs/44954016436) y [CI final de Lab](https://github.com/Waltbron/Onda-/actions/runs/44954279449). Netlify confirmó despliegue `ready`.
- La inspección visual externa directa del sitio no pudo completarse desde el verificador web; falta chequeo manual de render y enlaces en móvil.

## Actualización automática

[Workflow de ejecución programada](https://github.com/Waltbron/Onda-/blob/main/.github/workflows/onda-lab-catalogo.yml): 08:30 y 20:30 hora de Uruguay (`30 11,23 * * *` UTC), en GitHub Actions. Reside en `main` para que opere el calendario de GitHub, pero **hace checkout y escribe únicamente en la rama Lab**. El primer disparo tuvo éxito.

El workflow de la rama Lab (`.github/workflows/onda-actualizar.yml`) mantiene pruebas de integridad y ensayos sin publicación. La ejecución real se separó de los pushes de desarrollo para evitar conflictos de Git y despliegues redundantes.

Comandos útiles en la rama Lab (Node 22):

```bash
npm test
npm run check
npm run radar:review
npm run sources:plan
npm run preview                  # solo fixture, no publica
ONDA_AUTOMATION_ENABLED=true GITHUB_TOKEN=<token> npm run ingest:publish
```

No colocar tokens en archivos ni commits. `scripts/run.mjs` rechaza publicación de fixtures; sin `ONDA_AUTOMATION_ENABLED=true` no publica.

## Arquitectura y responsabilidades

`datos abiertos autorizados → GitHub API → parser YAML limitado → validación → detección de duplicados → catálogo automático → site/data/events.json → commit en rama Lab → Netlify`.

- `data/manual.json`: catálogo editorial conservado, con fuente y fecha de revisión.
- `data/automatic.json`: datos de fuentes habilitadas y auditables.
- `data/sources.json`: controles por conector, licencia/acceso, estado y política de publicación.
- `data/source-inventory-75.json`: **75 fuentes candidatas**, no 75 conectores activos.
- `engine/src/open-sports.mjs`: conector abierto con filtros de zona, fecha exacta y estado confirmado. Evita eventos tentativos y enlaces no HTTPS.
- `engine/src/pipeline.mjs`: identidad estable, inmutabilidad manual, bloqueo de duplicados y protección ante cambios masivos.
- `engine/src/source-planner.mjs`: priorización sin solicitudes externas. `npm run sources:plan` genera cola local de revisión.
- `site/data/events.json`, `site/data/meta.json`: agenda y estado consumidos por la interfaz.
- `data/reports/latest.json`, `data/state.json`: trazabilidad de la última corrida.
- `site/assets/editorial/`: WebP publicados, distintos de los originales del archivo maestro de Drive.

## ONDA Foto v1: tres niveles visuales

Jerarquía: **foto real autorizada + filtro CSS nativo → ilustración pertinente de la biblioteca aprobada → serigrafía ONDA → tarjeta tipográfica si falla la carga**. No hay dependencias nuevas ni transformación en servidor. Las imágenes remotas pueden fallar por protección anti-hotlink.

Campos opcionales en cada evento (se requieren todos para mostrar foto): `imageType: "photo"`, `imageUrl` (HTTPS o asset local), `imageAlt`, `imageCredit`, `imageSourceUrl` (HTTPS), `imageRightsStatus` (`owned`, `licensed` o `authorized`). El estado declarado nunca reemplaza la verificación efectiva de derechos. Sin foto permitida se usa la biblioteca existente. Tratamiento ajustable en `site/styles.css` por `--onda-foto-*`. No se inventan fotos ni eventos.

### Paleta de marca para fotos · v1.2 (23/11/2026)

El filtro utiliza directamente las variables CSS de identidad ONDA (`--ink` azul tinta, `--cobalt` azul cobalto, `--accent` coral y `--paper` marfil) y un overlay de color que permite seguir reconociendo la fotografía. La muestra incluye chips con los cuatro colores. Se modificó el tratamiento visual de fotografías; ilustraciones aprobadas y catálogo de eventos permanecen intactos. La fórmula CSS puede ajustarse sin procesamiento de imágenes, nueva librería ni servicio externo.

### Demostración visual verificada por derechos: Foto v1.1

ONDA Lab incluye un [comparador](https://onda-lab-hormiga.netlify.app/#onda-foto-lab) con una fotografía real CC0 de Laura Wielo (Wikimedia Commons), sin filtro y con filtro ONDA. Es un recurso de prueba, no corresponde a Medio y Medio ni a ningún evento de la agenda. Las tarjetas de agenda seguirán mostrando la biblioteca y el fallback mientras no haya fotografías específicas con derechos y procedencia documentados. No activa scraping ni imágenes sintéticas.

## Reglas que permanecen vigentes

**No están habilitadas** las ticketeras RedTickets, CobraTicket, Portal Bosque ni los conectores MACA/IDM. Son candidatas para pilotos separados y requieren revisar condiciones, robots/API o acuerdo correspondiente. No inventar un catálogo ni promocionar automáticamente pistas del radar sin corroborarlas.

El uso de datos de events.uy exige atribución de colaboradores y licencia CC BY 4.0. El enlace al organizador es orientativo: ONDA no garantiza disponibilidad, horarios, precios ni inscripciones. Una omisión en la fuente no se interpreta por sí sola como cancelación.

La página principal de Hormiga y la rama `main` del sitio ONDA no se reemplazaron por el catálogo Lab.

## Siguiente P0

Ampliar fuentes culturales, música y fiestas con acceso autorizado y parsers comprobados; resolver calidad y frescura por evento, buscar duplicados entre proveedores y comprobar el comportamiento en Android. El programa trilingüe ES/EN/PT está aprobado como dirección de producto, pero **aún no implementado**.

Registro de avance y decisiones: [Notion · ONDA tablero](https://app.notion.com/p/41f2d8c76d5381a5b1ccf055514e5876).
