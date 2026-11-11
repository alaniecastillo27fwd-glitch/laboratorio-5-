// Clase personalizada para manejar errores de la aplicación

class AppError extends Error {
  constructor(status, message) {
    super(message);

    this.status = status;
  }
}

module.exports = { AppError };
