# ONDA · Instalación práctica

## A. Publicar la web de prueba ahora (sin automatización)

1. Descomprimí `ONDA_V3_COMPLETO_GITHUB.zip` si es el archivo que recibiste.
2. Abrí la carpeta `ONDA_AUTO_V3/site` dentro de la descompresión.
3. En https://app.netlify.com/drop arrastrá **esa carpeta `site/`**, no el ZIP completo.
4. Netlify creará una URL de prueba. Conservá sin cambios `agendapde.netlify.app` hasta confirmar.
5. Comprobá filtros, vínculos a fuentes y comportamiento nocturno. El pie de página indicará correctamente que no hay ingestión automatizada activa.

**Nota:** una publicación manual NO habilita actualizaciones automáticas. Cada nueva versión de `events.json` debería volver a publicarse, salvo que Netlify esté integrado con GitHub.

## B. Preparar GitHub como fuente de la web y programador

1. Creá un repositorio **privado** nuevo, por ejemplo `onda-automatizador`, en https://github.com/new. No hace falta reutilizar `Waltbron/Pinto`, que hoy está vacío y público.
2. Subí **todos los archivos y carpetas**, incluidos `.github/workflows/onda-actualizar.yml`, a la **raíz** del repositorio. Al subir desde un equipo, cuidá incluir la carpeta oculta `.github`.
3. En GitHub, abrí **Settings → Actions → General → Workflow permissions** y seleccioná **Read and write permissions** para el token de GitHub Actions, si GitHub te permite esa opción. Esto permite guardar los JSON actualizados en el repositorio.
4. En **Actions**, habilitá el workflow si GitHub te lo pide. Abrí «ONDA · Actualización de eventos» → **Run workflow** → modo **ensayo**. Deben pasar tests y generar un reporte, sin alterar el catálogo.
5. En Netlify, creá otro sitio desde «Import from Git» y elegí ese repositorio. Publish directory: **`site`**. El `netlify.toml` de la raíz ya la configura. Cada commit válido activará un nuevo deploy. No sustituyas el sitio anterior todavía.

## C. Activar UNA fuente real (más adelante, tras validarla)

MACA queda pendiente hasta revisar los términos de `macamuseo.org`, su `robots.txt` crudo y el HTML auténtico de su agenda pública. No se consulta el portal de reservas `entradas.macamuseo.org`.

1. Revisá el acceso de esa fuente; conservá la evidencia de revisión o conformidad y su fecha.
2. Capturá **una vez** su HTML real en entorno autorizado y comprobá si incluye `Event` JSON-LD; si no lo incluye, necesitaremos agregar un adaptador específico y probarlo. Nunca inventar fechas.
3. En `data/sources.json`, para la fuente probada, configurá:
   - `enabled: true`
   - `permission: "approved"`
   - `permissionEvidence: "Fecha y fundamento comprobable de la revisión"`
   - `publicationPolicy: "review"` mientras se comprueban los resultados.
4. Configurá variables de GitHub en **Settings → Secrets and variables → Actions → Variables**:
   - `ONDA_CONTACT_EMAIL`: correo válido que identifica al operador frente a la fuente.
   - `ONDA_AUTOMATION_ENABLED`: `true` **solo cuando estés listo para ejecutar los conectores aprobados**.
5. Ejecutá manualmente modo **produccion** (que con política `review` SOLO registra revisión; no agrega fichas nuevas), inspeccioná 100 % de los horarios y duplicados y evaluá cómo reacciona a fuentes fallidas.
6. Cuando haya evidencia suficiente y quieras publicación sin revisión cotidiana, poné `publicationPolicy: "automatic"` para ESA fuente; dejá todas las demás desactivadas. Repetí la prueba, verificá `site/data/events.json` y el deploy de Netlify de prueba.

**Importante:** el motor rechazará páginas sin eventos estructurados válidos. Eso es una medida de seguridad, no un fallo de instalación.

## D. Actualizaciones programadas

El workflow está configurado para **dos intentos diarios** a las **08:30 y 20:30 (America/Montevideo)** mediante GitHub Actions, sujeto a su tolerancia habitual de ejecución. Esos intentos solo hacen captura y publicación cuando `ONDA_AUTOMATION_ENABLED=true` y la fuente está debidamente habilitada. Antes, ejecutan pruebas de manera inocua.

Al publicar, el motor guarda `data/automatic.json`, `data/state.json`, `data/reports/latest.json`, `site/data/events.json` y `site/data/meta.json`; los commits activan el despliegue de Netlify conectado al repositorio. Si hay una verificación nueva, GitHub puede registrar un commit de estado aunque el contenido de eventos no cambie; esto conserva el historial de lecturas.

## E. Recuperación y reversión

- Si una fuente devuelve un HTML vacío o falla, el motor conserva la última información publicada y marca el problema en el informe.
- Las ausencias sin prueba no se interpretan como cancelaciones.
- Si un cambio masivo parece anómalo, queda bloqueado.
- Una modificación equivocada se puede revertir en GitHub usando el historial del commit anterior. Una excepción puntual se resuelve en `data/overrides.json`, con una justificación.
- Si Github Actions falla, mirá el job y su reporte antes de repetirlo; corregí la fuente y ejecutá «Run workflow».

## Preguntas frecuentes

**¿Puedo subir solo los HTML y tener eventos siempre al día?** No: eso produce la web estática con el catálogo que haya en ese momento. La automatización vive en GitHub Actions o un ejecutor equivalente.

**¿Hay que ingresar 75 URLs?** No. Se empieza con un único conector validado. Las 75 entradas son un inventario de candidatos; cada fuente requiere parser y verificación.

**¿El motor va a buscar eventos en Instagram?** No, no hay acceso implementado ni se promete sortear restricciones de Instagram.

**¿Cuántos conectores reales están activos en esta entrega?** Cero. La instalación y la aprobación de fuentes son necesarias para pasar a producción.
