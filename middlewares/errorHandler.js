const OpenAI = require("openai");
const { ZodError } = require("zod");
const { AppError } = require("../utils/errors");

/**
 * Middleware centralizado para manejar errores.
 * Aplica principios de Zero Information Leakage (ZIL):
 * - Ninguna credencial o traza interna del proveedor de IA se expone al cliente.
 * - Los errores externos se registran en servidor y se devuelven enmascarados.
 */
module.exports = (err, req, res, next) => {
  // 1. Errores de validación de Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "DATOS_INVALIDOS",
      errores: err.issues,
    });
  }

  // 2. Errores personalizados de la aplicación (AppError)
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  // 3. Errores de la API de IA (DeepSeek vía OpenAI SDK)
  if (err instanceof OpenAI.APIError) {
    console.error("DeepSeek Error:", err.status, err.message);

    let status = 502; // Bad Gateway por defecto

    if (err.status === 429) {
      status = 429;
    } else if (err.status === 503 || err.status === 529) {
      status = 503;
    } else if (err.status === 401 || err.status === 400) {
      status = 502;
    }

    return res.status(status).json({
      error: "IA_NO_DISPONIBLE",
    });
  }

  // 4. Errores inesperados del servidor
  console.error("Error no controlado:", err);

  res.status(500).json({
    error: "Error interno del servidor",
  });
};
