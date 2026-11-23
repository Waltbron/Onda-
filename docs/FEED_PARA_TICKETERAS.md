# Feed de eventos para ONDA · ficha técnica para ticketeras

ONDA (enonda.app) es una agenda gratuita de eventos del Este de Uruguay. Cada evento se muestra con un botón que lleva a la página de compra de la ticketera, citada siempre como fuente. Sin costo ni comisión.

## Lo que pedimos (en orden de preferencia)

1. **Un JSON en una URL HTTPS** que la ticketera actualice (formato abajo).
2. **Un calendario iCal (.ics)** con los eventos de la zona.
3. **Una API de solo lectura** con clave propia (la guardamos como secreto, nunca en el repositorio).
4. **Un archivo (JSON/CSV)** enviado cada tanto, si no hay otra forma.

En todos los casos pedimos una **autorización escrita** (alcanza con un mail) para usar el listado en ONDA.

## Qué hace ONDA con eso

- Lee el listado cada 12 horas como máximo, con una sola solicitud.
- Muestra título, fecha, hora, lugar, precio (si lo informan) y el botón de compra.
- No copia imágenes ni textos largos.
- Si un evento figura como cancelado o postergado, se refleja.
- Baja cualquier evento a pedido.

## Formato JSON (versión 1)

```json
{
  "version": 1,
  "partner": "RedTickets",
  "events": [
    {
      "id": "evt-12345",
      "title": "Nombre del evento",
      "date": "2026-12-27",
      "endDate": "2026-12-27",
      "time": "21:00",
      "endTime": "23:30",
      "venue": "Open Park",
      "city": "Punta del Este",
      "category": "Música",
      "status": "confirmed",
      "eventUrl": "https://ticketera.uy/evento/12345",
      "ticketUrl": "https://ticketera.uy/comprar/12345",
      "price": { "amount": 1500, "currency": "UYU", "label": "desde" },
      "summary": "Una línea opcional (hasta 320 caracteres).",
      "tags": ["electrónica"]
    }
  ]
}
```

### Reglas

- `id`: estable y único por evento (letras, números, guion, 2 a 100 caracteres).
- `date` y `endDate`: `AAAA-MM-DD`. `time` y `endTime`: `HH:MM` hora de Uruguay, opcionales.
- `status`: `confirmed`, `cancelled` o `postponed` (obligatorio).
- `city`: Maldonado, Punta del Este, La Barra, Manantiales, Piriápolis, Punta Ballena, José Ignacio, San Carlos, Pan de Azúcar, Aiguá, Garzón, La Paloma o Rocha.
- `category`: Cultura, Música, Fiestas, Deporte, Gastronomía, Encuentros, Aire libre o Bienestar.
- `price`: opcional. `currency` UYU o USD; `amount` entero (0 = gratis); `label: "desde"` si es un mínimo.
- `eventUrl` y `ticketUrl`: HTTPS, dentro de los dominios que la ticketera nos indique.
- Hasta 500 eventos y 500 KB por archivo.
