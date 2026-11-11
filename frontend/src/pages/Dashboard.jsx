// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { obtenerNotas, eliminarNota } from '../services/api';
import NotaForm from '../components/NotaForm';
import NotaCard from '../components/NotaCard';
import ChatIA from '../components/ChatIA';

export default function Dashboard() {
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial de notas desde el backend
  const cargarNotas = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerNotas();
      setNotas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al conectar con la API de notas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarNotas();
  }, []);

  // Manejador para agregar una nueva nota a la lista en tiempo real
  const handleNotaCreada = (nuevaNota) => {
    setNotas((prev) => [nuevaNota, ...prev]);
  };

  // Manejador para eliminar una nota
  const handleEliminarNota = async (id) => {
    try {
      await eliminarNota(id);
      setNotas((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(`No se pudo eliminar la nota: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Barra de Navegación y Encabezado Superior */}
      <header className="app-header">
        <div className="brand-title">
          <span>⚡</span>
          <span className="brand-gradient">
            Laboratorio #5 — Gestor de Notas + DeepSeek IA
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge-branch">Branch: feature/alanie</span>
          <a
            href="http://localhost:3000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            📖 Swagger UI
          </a>
        </div>
      </header>

      {/* Contenedor Principal en 2 Columnas */}
      <main className="container">
        <div className="dashboard-grid">
          {/* ========================================================
              COLUMNA IZQUIERDA: GESTIÓN DE NOTAS (INTEGRANTE A + B)
              ======================================================== */}
          <section className="panel-card notes-focus">
            <div className="panel-header">
              <h2 className="panel-title" style={{ color: 'var(--color-notes-blue-light)' }}>
                <span>📝</span>
                <span>Gestor de Notas</span>
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={cargarNotas}
                disabled={cargando}
                title="Recargar listado desde el backend"
              >
                🔄 Recargar
              </button>
            </div>

            {/* Formulario para Crear Nota */}
            <NotaForm onNotaCreada={handleNotaCreada} />

            {/* Alerta de Error en Notas */}
            {error && (
              <div className="alert-error" role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Listado de Notas */}
            <div className="panel-header" style={{ marginTop: '1.5rem', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Notas Registradas ({notas.length})
              </h3>
            </div>

            {cargando ? (
              <div className="empty-state">
                <span className="loading-dots">Cargando notas desde el servidor</span>
              </div>
            ) : notas.length === 0 ? (
              <div className="empty-state">
                <p>No hay notas guardadas aún.</p>
                <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                  Crea una nota arriba para luego probar la síntesis con IA.
                </p>
              </div>
            ) : (
              <div className="notes-list">
                {notas.map((nota) => (
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    onEliminar={handleEliminarNota}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ========================================================
              COLUMNA DERECHA: CONSULTA DIRECTA A DEEPSEEK IA (B)
              ======================================================== */}
          <section>
            <ChatIA />
          </section>
        </div>
      </main>
    </div>
  );
}

