const router = require("express").Router();

const { z } = require("zod");

const validar = require("../middlewares/validar");

const notas = require("../services/notas.service");
const deepseek = require("../services/deepseek.service"); // Integración con IA (Integrante B)

// Esquema para validar las notas
const notaSchema = z.object({
  titulo: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "El título no puede superar 100 caracteres"),

  contenido: z
    .string()
    .min(1, "El contenido es obligatorio")
    .max(5000, "El contenido no puede superar 5000 caracteres"),
});

// ============================================
// GET /api/notas - LISTAR TODAS LAS NOTAS
// ============================================

/**
 * @openapi
 * /api/notas:
 *   get:
 *     summary: Obtener todas las notas
 *     description: Devuelve una lista de todas las notas registradas.
 *     tags: [Notas]
 *     responses:
 *       200:
 *         description: Lista de notas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nota'
 */

router.get("/", (req, res) => {
  const lista = notas.listar();

  res.status(200).json(lista);
});

// ============================================
// GET /api/notas/:id - BUSCAR UNA NOTA
// ============================================

/**
 * @openapi
 * /api/notas/{id}:
 *   get:
 *     summary: Obtener una nota por ID
 *     description: Busca una nota utilizando su identificador.
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico de la nota a consultar
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Nota encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Nota no encontrada
 */

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "El ID debe ser un número entero positivo",
    });
  }

  const nota = notas.buscar(id);

  res.status(200).json(nota);
});

// ============================================
// POST /api/notas - CREAR UNA NUEVA NOTA
// ============================================

/**
 * @openapi
 * /api/notas:
 *   post:
 *     summary: Crear una nueva nota
 *     description: Registra una nueva nota con título y contenido validados.
 *     tags: [Notas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - contenido
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Aprender Express"
 *               contenido:
 *                 type: string
 *                 example: "Construir APIs REST profesionales con Express y Swagger"
 *     responses:
 *       201:
 *         description: Nota creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       400:
 *         description: Datos de entrada inválidos
 */

router.post("/", validar(notaSchema), (req, res) => {
  const nuevaNota = notas.crear(req.body);

  res.status(201).json(nuevaNota);
});

// ============================================
// DELETE /api/notas/:id - ELIMINAR UNA NOTA
// ============================================

/**
 * @openapi
 * /api/notas/{id}:
 *   delete:
 *     summary: Eliminar una nota por ID
 *     description: Elimina una nota existente.
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la nota a eliminar
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       204:
 *         description: Nota eliminada correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Nota no encontrada
 */

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "El ID debe ser un número entero positivo",
    });
  }

  notas.eliminar(id);

  res.status(204).send();
});

// ========================================================
// POST /api/notas/:id/resumen - RESUMIR NOTA CON IA (B)
// ========================================================

/**
 * @openapi
 * /api/notas/{id}/resumen:
 *   post:
 *     summary: Resume una nota existente en 3 viñetas con IA
 *     description: Busca una nota por su ID y genera un resumen estructurado en 3 viñetas mediante DeepSeek.
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la nota a resumir
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Resumen generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notaId:
 *                   type: integer
 *                   example: 1
 *                 resumen:
 *                   type: string
 *                   example: "• Primer punto clave\n• Segundo punto clave\n• Tercer punto clave"
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Nota no encontrada
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

router.post("/:id/resumen", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "El ID debe ser un número entero positivo",
      });
    }

    const nota = notas.buscar(id); // Lanza AppError 404 si no existe

    const r = await deepseek.preguntar(
      nota.contenido,
      "Resume el texto en 3 viñetas breves, en español."
    );

    res.status(200).json({
      notaId: nota.id,
      resumen: r.respuesta,
    });
  } catch (error) {
    next(error);
  }
});

// Exportar router
module.exports = router;
