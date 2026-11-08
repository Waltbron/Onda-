# ONDA — Manifiesto de producto, ideas y hoja de ruta
Fecha: 2026-11-08 · Estado: documento vivo · Ámbito: ONDA Lab, separado de agendapde.netlify.app

## Visión que no se negocia
ONDA no es solamente otra agenda. Su aspiración es ser **la referencia de qué hacer en Punta del Este, Maldonado y el Este**, con dos funciones complementarias: (1) **agenda extensa** de eventos confirmados, localizables, actuales y futuros; (2) **curador** que ayuda a elegir con criterio. No filtrar la agenda pública según gustos privados del fundador. Agregar valor real (contexto, descubrimiento, accesibilidad, clima, identidad local) en vez de copiar una cartelera.

El sistema debe ser **mantenible y casi autónomo**: IA para investigar, detectar omisiones, contrastar, sugerir, clasificar y proponer mejoras; reglas deterministas para validar, deduplicar, versionar y publicar; intervención del fundador para decisiones mayores, gastos y cambios de rumbo.

## Banco de ideas con procedencia
Leyenda de origen: **Fundador** (idea planteada por el usuario); **Asistente** (propuesta del asistente); **Conjunto** (idea desarrollada en diálogo). Horizontes **AHORA**, **SIGUIENTE**, **FUTURO** son prioridades propuestas, NO compromisos completados.

| ID | Idea y valor al visitante | Origen | Horizonte | Estado / comprobación necesaria |
|---|---|---|---|---|
| O01 | Agenda muy amplia de **todo el Este**, con fechas de hoy hasta meses adelante y búsqueda por zona, categoría, costo y venue. | Fundador | AHORA | En beta: catálogo histórico prevalece; aumentar eventos futuros confirmados. |
| O02 | **Curador** «Dame una idea» / «Ahora pinta»: 2–3 sugerencias de calidad, siempre tomadas del inventario verificado. | Conjunto | AHORA | Existe versión basada en reglas; mejorar explicación y variedad. |
| O03 | **No aparentar una agenda vacía**: portada con próximos eventos del mes y del verano, sin restringir la vista general a «este finde»; filtros temporales explícitos. | Fundador | AHORA | Ajustar estado inicial y mensajes; no inventar eventos. |
| O04 | **ONDA Spots**: lugares interesantes y planes permanentes (costa, lagunas, paseos, cafés, parques, rincones). | Fundador | AHORA | Colección separada de eventos; fichas con porqué, ubicación, acceso y verificación, no fechas ficticias. |
| O05 | **Inventario amplio y rotativo de spots**: evitar recomendar siempre los mismos; diversidad por zona/actividad. | Fundador | SIGUIENTE | Curaduría editorial y control de repetición; separar experiencia de espectáculo. |
| O06 | **Emprendimientos y espacios locales** con identidad, gastronomía y propuestas singulares. | Fundador | SIGUIENTE | Política de transparencia: no simular publicidad como curaduría imparcial. |
| O07 | **Clima cruzado con eventos y spots**, alternativas bajo techo, viento y lluvia; explorar pregunta tipo «¿Qué pinta con este clima?». | Conjunto | SIGUIENTE | Requiere datos meteorológicos fiables y geolocalización opcional; mostrar hora de pronóstico y su incertidumbre. |
| O08 | **Perilla estética de radio / frecuencia / AM–PM** como forma lúdica de explorar planes, sin confundir día/noche con frecuencia radial. | Fundador | FUTURO, experimento UX | Probar con usuarios: AM/PM es ambiguo; variante posible «De día / De noche» con microinteracción de sintonía. No implantar sin contraste de usabilidad. |
| O09 | **Biblioteca gráfica propia editorial costera**, marfil, azul tinta y coral; ilustraciones por categorías, fotografías reales solo con permiso. | Conjunto | AHORA | Drive maestro: https://drive.google.com/drive/folders/1CD-3bDJRX4eujSznyH9cmx_IE2HLRjPK ; manifiesto V1.3, 13 activos aprobados/localizados y pendientes; en GitHub se integraron 13 WebP. |
| O10 | **Radar secundario ChatGPT** que busque en ticketera, instituciones, organizadores, redes públicas, competidores, zonas y categorías; comparar con ONDA. | Fundador | AHORA | Tarea «Radar ONDA · Descubrimiento diario» activa. Escritura autónoma a GitHub desde la tarea NO verificada. |
| O11 | **Puente Radar → GitHub → Netlify** con bandeja de candidatos, validación, deduplicación y publicación gobernada. | Asistente | AHORA | Existe data/radar e informe review-only; falta demostrar escritura persistente desde task y promoción segura. |
| O12 | **Auditoría de omisiones**: buscar eventos ocurridos que ONDA ignoró; causa raíz por fuente, parser, tiempos, filtro o duplicado; mejora medible. | Conjunto | AHORA | Primera muestra dirigida: 4 omisiones de agenda oficial IDM. Auditoría en GitHub; pendiente medir cobertura representativa. |
| O13 | **Motor principal estructurado con fuentes primarias** (IDM agenda, MACA, ticketeras, municipios y organizadores), preferir feeds y API autorizadas. | Conjunto | AHORA | 0 conectores reales activos; no confundir inventario de 75 fuentes con 75 integraciones operativas. |
| O14 | **Marketing autopropulsado**: Instagram, calendario editorial, agentes de contenido/distribución, experimentación con presupuesto tentativo USD 100. | Fundador | FUTURO | Sin compra ni publicidad activa; acordar objetivos, permisos de cuenta, control de gastos, medición y aprobación previa del presupuesto. |
| O15 | **Aprendizaje y autonomía gradual** del sistema: medir precisión, omisiones y utilidad, proponer cambios pequeños revisables. | Fundador | SIGUIENTE | Sin aprendizaje mágico ni auto-cambios irrestrictos: trazas, versionado, rollback, PRs y métricas. |
| O16 | «**Sensación térmica**» como exploración de estado de ánimo/energía al elegir planes. | Conjunto | FUTURO | Evitar atribuciones sobre el usuario; control voluntario, privacidad y pruebas antes de inferir preferencias. |

