# ONDA · Guía de operación (runbook)

Para quien mantenga ONDA, incluido Javier un domingo a la noche. Cada caso: síntoma → qué hacer → cuánto lleva.
Regla general: **nada se publica por fuera de un PR**. Los eventos manuales (`data/manual.json`) nunca los toca el motor.

## 0. Chequeo de 10 minutos (una vez por semana)
1. Abrir https://enonda.app y mirar que cargue y que la fecha de "actualizado" sea de las últimas 24 h.
2. GitHub → Actions → última corrida de `onda-lab-catalogo`: debe estar en verde.
3. GitHub → Pull requests: revisar el PR de revisión pendiente (si hay) y mergear o cerrar.
4. Notion → informe semanal de auditoría: leer solo las alertas rojas.
5. `npm run check` en local si se cambió algo: debe decir "VALIDACIÓN OK".

## 1. Una fuente falla (corrida en rojo o fuente "muda")
- Mirar el log de la corrida: ¿robots.txt, cambió el HTML, caída del sitio?
- Si es caída temporal: no hacer nada; el motor no borra eventos por "no verlos".
- Si cambió el HTML: capturar muestra con el workflow `onda-capturar-muestra`, ajustar el adaptador y sumar un test con la muestra.
- Si el sitio prohíbe la lectura (robots/términos): poner `enabled: false` en `data/sources.json` y anotar el motivo en Notion (Registro de fuentes).

## 2. Un evento se canceló o cambió
- Evento manual: editar `data/manual.json` (fecha, hora, lugar o `status`) y regenerar `site/data/events.json`.
- Evento automático: el cambio llega en el próximo PR de revisión; si urge, publicar la corrección como manual.
- Nunca borrar un evento por silencio de la fuente: marcar `status` según corresponda.

## 3. Un dato está mal (reporte de un usuario)
- Verificar en la fuente oficial. Corregir en `manual.json`. Responder al usuario con el link a la fuente.

## 4. Se cae el sitio
- Netlify → Deploys: ¿falló el último? Si sí, "Rollback" al deploy anterior (1 clic).
- Revisar `npm test` y `npm run check` en la rama que se desplegó.

## 5. Pasar una fuente de revisión a automático (o al revés)
- En `data/sources.json`, campo `publicationPolicy`: `automatic` o `review`.
- Pasar a automático solo si en 4 semanas no hubo correcciones. Dejar nota en Notion.

## 6. Agregar una fuente nueva
1. Leer términos y `robots.txt` de la fuente. Si no hay permiso claro, pedir autorización escrita.
2. Agregar fila en `data/sources.json` con `permission` y `permissionEvidence`.
3. Empezar siempre en `publicationPolicy: review`.
4. Registrar la fuente en Notion (Registro de fuentes).

## 7. Imágenes
- Prioridad: foto de la fuente con crédito → ilustración ONDA → identidad ONDA.
- **No** usar imágenes de ticketeras sin autorización escrita.
- Si una imagen falla, el sitio cae solo a la ilustración.

## 8. Agregar un idioma
- Copiar `i18n/es.json` a `i18n/<idioma>.json`, traducir, y sumar la ruta `/<idioma>/`. Nombres de eventos y lugares no se traducen.

## 9. Qué NO hacer
- No pegar credenciales ni llaves en el repo ni en el sitio.
- No saltarse el PR de revisión.
- No activar fuentes sin permiso documentado.
- No usar canales ni recursos de El Dorado para ONDA sin autorización de la empresa.

## 10. Contactos y accesos (completar)
- Dominio (enonda.app): ______
- Netlify (sitio `onda-lab-hormiga`): ______
- GitHub (`Waltbron/Onda-`): ______
- Instagram `@enonda.app` / Metricool: ______
