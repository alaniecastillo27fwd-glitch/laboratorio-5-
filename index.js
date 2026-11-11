// Cargar variables de entorno
require("dotenv").config();

// Importar aplicación Express
const app = require("./app");

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log("=================================");
  console.log("Servidor iniciado correctamente");
  console.log(`Puerto: ${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  console.log("=================================");
});
