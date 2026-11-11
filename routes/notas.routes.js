const router = require("express").Router();

const { z } = require("zod");

const validar = require("../middlewares/validar");

const notas = require("../services/notas.service");

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
 *         description: ID de la nota
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
// POST /api/notas - CREAR UNA NOTA
// ============================================

/**
 * @openapi
 * /api/notas:
 *   post:
 *     summary: Crear una nueva nota
 *     description: Registra una nota con título y contenido.
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
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Mi primera nota
 *               contenido:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 example: Este es el contenido de mi nota.
 *     responses:
 *       201:
 *         description: Nota creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       400:
 *         description: Datos inválidos
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

// Exportar router
module.exports = router;
