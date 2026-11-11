// frontend/src/components/NotaForm.jsx
import { useState } from 'react';
import { crearNota } from '../services/api';

export default function NotaForm({ onNotaCreada }) {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación preliminar en cliente
    if (!titulo.trim() || !contenido.trim()) {
      setError('Tanto el título como el contenido son obligatorios');
      return;
    }

    try {
      setCargando(true);
      const nuevaNota = await crearNota({
        titulo: titulo.trim(),
        contenido: contenido.trim(),
      });

      // Limpiar formulario y notificar al padre
      setTitulo('');
      setContenido('');
      if (onNotaCreada) {
        onNotaCreada(nuevaNota);
      }
    } catch (err) {
      setError(err.message || 'Error al guardar la nota');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      {error && (
        <div className="alert-error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="titulo">
          Título de la nota
        </label>
        <input
          id="titulo"
          type="text"
          className="form-input"
          placeholder="Ej: Arquitectura de Microservicios"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={cargando}
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="contenido">
          Contenido o apuntes
        </label>
        <textarea
          id="contenido"
          className="form-textarea"
          placeholder="Escribe el contenido detallado de tu nota..."
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          disabled={cargando}
          maxLength={5000}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={cargando}
        style={{ width: '100%' }}
      >
        {cargando ? 'Guardando nota...' : '➕ Crear Nota'}
      </button>
    </form>
  );
}

