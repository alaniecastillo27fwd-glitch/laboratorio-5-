# Carpeta de Evidencias y Capturas de Pantalla (docs/)

Coloca aquí las 3 capturas de pantalla obligatorias con estrella (★) obtenidas desde Swagger UI (`http://localhost:3000/api-docs`):

1. `01-swagger-pregunta-ia.png`: Captura de `POST /api/ia/preguntar` respondiendo `200 OK` con el JSON `{ respuesta, uso }`.
2. `02-swagger-resumen-nota.png`: Captura de `POST /api/notas/1/resumen` respondiendo `200 OK` con `{ notaId: 1, resumen: "• ...\n• ...\n• ..." }`.
3. `03-swagger-error-502-seguridad.png`: Captura con pantalla dividida mostrando el error `502 Bad Gateway` en Swagger UI (`{"error": "IA_NO_DISPONIBLE"}`) y el log `401` en la consola del servidor tras simular una API Key inválida.
