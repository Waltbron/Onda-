# ONDA — Manifiesto de producto, autonomía y banco de ideas

Fecha de ordenamiento: 2026-11-08. Proyecto: Hormiga 🐜 / ONDA.
Este archivo es la referencia de intención y pendientes; no constituye confirmación de funciones desarrolladas.

## 1. Norte: valor real para quien busca qué hacer
ONDA quiere ser la agenda y curaduría de referencia del Este uruguayo, para descubrir qué hacer, cuándo, dónde, cuánto cuesta y por qué podría valer la pena. La promesa no es listar mucho sin control ni inventar opciones para llenar espacio: es reducir la fricción de elegir sin sacrificar cobertura.

Zonas iniciales: Maldonado, Punta del Este, San Carlos, La Barra, Manantiales, José Ignacio, Punta Ballena, Piriápolis y alrededores; ampliación por evidencia de demanda y fuentes disponibles.

## 2. Ideas propuestas por el fundador (registradas, no necesariamente implementadas)
- **Agenda extensa, integral y filtrable**: recoger propuestas de productoras, ticketeras, MACA, municipios, IDM, cuentas sociales, organizadores, agendas similares y medios locales. Mostrar también programación a 1–3 meses: cuando no haya planes para hoy, no aparentar que toda la región está vacía.
- **Curaduría diferenciada**: «Dame una idea» / «Ahora pinta» recomienda pocas experiencias con una razón concreta. La agenda general no se reduce a los gustos del fundador.
- **Contenido de descubrimiento sin fecha fija**: spots para caminar, tomar mate, cafés, parques, playas, miradores, lugares poco conocidos, pequeños emprendimientos locales. Posible sección «ONDA Spot» / «Descubrí mientras tanto». Mantener inventario grande para evitar las mismas recomendaciones de siempre.
- **Contexto meteorológico**: cruzar actividades con clima real, especialmente planes al aire libre; explorar experiencia adaptativa por momento y ganas. No atribuir sentimientos al tiempo ni vender como predicción cierta.
- **Agentes de IA y autonomía supervisada**: radar que descubre, agente que coteja, curador que decide elegibilidad, auditor que explica omisiones, GitHub y Netlify que publican versiones probadas. Fundador aprueba cambios estratégicos, gastos y lanzamientos.
- **Aprendizaje por omisiones**: buscar eventos importantes NO registrados y explicar si falló la fuente, extracción, deduplicación, validación, filtrado, frescura o distribución geográfica.
- **Difusión y sustentabilidad**: eventualmente Instagram, marketing generado por agentes y experimentación con presupuesto potencial ~USD 100, siempre previa autorización para gastar o publicar contenido.
- **Biblioteca editorial**: ilustraciones por categoría, variantes estables y consistentes, archivos originales en Drive, recursos web ligeros. Que la web tenga identidad y no parezca galería genérica de IA.

## 3. Propuestas y encuadres del asistente (sujetas a validación del fundador)
- Dos productos conectados: **AGENDA** casi exhaustiva pero verificada, y **SELECCIÓN** corta con argumento editorial. Tercera capa permanente opcional: **SPOTS/EXPERIENCIAS** sin fecha de realización, con su propia frescura y cobertura.
- Evitar «agentes que deciden todo» como arquitectura inicial. Usar reglas determinísticas para fechas, URLs, rangos, duplicados, permisos y salud. Reservar IA para investigación, normalización editorial, comparación semántica y análisis de casos ambiguos.
- Priorizar la publicación de datos factual y de fuente primaria; personalizar las recomendaciones, no el universo del catálogo. Registrar quién/qué verificó cada dato y cuándo.
- Separar **encontrado**, **verificado**, **aprobado**, **publicado** y **vencido**; una promoción necesita reglas y evidencia, no solo una puntuación de confianza generada por IA.
- Auditar retrospectivamente una muestra independiente de eventos fuera de ONDA. Métricas: número de eventos futuros válidos, días con cero eventos, fuentes activas y con error, omisiones verificadas, duplicados, latencia de publicación, territorios subrepresentados. No afirmar recall total sin universo de referencia.
- Probar utilidad con usuarios antes de pagar marketing masivo o integrar una API de LLM de coste variable. La API es una opción futura, no requisito para leer y validar feeds públicos.

