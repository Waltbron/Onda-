# ONDA · Biblioteca Visual v3.1 — estado de integración

**Fecha:** 21/11/2026. **Entorno:** ONDA Lab (pruebas), no la web principal.

## Estado verificado

- **38 imágenes WebP en GitHub**: 28 previamente existentes + 10 nuevas aprobadas y optimizadas.
- **25 escenas en la galería «El Este vivido»**: 15 previas + 10 nuevas.
- **10 originales PNG** y **10 copias WebP** en Google Drive; se comprobaron conteos de archivos por carpeta.
- **Escena 10 «Una más y nos vamos»**: el usuario eligió expresamente la **segunda variante**, la del emblema circular entrelazado sin cartel textual. No se presenta ese símbolo como logotipo oficial verificado de El Popu. Las otras variantes se conservaron para referencia, sin publicar.
- **Escena 08 «Manos a la obra»**: únicamente composición aprobada; falta generar y aprobar la ilustración.
- Fotografías personales de referencia del usuario: **no incorporadas** a repositorio, biblioteca web ni paquete de originales generados.

## Ubicaciones y trazabilidad

- Biblioteca maestra Drive: https://drive.google.com/drive/folders/1h0w_U_mD126ac4t7n37eiUIz4fLiHBql
- Manifiesto actual 3.1: https://drive.google.com/file/d/1ZZK19oI4nolN6tR7gg0Uio5V7WXsUdyq/view
- Manual editorial v0.1: https://docs.google.com/document/d/1P9VsxK_0C1fZ1500JuinYZs7FFCl8HuC/edit
- Registro de decisiones en Notion: https://app.notion.com/p/4132d8c76d53814a9108e81e3f17f91d
- Repositorio: Waltbron/Onda-, rama `chore/instalar-motor-v3-1`
- Commit de integración 3.1: `fee554af65272ea7a27f3ce9d26310d9a5fe7c4c`
- ONDA Lab: https://onda-lab-hormiga.netlify.app/

## Pruebas ejecutadas

1. Se verificó que cada una de las 10 parejas PNG/WebP está archivada en Drive; el manifiesto 3.1 también está archivado.
2. GitHub confirmó los 38 recursos WebP, el catálogo JSON 3.1, los cambios de aplicación, la página y las reglas editoriales.
3. La sintaxis de `site/app.js` fue compilada sin errores en una prueba sintáctica.
4. Prueba funcional de selección: El Popu → su propia imagen; teatro en Teatro MACA → ilustración del teatro; Jornadas Carolinas → plaza San Carlos; DJ en Casapueblo → sunset; gastronomía genérica de La Barra → imagen genérica, no El Popu.
5. Netlify informó despliegue `ready` del commit indicado, sin error. No se pudo obtener de forma independiente la URL pública de la imagen mediante el verificador web, por lo que queda como comprobación manual sugerida abrir ONDA Lab en móvil y confirmar el render.

## Reglas operativas

- La web **no lee Drive en tiempo real**; los PNG son originales y los WebP publicados se sirven desde el sitio construido a partir de GitHub.
- No asignar imágenes específicas de lugares a otros locales o sedes.
- La imagen describe la **familia de experiencia**, no debe aparentar ser fotografía del evento concreto.
- No mover, borrar ni sustituir las imágenes históricas sin una nueva aprobación.
- Este README v3.1 reemplaza en cuanto al **estado actual** la nota v3, conservada como registro histórico.
