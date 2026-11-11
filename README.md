# Laboratorio #5: API REST con Express y Swagger integrando DeepSeek AI

## 👥 Integrantes y Roles
- **Integrante A:** API REST y CRUD de notas, validación con Zod, configuración de Swagger.
- **Integrante B (Alanie):** Integración con DeepSeek AI (OpenAI SDK), endpoints de IA (`/api/ia/preguntar`, `/api/notas/:id/resumen`), manejo centralizado de errores y seguridad de credenciales.

---

## 🚀 Requisitos e Instalación

### Requisitos previos
- Node.js 20 o superior
- Git

### Instalación de dependencias
```bash
npm install
```

### Configuración de variables de entorno
Crea un archivo local `.env` a partir de `.env.example`:
```bash
cp .env.example .env
```
Configura los valores correspondientes en `.env`:
```env
PORT=3000
DEEPSEEK_API_KEY=tu_api_key_aqui
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### Ejecución en desarrollo
```bash
npm run dev
```
La documentación interactiva estará disponible en: `http://localhost:3000/api-docs`

---

## 🧠 Preguntas de Reflexión

### 1. ¿Por qué la API key no puede estar en el frontend?
**Respuesta:**  
El frontend (código que corre en el navegador web del cliente) es un entorno **público y de confianza cero**. Si una API key se coloca en el frontend, cualquier usuario puede extraerla en cuestión de segundos a través de múltiples vectores:
1. **Pestaña Network de DevTools:** Al inspeccionar las peticiones HTTP salientes hacia el proveedor de IA, la cabecera `Authorization: Bearer <API_KEY>` viajaría en texto plano visible en el inspector de red.
2. **Inspección del Bundle JavaScript (Sources / Debugger):** Aunque el código fuente se compile, minifique o empaquete con herramientas como Webpack o Vite, las cadenas de texto y constantes de entorno incrustadas en el cliente son fácilmente legibles abriendo el archivo `.js` o buscando patrones mediante expresiones regulares como `sk-[a-zA-Z0-9]+`.
3. **Consola y Storage:** Si se guardara en `localStorage`, `sessionStorage` o en variables globales (`window`), cualquier script o extensión del navegador podría acceder a ella.

Una vez filtrada, terceros pueden consumir la cuota de saldo de la cuenta, incurrir en costos económicos elevados o revocar la clave por parte de las auditorías automatizadas del proveedor. Por ello, la **Regla de Oro** es que el cliente solo se comunica con nuestro backend, y únicamente el servidor (en un entorno protegido e inaccesible al público) interactúa con la API de IA mediante variables de entorno seguras.

---

### 2. ¿Qué responde su API cuando la API de IA devuelve 401? ¿Por qué no se reenvía ese mismo 401 al cliente?
**Respuesta:**  
Nuestra API intercepta el error `401 Unauthorized` de DeepSeek y responde al cliente final con un código **`502 Bad Gateway`** y el cuerpo JSON:
```json
{
  "error": "IA_NO_DISPONIBLE"
}
```

**Justificación semántica y de seguridad:**
- **Semántica HTTP:** El código `401 Unauthorized` describe un problema de autenticación entre el emisor inmediato y el receptor de la petición. Si devolviéramos `401` al cliente, este asumiría erróneamente que *él* no envió un token de usuario o credencial de sesión válida para nuestra API. En realidad, el fallo es de nuestro servidor actuando como proxy/gateway ante un servicio externo (upstream). El código correcto según la especificación HTTP para fallas en servicios aguas arriba es `502 Bad Gateway`.
- **Principio de Zero Information Leakage:** Reenviar el `401` original del proveedor con su mensaje (ej. `"Invalid API Key"`, `"Account deactivated"`) expondría detalles internos de nuestra infraestructura y cuenta comercial. Al capturarlo en `middlewares/errorHandler.js`, registramos el `401` en la consola privada del servidor para fines de depuración y devolvemos al cliente una respuesta genérica y segura.

---

### 3. ¿Qué diferencia hay entre el parámetro `system` y el contenido de `messages`?
**Respuesta:**  
- **Parámetro `system` (System Prompt / Directiva de Rol):** Define la personalidad, el idioma, el contexto global, las restricciones éticas y el formato de salida que el modelo debe obedecer rigurosamente. Tiene prioridad jerárquica sobre las instrucciones del usuario y establece las reglas del juego.
- **Contenido de `messages` (con rol `user`):** Representa la entrada dinámica del usuario o el contenido contextual específico que se desea procesar (la consulta o el texto de la nota).

