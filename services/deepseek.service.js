const OpenAI = require("openai");

/**
 * Validación inicial de credenciales al cargar el módulo.
 * Previene fallos silenciosos y alerta en consola.
 */
if (!process.env.DEEPSEEK_API_KEY) {
  console.warn(
    "⚠️  [DeepSeek Service Warning]: DEEPSEEK_API_KEY no está definida en las variables de entorno (.env)."
  );
}

/**
 * Cliente OpenAI configurado para comunicarse con el endpoint de DeepSeek.
 */
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "missing-key",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

/**
 * Envía un mensaje o instrucción al modelo DeepSeek utilizando el SDK de OpenAI.
 *
 * @param {string} texto - Pregunta o contenido a procesar.
 * @param {string} [system] - Directiva de sistema para definir el comportamiento o rol.
 * @returns {Promise<{ respuesta: string, uso: { input_tokens: number, output_tokens: number } }>}
 */
async function preguntar(texto, system) {
  const completion = await client.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: system ?? "Eres un asistente útil. Responde en español.",
      },
      {
        role: "user",
        content: texto,
      },
    ],
  });

  const primerMensaje = completion.choices?.[0]?.message?.content;
  const respuesta = typeof primerMensaje === "string" ? primerMensaje : "";

  const uso = {
    input_tokens: completion.usage?.prompt_tokens ?? 0,
    output_tokens: completion.usage?.completion_tokens ?? 0,
  };

  return {
    respuesta,
    uso,
  };
}

module.exports = {
  preguntar,
};

