# ONDA V3 · Motor de eventos automatizable

Versión preparada el 15/10/2026. **No hay conectores reales activos todavía.**

Esta carpeta reúne el sitio ONDA, su catálogo histórico revisado de 29 eventos (no implica que sigan vigentes en noviembre de 2026), el motor de ingesta, los controles de seguridad y las tareas automáticas de GitHub. **No afirma que el HTML público del MACA tenga Event JSON-LD**; el adaptador deberá comprobarse contra su HTML auténtico antes de habilitarlo.

## Para empezar rápido

- Abrí `docs/INSTALACION_PASO_A_PASO.md`.
- Para ver la web sin motor, arrastrá sólo la carpeta `site/` a Netlify Drop.
- Para instalar el motor y las 2 corridas diarias, subí el **contenido completo de esta carpeta** a la raíz de un repositorio GitHub privado y conectalo a **un sitio de prueba** Netlify. No subas el ZIP sin extraer a GitHub.
- Probá en cualquier equipo con Node 22: `npm test && npm run check && npm run preview`.
- El sistema está apagado por defecto y no consulta MACA sin revisión de permisos.

## Arquitectura

`fuente autorizada → lectura robots/HTML → adaptador → validación → deduplicación → estado y evidencia → catálogo JSON → commit GitHub → deploy Netlify → ONDA`.

- `site/`: HTML, CSS, JS, archivo `data/events.json` que la web lee y actualiza periódicamente, y `data/meta.json`.
- `data/manual.json`: las 29 fichas revisadas preexistentes (no se sobreescriben por captura).
- `data/automatic.json`: fichas incorporadas/actualizadas por fuentes **aprobadas**.
- `data/state.json`: última lectura válida por fuente y salud.
- `data/sources.json`: los adaptadores reales y su permiso, **todos desactivados** inicialmente.
- `data/source-inventory-75.json`: inventario de 75 fuentes o clases candidatas, no 75 conectores.
- `data/overrides.json`: ocultar/corregir casos excepcionales con motivo.
- `data/candidate-aliases.json`: *candidatos* de identidad que bloquean duplicados; NO son merges automáticos.
- `engine/src/`: parser JSON-LD para eventos, reglas de robots, reconcililiación y captura restringida.
- `engine/tests/`: pruebas sin acceso a web. Usa mocks de fetch para comprobar controles.
- `scripts/run.mjs`: `--mode=fixture` (ensayo) o `--mode=live --publish` (solo con permisos explícitos).
- `.github/workflows/onda-actualizar.yml`: 08:30 y 20:30 Uruguay, más botón manual; guardas de publicación.

La web filtra caducidad con `America/Montevideo`. Si una fuente falla, conserva fichas ya válidas. Una ausencia del listado no se trata automáticamente como cancelación. Una cancelación explícita en el JSON-LD sí afecta un evento previamente importado de esa fuente. Se preserva el historial en git.

## Estados y honestidad

- Motor implementado y probado: **sí**, 55/55 pruebas locales y en GitHub Actions (08/11/2026).
- Fuente MACA conectada y validada contra HTML real: **no**.
- Permisos de scraping/automatización aprobados: **no verificados**.
- GitHub Actions instalado en **rama de ensayo**: **sí**, con pruebas exitosas el 08/11/2026; pendiente de revisión y fusión a `main`.
- Netlify actualizado o enlazado a este repositorio: **no**.
- Eventos autónomos publicados: **0**.

No exponer secretos en el repositorio ni afirmar que una corrida de fixture equivale a conexión real.
