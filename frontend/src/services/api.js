const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Función auxiliar para realizar peticiones HTTP uniformes.
 * Procesa automáticamente respuestas JSON y formatea errores del backend (Zod / AppError / OpenAI).
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);

    // DELETE 204 No Content no devuelve cuerpo
    if (res.status === 204) {
      return null;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Manejo de errores de validación estructurados de Zod
      if (Array.isArray(data.errores) && data.errores.length > 0) {
        const detalles = data.errores.map((err) => err.message).join('. ');
        throw new Error(detalles);
      }

      // Mensaje de error personalizado del backend
      throw new Error(data.error || `Error del servidor (${res.status})`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté activo en http://localhost:3000');
    }
    throw err;
  }
}

/**
 * GET /api/notas - Obtiene el listado completo de notas
 */
export async function obtenerNotas() {
  return request('/notas', { method: 'GET' });
}

/**
 * POST /api/notas - Crea una nueva nota validada con Zod
 */
export async function crearNota({ titulo, contenido }) {
  return request('/notas', {
    method: 'POST',
    body: JSON.stringify({ titulo, contenido }),
  });
}

/**
 * DELETE /api/notas/:id - Elimina una nota por su ID
 */
export async function eliminarNota(id) {
  return request(`/notas/${id}`, { method: 'DELETE' });
}

/**
 * POST /api/notas/:id/resumen - Genera un resumen en 3 viñetas con DeepSeek
 */
export async function resumirNota(id) {
  return request(`/notas/${id}/resumen`, { method: 'POST' });
}

/**
 * POST /api/ia/preguntar - Envía una consulta libre a DeepSeek
 */
export async function preguntarIA(pregunta) {
  return request('/ia/preguntar', {
    method: 'POST',
    body: JSON.stringify({ pregunta }),
  });
}

