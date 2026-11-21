# ONDA · Respaldo Biblioteca Visual v3 / 21-11-2026

Paquete para integración en **ONDA Lab**, no en la web principal.

- 9 PNG originales aprobados listos para uso editorial; 9 WebP derivados, sin alterar los originales.
- Escena 10: 1 PNG principal + 2 variantes de corrección en `04_revision/` por marca no verificada. **No enlazar aún**.
- Escena 08: no se inventó ilustración. Propuesta de taller aprobada, imagen pendiente.
- Biblioteca histórica: 28 WebP en GitHub (no duplicados ni removidos).
- No contiene fotos de referencia del usuario ni de personas reales; solo ilustraciones generadas.

## Índice
`03_documentacion/onda_visual_v3_manifest_2026-11-21.json`: inventario con IDs, hashes, referencias, estado de despliegue.
`03_documentacion/onda_visual_v3_catalogo.csv`: planilla simple de revisión.
`03_documentacion/ONDA_Manual_Visual_v0.1.md`: manual artístico para agentes.

## Publicación segura
La web obtiene los WebP desde **GitHub/Netlify**, NO lee automáticamente la carpeta de Drive. Para activar una imagen, crear recurso `site/assets/editorial/{id}.webp`, agregar registro, asociar de forma compatible a experiencias y verificar deploy. El original en Drive es el archivo canónico.
