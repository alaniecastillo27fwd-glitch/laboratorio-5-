const router = require("express").Router();
const { z } = require("zod");
const validar = require("../middlewares/validar");
const deepseek = require("../services/deepseek.service");

/**
 * Esquema de validación para el endpoint de preguntas a la IA.
 */
const preguntaSchema = z.object({
  pregunta: z
    .string({
      required_error: 'El campo "pregunta" es obligatorio',
      invalid_type_error: 'El campo "pregunta" debe ser una cadena de texto',
    })
    .trim()
    .min(3, "La pregunta debe contener al menos 3 caracteres")
    .max(2000, "La pregunta no puede exceder los 2000 caracteres"),
});

/**
 * @openapi
 * /api/ia/preguntar:
 *   post:
 *     summary: Envía una pregunta libre al modelo de IA
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pregunta
 *             properties:
 *               pregunta:
 *                 type: string
 *                 example: "¿Qué es una API REST y para qué sirve?"
 *     responses:
 *       200:
 *         description: Respuesta del modelo generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 respuesta:
 *                   type: string
 *                   example: "Una API REST es una interfaz de programación de aplicaciones basada en peticiones HTTP."
 *                 uso:
 *                   type: object
 *                   properties:
 *                     input_tokens:
 *                       type: integer
 *                       example: 22
 *                     output_tokens:
 *                       type: integer
 *                       example: 35
 *       400:
 *         description: Datos de entrada inválidos (falla de validación Zod)
 *       502:
 *         description: Servicio de IA no disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "IA_NO_DISPONIBLE"
 */
router.post("/preguntar", validar(preguntaSchema), async (req, res, next) => {
  try {
    const resultado = await deepseek.preguntar(req.body.pregunta);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
