# ONDA · Bandeja del Radar secundario (propuesta, NO activada)

El Radar ONDA es una tarea de descubrimiento: NO crea eventos públicos ni actualiza Netlify por sí sola.

## Destino editorial
Google Drive: https://drive.google.com/drive/folders/19m8P_RhdzOR1F-92dmkYHqKfIc3ck8Q_ («ONDA · Hallazgos por validar»).

GitHub: `data/radar/` recibe lotes JSON **solo si la tarea dispone realmente de una conexión de escritura comprobada**. La tarea programada existente todavía no fue modificada; hace falta aprobación del fundador.

## Contrato JSON v1
Un lote por día, máximo 100 pistas:
```json
{
  "schemaVersion": 1,
  "origin": "chatgpt-radar-onda",
  "events": [
    {
      "title": "Evento de ejemplo (NO real)",
      "date": "2027-01-12",
      "time": "20:30",
      "place": "Sala de ejemplo",
      "city": "Punta del Este",
      "category": "Música",
      "sourceUrl": "https://example.org/eventos/123",
      "officialUrl": "https://example.org/organizador/123",
      "discoveredAt": "2026-11-08T12:00:00Z",
      "price": "A confirmar",
      "evidence": [
        {"field":"fecha", "url":"https://example.org/organizador/123", "excerpt":"12/01, 20:30"}
      ]
    }
  ]
}
```

`sourceUrl`: página donde el radar detectó la pista; `officialUrl`: fuente primaria confirmada (puede ser null). `evidence` conserva en qué lugar se verificó cada dato. Fechas ISO 8601 y zona horaria de Uruguay para interpretar la actividad; no confundir fecha de publicación de noticia con fecha del evento. La imagen del evento NO se copia automáticamente de la fuente.

Estados posibles tras validación local: `candidato_documentado`, `por_verificar`, `caducado`. **Todos** quedan con `reviewRequired:true` y `publishable:false`.

No inferir cancelación por desaparición de un listado. Para publicar en `site/data/events.json`, corroborar fuente oficial, actualidad, identidad, localidad, horarios y condiciones de reutilización; luego aprobar el conector/política de publicación. El programa de radar NO crea este paso automáticamente.

## Fuentes y amplitud
Priorizar agendas oficiales y organizadores; luego ticketeras/autorizadas; agendas competidoras como detección, con verificación posterior en fuente primaria; redes sociales accesibles legítimamente solo para pistas. Cobertura completa por localidades, no solamente conciertos y fiestas. Separar eventos fechados de experiencias permanentes/recurrentes, que requieren otro modelo temporal.

## Ensayo
`node --test engine/tests/radar.test.mjs` comprueba validación y bloqueo de publicación sin llamadas de red.