## Arquitectura de dos motores y responsabilidades

**Motor A: GitHub Actions + adaptadores deterministas**. Consulta exclusivamente fuentes y métodos autorizados; normaliza, valida, deduplica, conserva evidencias, caduca y publica en `site/data/events.json` luego de reglas y pruebas. Netlify despliega la rama de laboratorio; nunca tocar el sitio antiguo sin autorización explícita.

**Motor B: Radar ONDA (Automations de ChatGPT)**. Recorre fuentes complementarias, detecta pistas y eventos que Motor A no captó, analiza cobertura y sugiere ajustes. Intenta entregar `data/radar/inbox-YYYY-MM-DD.json` al repositorio si el entorno de esa ejecución dispone de escritura. Se exige comprobar la persistencia mediante lectura del commit. **La tarea programada no es una API ni un webhook y no hay conexión automática demostrada todavía**.

**Contrato de seguridad:** `descubierto → por-verificar → verificado → publicable → publicado`. Un hallazgo no es ficha publicada. Fuentes secundarias son pistas; buscar confirmación primaria. Los duplicados dudosos se retienen para revisión, los eventos vencidos no se ofrecen como próximos, las fechas incompletas no se inventan. Respetar acceso, permisos, condiciones y derechos sobre imágenes. La automatización de GitHub puede seguir ensayando sin autorizar extracción de terceros.

## Entregable funcional inmediato: condiciones de aceptación
- Portada que dé opciones útiles sin «inflar» fichas: próximos eventos futuros por defecto y spots atemporales separados.
- Cada evento con nombre, fecha/rango, localidad, lugar, enlace fuente y estado de comprobación.
- Spots etiquetados como experiencias permanentes, no como eventos de hoy.
- Bandeja de nuevos hallazgos con fuente, fecha observada, destino, duplicado probable y razón de retención.
- Demostración de extremo a extremo: una tarea escribe una pista al GitHub correcto, Action detecta el JSON, la prueba valida y un registro aprobado alcanza `events.json` de la rama del lab; se revisa Netlify y no se da por hecho antes de verlo.
- Panel semanal: publicados vigentes, hallados, pendientes, fuentes realmente activas, omisiones por causa, errores y enlaces a evidencia.
- Marketing y gasto quedan fuera del arranque automático.

## Enlaces de operación
- Laboratorio: https://onda-lab-hormiga.netlify.app
- Repositorio: https://github.com/Waltbron/Onda-
- Bandeja de radar: https://github.com/Waltbron/Onda-/tree/chore/instalar-motor-v3-1/data/radar
- Carpeta Drive de revisión: https://drive.google.com/drive/folders/19m8P_RhdzOR1F-92dmkYHqKfIc3ck8Q_
- Biblioteca visual: https://drive.google.com/drive/folders/1CD-3bDJRX4eujSznyH9cmx_IE2HLRjPK

**Regla de mantenimiento:** cada propuesta nueva se agrega con origen, horizonte, impacto, costo/riesgo, responsable y prueba de aceptación. Cambiar «pendiente» a «realizado» solo tras comprobar código y despliegue; conservar ideas futuras sin confundirse con funcionalidades listas.
