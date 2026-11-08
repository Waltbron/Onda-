# ONDA · Ciclo de mejora continua austero

**Estado:** propuesta técnica instrumentada en rama de trabajo; no implica conectores reales activos ni publicación desatendida.

## Objetivo
Mejorar confiabilidad, utilidad y cobertura antes de buscar tráfico masivo. Aprovechar el CI existente: sin nuevas tareas de ChatGPT, sin IA para controles aritméticos y sin nuevos servicios pagos.

## Ciclo
1. **Diario, Radar ONDA (una tarea existente):** investiga todas las categorías y deposita pistas sólo si el entorno programado demuestra permiso GitHub de escritura. Candidatos = revisión; nunca publicación.
2. **Con cada ejecución CI existente (GitHub Actions):** `npm run audit:quality` lee los archivos locales y calcula vigencia, próximos 7/30 días, fichas desactualizadas, duplicados posibles, diversidad territorial/temática, conectores y cola del Radar. No consulta webs, no llama modelos y no modifica fichas.
3. **Semanal, dentro del Radar del domingo:** evaluar los informes CI de la semana y auditorías de omisiones. Seleccionar una sola mejora P0/P1 con impacto observable, costo bajo y pruebas.
4. **Implementación:** código en rama → tests → PR → aprobación/merge → despliegue Lab → validar resultado → entrada en bitácora. Evitar cambios simultáneos de estética, curaduría y backend.
5. **Mensual:** revisar categorías/zonas con baja presencia, velocidad de actualización, salud de las fuentes y presupuesto real. No declarar «cobertura del mercado» a partir del catálogo propio.

## Interpretación de los indicadores
- `publishedTotal`: cantidad total en JSON, **incluye históricas**.
- `activeNow`: fichas vigentes según la misma lógica temporal que usa la web, con zona `America/Montevideo`.
- `availableNext7Days` y `availableNext30Days`: registros vigentes que se solapan con los períodos. No representan todos los eventos existentes afuera de ONDA.
- `activeCategories` y `activeCities`: distribución de la agenda vigente, no una meta de cupos.
- `activeConnectors`: fuentes permitidas/habilitadas, no cantidad de prospectos en inventario.
- `radarPending`: candidatos pendientes (si existe informe), separados de publicaciones.
- `invalid`: errores básicos de integridad; `possibleDuplicates`: coincidencias a confirmar; `staleChecks`: fichas vigentes sin verificación en los últimos 14 días.

## Prioridad de trabajo
1. P0: primer conector real, permisos y parser validados; demostrar cadena fuente→GitHub→Netlify Lab (issue #4).
2. P0: demostrar que una corrida **desatendida** de Radar tiene GitHub escritura real; si no, puente alternativo (issue #5).
3. P1: mantener agenda de próximos 7/30 días viva; sanear datos y duplicados; distinguir exposiciones actuales de eventos pasados.
4. P1: mejorar experiencia móvil, búsqueda y recomendaciones sobre eventos ya verificados.
5. P2: medición de uso respetuosa y de bajo costo cuando el producto tenga contenido útil (sin instrumentar antes métricas vacías).

## Presupuesto computacional
- Scripts locales Node 22 y JSON estático: **sin uso de tokens ni llamadas pagas de IA**.
- Se reutiliza el workflow existente y el reporte se guarda como artefacto de Actions de 14 días; no se escriben commits automáticos con métricas volátiles ni se ejecuta un tercer cron.
- La auditoría semanal puede aprovechar el Radar existente; no instalar otro agente perpetuo.
- No activar capturas de terceros ni publicaciones sin acceso autorizado y prueba end-to-end.

## Aceptación técnica
`npm test` pasa; `npm run audit:quality` genera `data/reports/quality-audit.json` y un resumen visible en CI; los indicadores coinciden con la misma función de vigencia que la web; la ruta de archivos publicados no cambia. Ningún contador se presenta como cobertura total.