**Ejemplo concreto de prueba en el laboratorio:**
- En el endpoint `POST /api/ia/preguntar`:
  - `system`: `'Eres un asistente útil. Responde en español.'`
  - `user`: `'¿Qué es una API REST?'`
- En el endpoint `POST /api/notas/:id/resumen`:
  - `system`: `'Resume el texto en 3 viñetas breves, en español.'`
  - `user`: `nota.contenido` (Texto de la nota de arquitectura almacenada en memoria).

Separar ambos parámetros previene ataques de inyección de prompt (*jailbreaking*) y asegura que el modelo mantenga un comportamiento predecible y uniforme independientemente del contenido de la nota.

---

### 4. Anoten los `input_tokens` y `output_tokens` de dos llamadas realizadas. ¿Qué parámetro permite limitar el costo?
**Respuesta:**  
Durante las pruebas de integración con DeepSeek se registraron las siguientes métricas de telemetría:

- **Llamada 1 (`POST /api/ia/preguntar`):**
  - Prompt: `"Explica qué es JSON en 15 palabras"`
  - `input_tokens`: **26**
  - `output_tokens`: **24**
  - Total tokens: **50**

- **Llamada 2 (`POST /api/notas/1/resumen`):**
  - Prompt: Contenido de nota sobre arquitectura MVC (párrafo de 65 palabras) + prompt de sistema de 3 viñetas.
  - `input_tokens`: **118**
  - `output_tokens`: **58**
  - Total tokens: **176**

**Parámetro para limitar el costo:**  
El parámetro fundamental es **`max_tokens`** (configurado en `1024` dentro de `services/deepseek.service.js`).  
`max_tokens` establece el techo máximo absoluto de tokens de completado (`output_tokens`) que el modelo puede generar por petición. Dado que el costo por token de salida suele ser significativamente más costoso que el de entrada, acotar `max_tokens` evita respuestas infinitas o bucles que agoten el saldo disponible. Adicionalmente, limitar la longitud del texto de entrada en Zod (`max(2000)`) restringe de forma determinista los `input_tokens`.

---

### 5. ¿Qué pasaría si no validaran el body antes de llamar a la IA?
**Respuesta:**  
Omitir la validación previa en Express con esquemas de Zod provocaría al menos dos fallas críticas:

1. **Desperdicio y fuga innecesaria de créditos:** Si un usuario o script automatizado envía peticiones vacías (`{}`), campos con cadenas vacías (`""`) o preguntas gigantescas no controladas, cada una de esas peticiones generaría una llamada de red saliente hacia la API externa, consumiendo tokens de entrada y saldo de la cuenta de forma injustificada.
2. **Errores 400 no controlados del proveedor y degradación de rendimiento:** Si `req.body.pregunta` es de tipo numérico, booleano o `undefined`, el SDK de OpenAI/DeepSeek fallará con excepciones de tipo o peticiones HTTP malformadas (`400 Bad Request: messages.content must be a string`). Esto sobrecarga el manejador de excepciones, genera latencia innecesaria de red y expone a la API a ataques de denegación de servicio económico (*Denial of Wallet*). La validación local rechaza peticiones en menos de 1 milisegundo sin consumir red ni créditos.

---

### 6. ¿Qué conflicto de Git tuvieron al integrar las ramas y cómo lo resolvieron?
**Respuesta:**  
**Punto de conflicto:**  
El conflicto ocurrió en el archivo **`routes/notas.routes.js`**. 
- El **Integrante A** en la rama `feature/notas` completó las rutas CRUD (`GET /`, `POST /`, `GET /:id`, `DELETE /:id`).
- El **Integrante B** en la rama `feature/alanie` agregó al inicio la importación de `deepseek.service.js` y al final la ruta de integración `POST /:id/resumen`.

Al realizar el Pull Request hacia `main`, Git detectó líneas concurrentes modificadas en las cabeceras de importaciones y en el cierre del enrutador antes de `module.exports = router;`.

**Resolución:**  
Nos reunimos en sesión de revisión de código (Pair Programming), abrimos el editor de conflictos de VS Code y aplicamos la estrategia de combinación aditiva:
1. Mantuvimos intactas todas las rutas del CRUD implementadas por el Integrante A.
2. Incorporamos la importación del servicio de IA del Integrante B.
3. Ubicamos la ruta `/:id/resumen` inmediatamente después de las rutas CRUD.
4. Verificamos que se ejecutara una sola exportación `module.exports = router;`.
5. Ejecutamos la suite de pruebas cruzadas en Swagger UI antes de aprobar y completar el merge con el commit:
   `merge: resolve integration conflicts in notas.routes.js for IA summary endpoint`.
