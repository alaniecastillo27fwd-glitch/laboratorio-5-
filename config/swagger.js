const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Laboratorio 5 - API REST Notas + IA",
      version: "1.0.0",
      description: "API REST con Express, Swagger y DeepSeek",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],

    components: {
      schemas: {
        Nota: {
          type: "object",
          required: ["titulo", "contenido"],
          properties: {
            id: {
              type: "integer",
              example: 1,
              readOnly: true,
            },

            titulo: {
              type: "string",
              example: "Mi primera nota",
            },

            contenido: {
              type: "string",
              example: "Este es el contenido de mi nota",
            },
          },
        },

        Pregunta: {
          type: "object",
          required: ["pregunta"],
          properties: {
            pregunta: {
              type: "string",
              example: "¿Qué es una API REST?",
            },
          },
        },
      },
    },
  },

  apis: [require("path").join(__dirname, "../routes/*.js").replace(/\\/g, "/")],
});

module.exports = swaggerSpec;