## 4. Estado comprobado el 08/11/2026
- Repositorio: https://github.com/Waltbron/Onda-
- Laboratorio: https://onda-lab-hormiga.netlify.app
- GitHub Actions configurado dos veces por día, con validaciones y sin fuentes automáticas aprobadas.
- El Radar ChatGPT diario ha sido reconvertido en «Radar ONDA · GitHub diario», pero **la capacidad de escritura autónoma de sus ejecuciones futuras aún no está demostrada**. En la sesión del 08/11 se actualizó desde chat la bandeja de GitHub y se observó una ejecución de validación exitosa.
- Catálogo inicial histórico 29 eventos, luego 4 oficiales IDM, luego 5 MACA (38 fichas). Esto no implica que los 38 estén vigentes. El frontend filtra fechas vencidas.
- Cinco eventos del MACA agregados para noviembre con evidencia institucional. **No hay fuentes de ingesta en vivo activas** al cierre de esta edición.
- La carpeta de imágenes en Drive sigue como fuente maestra; la rama de laboratorio contiene 13 recursos WebP aprobados.

## 5. Circuito de decisión propuesto
1. **Recolector**: revisa fuentes autorizadas con frecuencia controlada.
2. **Bandeja**: guarda candidatos con enlace y fecha de observación; no publica.
3. **Validador**: detecta fecha inválida, lugar dudoso, alcance geográfico, duplicados, cambios inesperados y accesos no permitidos.
4. **Curador**: decide si es evento real, experiencia permanente, noticia o promoción; etiqueta contexto e interés. La promoción automática sólo para fuentes y clases verificadas.
5. **Publicador**: escribe JSON validado en GitHub, pruebas de CI, despliegue de Netlify Lab; luego producción sólo con permiso.
6. **Auditor**: compara con agendas externas, registra falsos negativos, hipótesis y pruebas correctivas.
7. **Medición y experimentos**: evalúa uso de filtros, clics útiles y satisfacción, sin recolectar datos personales innecesarios.

## 6. Próximas prioridades (impacto primero)
A. **Demostrar captura real de una fuente**: IDM /actividades o agenda pública MACA con HTML auténtico, permisos y parser probado. No usar reservas como fuente sin autorización.
B. **Demostrar escritura futura de la tarea diaria** a la bandeja de GitHub, sin depender de la conversación. Mantener fallback si el entorno de automations no trae conectores.
C. **Publicación automatizada bajo reglas verificables** desde catálogo de candidatos a ONDA Lab, con casos dudosos retenidos y registro de auditoría.
D. **Inventario de ONDA Spots**: 20–40 opciones variadas y reales en distintas localidades; luego rotación por ubicación, hora, clima y contexto. Separadas de los eventos.
E. **Página de inicio resistente a baja densidad**: hoy/fin de semana si hay, próximas semanas y destacados a 90 días; si faltan eventos, ofrecer Spots con contexto, sin fingir agenda activa.
F. **Primer test de valor** con usuarios; luego considerar promoción y modelo comercial. No iniciar anuncios ni gastos sin autorización específica.

## 7. Reglas de autonomía
Permitido sin consulta adicional: investigación pública, pruebas locales, documentación, rama de laboratorio, bandeja de candidatos, correcciones reversibles, reportes y actualización de ONDA Lab cuando exista fuente comprobada y el flujo pase validación.
Requiere aprobación: gastos, anuncios, Instagram público, credenciales externas, publicación en dominio principal, cambio de estrategia comercial o uso de fuentes cuyo permiso sea dudoso.
Ante fallo de una fuente: preservar el último catálogo bueno y señalar antigüedad. Ante baja cobertura: no inventar ni degradar el estándar editorial.

## 8. Registro de ideas nuevas
Agregar a este documento con etiqueta **[Fundador]** o **[Asistente]**, fecha, estado (idea / piloto / validada / descartada), costo, dependencias y experimento más barato. No borrar ideas descartadas; dejar motivo para evitar rediscutirlas sin nueva evidencia.
