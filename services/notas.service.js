const { AppError } = require("../utils/errors");

// Arreglo donde se guardarán las notas temporalmente
let notas = [];

// Contador para asignar un ID único
let nextId = 1;

// Obtener todas las notas
function listar() {
  return notas;
}

// Buscar una nota por su ID
function buscar(id) {
  const nota = notas.find((n) => n.id === id);

  if (!nota) {
    throw new AppError(404, "Nota no encontrada");
  }

  return nota;
}

// Crear una nueva nota
function crear({ titulo, contenido }) {
  const nuevaNota = {
    id: nextId++,
    titulo,
    contenido,
  };

  notas.push(nuevaNota);

  return nuevaNota;
}

// Eliminar una nota por su ID
function eliminar(id) {
  // Primero verificamos que exista
  const nota = buscar(id);

  // Eliminamos la nota del arreglo
  notas = notas.filter((n) => n.id !== id);

  return nota;
}

// Exportar funciones
module.exports = {
  listar,
  buscar,
  crear,
  eliminar,
};
