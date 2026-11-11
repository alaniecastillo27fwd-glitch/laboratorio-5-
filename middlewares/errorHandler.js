const { AppError } = require("../utils/errors");

// Middleware centralizado para manejar errores

module.exports = (err, req, res, next) => {
  // Errores personalizados de la aplicación
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  // Errores inesperados
  console.error(err);

  res.status(500).json({
    error: "Error interno del servidor",
  });
};
