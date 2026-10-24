# Fondos de Bienvenida

A diferencia de `tourist-sites/` (fotos de stock de Wikimedia Commons con atribución
obligatoria), estos 3 archivos fueron entregados directamente por el cliente vía WhatsApp
el 1 oct 2026 ("WhatsApp Image 2026-10-01 at 10.31.37 AM[.jpeg / (1).jpeg / (2).jpeg]"),
sin metadato de fuente/licencia adjunto. Se renombraron por contenido y se usan tal cual,
sin recortar su propio encuadre ni generar alternativas:

| Archivo | Original | Contenido |
|---|---|---|
| `background-river.jpg` | `WhatsApp Image 2026-10-01 at 10.31.37 AM.jpeg` | Río de aguas turquesas entre vegetación tropical |
| `background-beach.jpg` | `WhatsApp Image 2026-10-01 at 10.31.37 AM (1).jpeg` | Playa de arena blanca con palmera y mar turquesa |
| `background-city.jpg` | `WhatsApp Image 2026-10-01 at 10.31.37 AM (2).jpeg` | Skyline de Ciudad de Panamá con reflejo en el agua |

**Resolución de origen: 440×956 px** (recibidas ya comprimidas por WhatsApp). Ya son
verticales y de proporción muy cercana a una pantalla de teléfono (440/956 ≈ 0.460, vs.
393/852 ≈ 0.461 de un iPhone de referencia), así que `contentFit="cover"` recorta muy poco
de cada una. En una pantalla de alta densidad (3x, ~1170–1290 px de ancho físico) se
escalan por encima de su resolución nativa y pueden verse ligeramente suaves/con menos
nitidez que una foto de mayor resolución — limitación de origen del archivo recibido, no
de cómo se renderiza aquí. Si el cliente puede reenviar los originales sin la compresión
de WhatsApp, reemplazar estos 3 archivos sin cambiar sus nombres bastaría.

Verificar antes de publicar a producción que el cliente tiene los derechos de uso de estas
3 fotografías (no se pudo confirmar su origen desde aquí).
