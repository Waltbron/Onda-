# ONDA 🐜 — Bitácora operativa y transferencia entre conversaciones

**Estado del documento:** vivo · **Actualización inicial:** 2026-11-08 (America/Montevideo)  
**Repositorio de referencia:** https://github.com/Waltbron/Onda-  
**Sitio de laboratorio:** https://onda-lab-hormiga.netlify.app  
**Propósito:** permitir que una conversación nueva (ChatGPT, Claude u otro colaborador) retome el trabajo sin reconstruir decisiones, confundir propuestas con implementaciones ni perder problemas abiertos.

> **Instrucción de arranque:** leer este archivo, los enlaces de evidencia relevantes, el manifiesto de producto y el estado real de GitHub/Netlify antes de modificar ONDA. Este archivo NO sustituye el código ni las comprobaciones actuales. Si contradice al repositorio o al despliegue, comprobar el dato, registrar la discrepancia y corregir el estado.

## 1. Una página de situación — 2026-11-08

### Norte del producto — decisión del fundador
ONDA no pretende ser «otra agenda»: aspira a ser la referencia útil de qué hacer en Punta del Este, Maldonado y su costa. Tiene **dos capas complementarias**:
1. **AGENDA amplia y verificable:** eventos de hoy y del futuro, con zonas, fechas, precios, lugares y enlaces auténticos. No se filtra por los gustos personales del fundador.
2. **CURADURÍA «Ahora pinta» / «Dame una idea»:** pocas opciones relevantes, justificadas y elegidas *del inventario fiable*. No inventar propuestas para llenar una pantalla.

**Tercera familia diferenciada:** **ONDA Spots**, experiencias permanentes, paseos, espacios singulares y rincones locales, sin fechas ficticias de evento. Contexto meteorológico y descubrimiento más adaptativo son evoluciones futuras, no capacidades actuales verificadas.

**Cobertura inicial:** Maldonado, Punta del Este, San Carlos, La Barra, Manantiales, José Ignacio, Punta Ballena, Piriápolis y alrededores.

**Principio operativo:** máxima autonomía ordinaria con intervención humana sólo ante excepciones y decisiones importantes. El fundador conserva autorización sobre gastos, publicaciones externas/marketing, cambio estratégico, credenciales y fuentes de permiso dudoso.

### Diagnóstico técnico comprobado
| Frente | Estado observado | Qué NO equivale a decir |
|---|---|---|
| Código | Repositorio público `Waltbron/Onda-`; `main` y rama de laboratorio `chore/instalar-motor-v3-1` existen. | No significa que todo lo creado en laboratorio esté desplegado. |
| Netlify | Sitio `onda-lab-hormiga` existe; el conector informó despliegue actual `ready` el 08/11. | No prueba que cada archivo de la rama esté visible en su dominio principal. |
| Catálogo | `main/site/data/events.json` tenía **33 fichas**; la rama de laboratorio, **38** (lectura GitHub del 08/11). Son registros históricos y futuros mezclados. | 38 fichas no son 38 eventos vigentes hoy. |
| Ingesta | `data/automatic.json`: **0**. `data/sources.json`: **3 conectores definidos, todos desactivados** con permisos o adaptadores pendientes. | 75 fuentes inventariadas no son 75 fuentes conectadas. |
| Radar | Tarea ChatGPT **«Radar ONDA · GitHub diario» habilitada**; última ejecución informada: 08/11/2026 a las 10:14 (Uruguay). | Una tarea activa NO prueba escritura desatendida a GitHub en cada corrida. |
| Bandeja | Rama laboratorio: `data/radar/inbox-2026-11-08.json` con **11 candidatos**; `main` tenía **4**. Todos review-only / `publicationAllowed:false`. | Candidatos no son eventos aprobados ni publicados. |
| CI | `.github/workflows/onda-actualizar.yml` en main; corridas exitosas el 08/11, incl. una en la rama lab. Cron definido para 08:30 y 20:30 de Uruguay. | Pruebas exitosas no son ingesta en vivo. El cron de GitHub Actions utiliza normalmente la rama por defecto. |
| Diseño | Biblioteca editorial original en Drive; registro de 13 WebP aprobados e integrados en rama de laboratorio según manifiesto de esta rama. | No asumir que todas las categorías o variantes están completas en el sitio publicado. |
| Auditoría | Se registraron omisiones de agenda IDM y un PR de auditoría fue integrado a main. | Es una muestra, no una medición representativa de cobertura total. |

