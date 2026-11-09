# ONDA · Piloto MACA y estrategia de escalado seguro

**Decisión del fundador (2026-11-08):** acelerar sin convertir los ensayos en una secuencia de 75×3 días. **MACA es el único piloto de captura inicialmente activo en la planificación**. Las siguientes fuentes se pueden desarrollar y probar con datos de ejemplo en paralelo; **integración al catálogo una fuente por vez**.

## Fases independientes, no lineales

1. **Preparar en paralelo (sin red):** para IDM, Passline, RedTickets y TicketFácil/AccesoFácil se pueden crear parsers, fixtures y pruebas sin activar consultas ni publicar. El único piloto autorizado para avanzar de etapa de forma inmediata es MACA.
2. **MACA, laboratorio:** 09/11, comprobar robots/términos/estructura y ejecutar fixture; 11/11, comparar a 48 h *solo si el acceso real fue permitido y la primera lectura existió*; 13/11, auditar diferencias, duplicados y valor. Son hitos de planificación, NO tareas agendadas ni ejecuciones confirmadas.
3. **Promoción individual:** solo se cambia el flag/configuración de una fuente si existen evidencia del acceso permitido, parser estable con pruebas verdes, deduplicación validada y datos de evento fiables. El resto permanece congelado.
4. **Sincronización gradual:** cada nuevo adaptador pasa validación aislada y regresión completa antes de entrar a ONDA Lab; posteriormente se verifica despliegue y un evento real de extremo a extremo.

## Protección contra fallos

- Cada fuente independiente, con identificador, estado, frecuencia y control de errores. Un error de MACA no interrumpe la evaluación de otros conectores ni modifica eventos manuales.
- Ensayo sin tocar `site/data/events.json`, `data/automatic.json` ni el sitio histórico. El *piloto-runner* solo produce resultados en memoria y requiere acceso aprobado para intentar red.
- En la publicación futura: comparar cambios con copia del último catálogo válido, rechazar errores de fecha/lugar/URL, duplicados o cambios masivos; revertir por commit si empeora el catálogo.
- Probar todas las ramas antes de integrar, con GitHub Actions exclusivo de pilotos en su rama de desarrollo; mantener los workflows principales y sus frecuencias intactos.
- Medir **nuevos eventos válidos, anticipación para el usuario, errores, duplicados, cobertura y costo de solicitudes**. El intervalo se ajusta con evidencia, no por un cron rígido.

## Orden después de MACA

| Orden | Fuente | Rol | Frecuencia propuesta |
| --- | --- | --- | --- |
| 2 | IDM /actividades | Institucional primaria, cobertura amplia | 48 h |
| 3 | Passline | Ticketera primaria | 24 h |
| 4 | RedTickets | Ticketera primaria | 24 h |
| 5 | TicketFácil / AccesoFácil | Ticketera primaria | 24 h |
| 6 | Entraste | Ticketera primaria | 24 h |
| 7 | Fundación Atchugarry, Enjoy y otros espacios | Cultura y entretenimiento | semanal / 48 h |
| Secundarias | Agenda del Este, Portada Punta | Señales de omisiones; siempre contrastar en origen | 48 h, si permitido |

**No confundir desarrollo concurrente con ejecución de capturas concurrentes sin límites.** Cuando se prueben fuentes reales, usar un planificador con límites por dominio, pausas ante restricciones y un solo flujo de validación/publicación.

**Estado al escribir:** pruebas de aislamiento agregadas a rama `feature/onda-pilotos-aislados-20261108`, conectores reales desactivados, **sin validación CI de esta rama todavía al momento de documentar**. El calendario de Google Sheets es planificación y no inicia una ejecución por sí solo.
