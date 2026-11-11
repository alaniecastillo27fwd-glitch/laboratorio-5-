// frontend/src/components/NotaCard.jsx
import { useState } from 'react';
import { resumirNota } from '../services/api';

export default function NotaCard({ nota, onEliminar }) {
  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState(null);

  const handleResumir = async () => {
    try {
      setCargandoResumen(true);
      setErrorResumen(null);

      // Llamada al endpoint POST /api/notas/:id/resumen (Integrante B con DeepSeek)
      const data = await resumirNota(nota.id);
      setResumen(data.resumen);
    } catch (err) {
      setErrorResumen(err.message || 'Error al generar el resumen');
    } finally {
      setCargandoResumen(false);
    }
  };

  return (
    <article className="note-card">
      <div className="note-header">
        <h4 className="note-title">
          <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem', fontSize: '0.85rem' }}>
            #{nota.id}
          </span>
          {nota.titulo}
        </h4>
      </div>

      <p className="note-content">{nota.contenido}</p>

      {/* Recuadro de Resumen IA (DeepSeek) */}
      {resumen && (
        <div className="summary-box">
          <div className="summary-title">✨ Resumen en 3 viñetas (DeepSeek IA):</div>
          <div style={{ whiteSpace: 'pre-line' }}>{resumen}</div>
        </div>
      )}

      {/* Alerta de Error si la IA no está disponible */}
      {errorResumen && (
        <div className="alert-error" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
          <span>⚠️</span>
          <span>{errorResumen}</span>
        </div>
      )}

      {/* Acciones de la Tarjeta */}
      <div className="note-actions" style={{ marginTop: '0.85rem' }}>
        <button
          type="button"
          className="btn btn-ai btn-sm"
          onClick={handleResumir}
          disabled={cargandoResumen}
          title="Genera una síntesis en 3 viñetas utilizando DeepSeek"
        >
          {cargandoResumen ? 'Generando resumen con DeepSeek...' : '✨ Resumir en 3 viñetas (IA)'}
        </button>

        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onEliminar(nota.id)}
          disabled={cargandoResumen}
          title="Eliminar esta nota"
        >
          🗑️ Eliminar
        </button>
      </div>
    </article>
  );
}