**Evidencias:** [Repo](https://github.com/Waltbron/Onda-), [workflow](https://github.com/Waltbron/Onda-/blob/main/.github/workflows/onda-actualizar.yml), [catálogo main](https://github.com/Waltbron/Onda-/blob/main/site/data/events.json), [catálogo laboratorio](https://github.com/Waltbron/Onda-/blob/chore/instalar-motor-v3-1/site/data/events.json), [candidatos laboratorio](https://github.com/Waltbron/Onda-/blob/chore/instalar-motor-v3-1/data/radar/inbox-2026-11-08.json), [Actions](https://github.com/Waltbron/Onda-/actions), [PR de auditoría #3](https://github.com/Waltbron/Onda-/pull/3).

**Fotografía temporal, no verdad permanente:** antes de informar «actual», volver a contar eventos y revisar despliegues, PR, fuentes, acciones y task.

## 2. Arquitectura acordada (responsabilidades separadas)

```text
MOTOR A · GitHub Actions (ingesta estructurada)
fuentes permitidas -> adaptadores -> validación -> deduplicación
-> JSON versionado y pruebas -> despliegue Netlify Lab

MOTOR B · Radar de ChatGPT (descubrimiento y auditoría)
fuentes complementarias -> candidatos documentados -> data/radar/inbox-AAAA-MM-DD.json
-> revisión / contraste / bloqueo de duplicados
-> SÓLO una promoción aprobada puede pasar al catálogo publicable

AUDITORÍA
eventos externos contrastados vs ONDA -> omisión observada
-> causa demostrada o hipótesis -> corrección medible -> pruebas
```

**No conectar por suposición:** ChatGPT Automations no es un webhook ni una API garantizada de escritura. Se debe ejecutar una tarea futura y comprobar el archivo, SHA/commit y ejecución correspondiente antes de declarar fiable el puente.

**Publicación:** `descubierto → por verificar → verificado → publicable → publicado`. Fecha, ciudad, recinto y URL de procedencia deben sostenerse con evidencia; no usar la fecha de una noticia como fecha del evento. Una fuente inaccesible no implica cancelación. No eludir accesos ni reutilizar imágenes sin derechos. No habilitar `ONDA_AUTOMATION_ENABLED` o producción sin precondiciones verificadas.

## 3. Decisiones y restricciones que no se deben reabrir por inercia

- **[Fundador · vigente]** Agenda amplia del Este + curador breve, con sitios permanentes separados.
- **[Fundador · vigente]** Mínimo mantenimiento manual diario; el sistema debe detectar omisiones y aprender mediante mejoras verificadas, no «IA mágica».
- **[Fundador · vigente]** Reutilizar el antiguo radar personal de fiestas Early Bird como **Radar ONDA diario**; conservar una sección de oportunidades personales, pero nunca usar sus preferencias para censurar la agenda general.
- **[Fundador · vigente]** Estética editorial propia, sin apariencia de collage genérico de IA; biblioteca de ilustraciones en Drive.
- **[Fundador · vigente]** Mantener ONDA Lab separado del sitio histórico; los cambios estratégicos, pagos, anuncios y publicaciones externas requieren supervisión.
- **[Fundador · 2026-11-08]** Necesitamos una bitácora Markdown útil y persistente para que el límite de un chat no reinicie el proyecto.
- **[Propuesta técnica aceptada en el trabajo del laboratorio]** GitHub/JSON/Netlify y pruebas deterministas primero; IA para descubrir, interpretar y auditar, sin autorizar automáticamente datos dudosos.
- **[No decidido como hecho]** Escala comercial, pauta de Instagram, clima integrado, panel administrativo completo y nuevos conectores: siguen siendo hipótesis, pendientes o etapas futuras.

## 4. Backlog ejecutivo, ordenado por dependencia

| Prioridad | Trabajo verificable | Criterio de terminado | Situación |
|---|---|---|---|
| P0 | Demostrar un conector primario real (IDM /actividades u otra fuente permitida). | Evidencia de acceso permitido, parser probado con datos actuales, validación y una actualización verdadera. | **Pendiente**: 0 conectores activos. |
| P0 | Verificar puente **tarea ChatGPT → bandeja GitHub** de forma desatendida. | Nueva corrida programada escribe archivo; se observa commit real, SHA, conteo y CI sin intervención manual. | **No demostrado aún**. |
| P0 | Demostrar **candidato → validación → publicación en ONDA Lab**. | Evento elegible y confirmado llega al JSON, pasa pruebas, aparece en sitio; dudosos no aparecen. | **Pendiente**. |
| P1 | Medir cobertura y aprender de omisiones. | Reporte semanal con ejemplos, causas observadas vs hipótesis, acciones correctivas y resultados. | **Iniciado**; no extrapolar porcentajes totales. |
| P1 | Incorporar ONDA Spots. | Colección separada de 20–40 opciones verificadas y variedad geográfica sin fechas falsas. | **Planificado**. |
| P1 | Mejorar portada para baja densidad. | Mostrar próximos eventos y spots sin aparentar «no pasa nada» al no haber eventos hoy. | **A validar en web real**. |
| P2 | Clima, heurísticas de contexto y pruebas con usuarios. | Resultados útiles medidos, privacidad cuidada, fuentes del clima verificadas. | **Futuro**. |
| P2 | Difusión y marketing automatizado. | Aprobaciones y presupuesto separados, métricas y controles. | **No autorizado para ejecutar**. |

## 5. Protocolos para que esta bitácora sirva

### Al comenzar cualquier conversación
1. Leer **esta bitácora**, el [manifiesto de producto](https://github.com/Waltbron/Onda-/blob/chore/instalar-motor-v3-1/docs/ONDA_MANIFIESTO_DE_PRODUCTO_Y_AUTONOMIA.md) y, para historia, la [bitácora Claude ↔ ChatGPT v1.2](https://drive.google.com/file/d/1gosSKlsX2EBGbNai8VvV680T6BPKk4we/view). No pedir que el fundador vuelva a explicar la visión.
2. Consultar la realidad actual: ramas/PR/últimos commits GitHub, `site/data/events.json`, `data/sources.json`, `data/automatic.json`, `data/radar`, última Action, Netlify Lab y estado de la automatización.
3. Explicar sólo las discrepancias que cambian prioridades. No confundir un artefacto existente con una capacidad autónoma.

### Durante y después de cambios
- **Antes:** expresar objetivo, componente afectado, riesgo, prueba y si requiere aprobación.
- **Después:** anotar en este archivo **fecha, actor (fundador/ChatGPT/Claude), decisión u operación, evidencia con URL/commit, resultado, límite y siguiente paso**.
- Preservar historial: añadir entradas nuevas al final, sin borrar decisiones anteriores. Se puede actualizar el «snapshot» inicial con fecha expresa y justificación.
- No almacenar claves, tokens, datos personales ni credenciales. No registrar opiniones como evidencia ni cerrar tareas sólo porque alguien lo propuso.
- Para cambios de código, trabajar en rama/PR cuando corresponda, con pruebas, y enlazar commit. **No usar la bitácora como sustituto de tests ni como mecanismo de publicación.**
- Para cambios de Radar, anotar explícitamente si la acción fue: búsqueda / fichero preparado / commit confirmado / publicación confirmada. Son cuatro estados diferentes.

### Cierre y traspaso rápido
Una sesión importante deja un registro breve y operativo con el siguiente formato:

```md
### AAAA-MM-DD · Actor · Tema
- DECISIÓN: [confirmada por fundador / propuesta / descartada]
- HECHO: [cambio comprobado, archivo/URL/commit]
- PRUEBA: [qué pasó y qué sigue sin demostrarse]
- PENDIENTE: [una acción concreta, prioridad, responsable]
- RIESGO: [dependencia o bloqueo]
```

## 6. Fuentes históricas y mapa de documentos

- [Bitácora de debate Claude ↔ ChatGPT v1.2 — Drive](https://drive.google.com/file/d/1gosSKlsX2EBGbNai8VvV680T6BPKk4we/view) — decisiones, discusiones y prototipos desde octubre; **historia**, no snapshot actual.
- [Bitácora de arquitectura ONDA v0.9 — Drive](https://drive.google.com/file/d/1ZU2ZMEPnIH3c4i3N6z-HU1f8BlF0QYvW/view) — principios de autonomía y calidad, elaborados como propuesta.
- [Manifiesto de producto y autonomía — GitHub Lab](https://github.com/Waltbron/Onda-/blob/chore/instalar-motor-v3-1/docs/ONDA_MANIFIESTO_DE_PRODUCTO_Y_AUTONOMIA.md) — visión y pendientes.
- [Manifiesto de ideas y hoja de ruta — GitHub Lab](https://github.com/Waltbron/Onda-/blob/chore/instalar-motor-v3-1/docs/ONDA_MANIFIESTO_IDEAS_Y_HOJA_DE_RUTA.md) — banco de ideas por origen/estado.
- [Circuito editorial y automatización — GitHub main](https://github.com/Waltbron/Onda-/blob/main/docs/ONDA_CIRCUITO_EDITORIAL_Y_AUTOMATIZACION.md) — responsabilidades y políticas editoriales.
- [Biblioteca visual — Google Drive](https://drive.google.com/drive/folders/1CD-3bDJRX4eujSznyH9cmx_IE2HLRjPK) — originales y aprobaciones.
- [PR #2 editorial — abierta el 08/11](https://github.com/Waltbron/Onda-/pull/2) — no confundir cambios propuestos con integrados.

## 7. Historial de decisiones y operaciones (append-only)

### 2026-11-08 · Fundador + ChatGPT · Continuidad entre chats y bitácora
- **DECISIÓN:** registrar de forma duradera decisiones, avances, pruebas y pendientes en Markdown. La bitácora debe ayudar a *trabajar*, no copiar todo el diálogo.
- **HECHO:** revisión del repositorio, Action, Netlify, tarea programada, manifiestos y bitácora de Drive; se consolida esta primera fotografía operativa en GitHub.
- **PRUEBA:** hay GitHub Actions con ejecuciones exitosas, 38 fichas en laboratorio y 11 candidatos en bandeja; sigue sin confirmarse un conector de captura real ni la transferencia desatendida del Radar.
- **PENDIENTE:** verificar el primer conector con evidencia y la primera escritura realmente autónoma desde la tarea programada; actualizar aquí el resultado de cada prueba.
- **RIESGO:** creer que «task activa», «Action verde» y «web publicada» implican actualización end-to-end. No es así.

### 2026-11-08 · ChatGPT · Primera etapa de autonomía ejecutable
- **DECISIÓN OPERATIVA PROPUESTA:** evitar un agente único con permisos irrestrictos; usar motor estructurado en GitHub Actions, Radar como investigador/auditor y barreras de validación previas a Netlify.
- **HECHO:** se abrió el issue P0 [#4 · Primer conector IDM](https://github.com/Waltbron/Onda-/issues/4) con tareas, límites, casos de prueba y criterio de aceptación completo.
- **EVIDENCIA EXTERNA:** agenda oficial [IDM /actividades](https://maldonado.gub.uy/actividades) contiene actividades próximas con fechas y lugares; falta validar formato HTML auténtico, automatización permitida y adaptador específico.
- **PRUEBA:** revisión de código confirmó que `idm-actividades` sigue `enabled:false`, `permission:pending`, `adapter:pending-parser`; no hubo ingesta real ni nueva publicación.
- **SIGUIENTE:** verificar acceso permitido + HTML/feed de la IDM, construir adaptador con fixture real y tests, probar un flujo end-to-end completo en ONDA Lab. Mantener Radar separado de publicación automática hasta confirmar escritura programada y procedencia.
- **RIESGO:** un cron verde no indica captura de datos; una fuente institucional visible tampoco equivale a acceso automático autorizado.

### 2026-11-08 · ChatGPT · Prueba del puente programado Radar → GitHub
- **HECHO:** se abrió [issue #5](https://github.com/Waltbron/Onda-/issues/5), con definición verificable de escritura desatendida, validación de Action y plan alternativo si la tarea ChatGPT carece de conector en su ejecución.
- **PENDIENTE:** ejecutar y observar una próxima corrida programada sin intervención del chat; registrar commit real o fallo. No se declara puente operativo hasta comprobarlo.
- **RIESGO:** la ejecución cron de GitHub Actions se ejecuta sobre rama por defecto (`main`), mientras el Radar usa `chore/instalar-motor-v3-1`; no confundir ambos caminos.

### 2026-11-08 · Fundador + ChatGPT · Radar ONDA de alcance integral, una vez al día
- **DECISIÓN DEL FUNDADOR:** reconvertir definitivamente la tarea preexistente de Early Birds en un Radar ONDA que revise diariamente todas las categorías de eventos relevantes del Este; incluir planes de interés personal sin limitar la agenda general a sus gustos o a música electrónica. No crear nuevas tareas programadas.
- **HECHO VERIFICADO:** la automatización existente, ID `6ab6fd68baac8191a0c3ebce74d05fc5`, se actualizó correctamente y se leyó de vuelta. Título: «Radar ONDA · GitHub diario»; habilitada; se conservó su recurrencia `RRULE:FREQ=DAILY` y zona `America/Montevideo`.
- **MISIÓN DIARIA:** descubrir música, fiestas, cultura, teatro, cine, arte, gastronomía, deporte, bienestar, ferias, cursos, paseos y experiencias singulares en Maldonado, Punta del Este, La Barra, Manantiales, José Ignacio, Punta Ballena, Piriápolis, San Carlos, Garzón y alrededores. Buscar hoy/próximos 30–90 días, con calidad y diversidad; cada domingo añadir auditoría retrospectiva dentro de la única corrida diaria.
- **PUENTE SOLICITADO:** intentar escribir candidatos respaldados en GitHub `Waltbron/Onda-`, rama `chore/instalar-motor-v3-1`, ruta `data/radar/inbox-AAAA-MM-DD.json`, versión 1.0, `review-only`, `published:false` y `publicationAllowed:false`. Leer archivo, preservar registros, deduplicar, escribir con SHA actualizado y comprobar commit por lectura de vuelta. No escribir en `manual.json`, `automatic.json` ni `site/data/events.json` desde el Radar.
- **ESTADO DEL PUENTE:** la actualización del prompt es **real y verificada**, pero **NO se ha demostrado escritura autónoma desde la tarea programada**. La última corrida registrada, anterior a esta actualización (08/11/2026), devolvió recomendaciones de fiestas; no hay evidencia atribuible a esa ejecución de que escribiera en GitHub. Seguir control de [issue #5](https://github.com/Waltbron/Onda-/issues/5).
- **SIGUIENTE:** comprobar una corrida futura con acceso GitHub real, commit, conteo de nuevos candidatos, validación Actions y ausencia de publicación de eventos no aprobados. Si la tarea no dispone de permisos efectivos, instrumentar un puente fiable separado en GitHub Actions.
- **RIESGO:** tarea diaria, conexión a GitHub, validación en Actions y despliegue Netlify son pasos distintos. No dar por hecha la actualización pública hasta comprobar el último extremo.
