# ONDA · Sistema gráfico y biblioteca de figuras

Estado auditado el 2026-11-08. Material de referencia existente:
- [Google Drive · ONDA Figuras editoriales](https://drive.google.com/drive/folders/1CD-3bDJRX4eujSznyH9cmx_IE2HLRjPK)
- Manifiesto `onda_assets_manifest.json` (v1.3.0, 2026-10-13).

## Estado real de la biblioteca

26 activos previstos: 13 `aprobado`, 11 `pendiente`, 2 `existente` cuyos archivos originales todavía no se localizaron. No equiparar `aprobado` con `verificado en Drive`: el manifiesto distingue el estado de subida. Arte y cultura 01–04 y Naturaleza 01 están aprobados; Música 01–04 y Gastronomía 03–06 tienen PNG+WebP; Gastronomía 01–02 requieren localizar los originales. Restan Naturaleza 02–04, Bienestar 01–04 y Vida nocturna 01–04.

## Dirección de arte ya acordada

Figuras editoriales independientes, una imagen por archivo (nunca una plancha de 4), encuadre 4:3, sin palabras, tarjetas, logos ni botones embebidos. Siluetas, contraste oscuro, fondo marfil con acentos contenidos; los textos, fechas y categorías son superposiciones HTML/CSS, nunca parte de las ilustraciones. Variación coherente por categoría, sin representar falsamente fotografías del evento. WebP optimizado para web, PNG como maestro.

## Relación imagen–evento

- La categoría normalizada elige un conjunto de imágenes **aprobadas y verificadas**.
- La variante se determina por hash estable del ID del evento, no por índice en la página. Evita que cada refresh cambie las ilustraciones.
- Cuando no hay variante aprobada se utiliza una gráfica CSS neutra; nunca reutilizar imágenes erróneas como si correspondieran a un evento.
- Fotos promocionales oficiales del evento requieren licencia/autorización expresa y atribución adecuada; no hotlinkear automáticamente terceros.
- Drive es **biblioteca maestra privada**, no CDN. Para servir recursos, copiar una selección aprobada y optimizada a `site/assets/onda/` en GitHub; conservar IDs/sha256 del manifiesto.

## Puntos a revisar antes de desplegar imágenes

1. Hacer inventario físico de WebP aprobados que existan en Drive.
2. Verificar hashes/medidas y elegir variantes por categoría.
3. Montar piloto en rama separada; comparar contraste, mobile y rendimiento.
4. Publicar solo tras visto bueno visual, preservando estética ya acordada.
