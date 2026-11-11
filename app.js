const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
// Permite peticiones desde el cliente React en desarrollo (por ejemplo: http://localhost:5173)
app.use(cors());

// Middleware para recibir JSON
app.use(express.json());

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de notas
app.use("/api/notas", require("./routes/notas.routes"));

// Rutas de inteligencia artificial
app.use("/api/ia", require("./routes/ia.routes"));

// Middleware de errores (siempre al final)
app.use(errorHandler);

module.exports = app;
