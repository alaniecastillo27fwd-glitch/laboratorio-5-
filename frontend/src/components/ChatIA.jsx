// frontend/src/components/ChatIA.jsx
import { useState } from 'react';
import { preguntarIA } from '../services/api';

export default function ChatIA() {
  const [pregunta, setPregunta] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Solo bloqueamos cadenas totalmente vacías; permitimos textos cortos (ej: "a")
    // para que la petición llegue al backend y evidencie la validación con Zod (HTTP 400).
    if (!pregunta) {
      setError('Por favor ingresa una pregunta.');
      return;
    }

    try {
      setCargando(true);
      // Invocación a POST /api/ia/preguntar
      const data = await preguntarIA(pregunta);
      setResultado({
        preguntaOriginal: pregunta,
        respuesta: data.respuesta,
        uso: data.uso,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      // Captura tanto errores 400 de Zod como 502 IA_NO_DISPONIBLE
      setError(err.message || 'Error al conectar con la IA');
    } finally {
      setCargando(false);
    }
  };

  const handleSugerencia = (texto) => {
    setPregunta(texto);
    setError(null);
  };

  return (
    <div className="panel-card ai-focus">
      <div className="panel-header">
        <h3 className="panel-title" style={{ color: 'var(--color-ai-purple-light)' }}>
          <span>🤖</span>
          <span>Consulta Libre a DeepSeek IA</span>
        </h3>
        <span className="badge-branch">POST /api/ia/preguntar</span>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Interactúa directamente con el modelo <code>deepseek-chat</code> a través de nuestro backend en Express.
      </p>

      {/* Botones de pruebas cruzadas rápidas */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          Pruebas de Rúbrica:
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleSugerencia('¿Qué es una API REST y para qué sirve?')}
          disabled={cargando}
        >
          200 OK (REST)
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleSugerencia('Explica qué es un JSON en 15 palabras.')}
          disabled={cargando}
        >
          200 OK (Tokens)
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleSugerencia('a')}
          disabled={cargando}
          title="Prueba de rechazo 400 Zod sin llamar a la IA"
          style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
        >
          ★ Test 400 Zod (1 letra)
        </button>
      </div>

      {/* Formulario de Consulta */}
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label className="form-label" htmlFor="preguntaIA" style={{ marginBottom: 0 }}>
              Tu consulta o prompt:
            </label>
            <span
              style={{
                fontSize: '0.78rem',
                color: pregunta.length > 2000 ? 'var(--color-danger)' : 'var(--text-muted)',
              }}
            >
              {pregunta.length} / 2000 caracteres
            </span>
          </div>

          <textarea
            id="preguntaIA"
            className="form-textarea"
            rows="3"
            placeholder="Escribe tu pregunta aquí..."
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            disabled={cargando}
            maxLength={2050}
          />
        </div>

        {/* Alerta de Error Visible (Zod 400 o Error 502 IA_NO_DISPONIBLE) */}
        {error && (
          <div className="alert-error" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-ai"
          disabled={cargando || !pregunta}
          style={{ width: '100%', padding: '0.85rem' }}
        >
          {cargando ? 'Consultando a DeepSeek IA...' : '🚀 Preguntar a la IA'}
        </button>
      </form>

      {/* Panel de Respuesta y Telemetría de Tokens */}
      {resultado && (
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ai-purple)' }}>
              💬 RESPUESTA DEL MODELO ({resultado.timestamp}):
            </span>
          </div>

          {/* Burbuja de respuesta */}
          <div
            className="chat-bubble ia"
            style={{
              width: '100%',
              maxWidth: '100%',
              whiteSpace: 'pre-wrap',
              fontSize: '0.93rem',
              lineHeight: 1.6,
            }}
          >
            {resultado.respuesta}
          </div>

          {/* Badges de Consumo de Tokens (Incluso si son 0 gracias a ??) */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginTop: '0.85rem',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Telemetría de Tokens:
            </span>

            {/* Input Tokens */}
            <div
              className="telemetry-badge"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                borderColor: 'rgba(59, 130, 246, 0.35)',
                color: 'var(--color-notes-blue-light)',
              }}
            >
              <span>📥 Input Tokens:</span>
              <strong>{resultado.uso?.input_tokens ?? 0}</strong>
            </div>

            {/* Output Tokens */}
            <div
              className="telemetry-badge"
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                borderColor: 'rgba(168, 85, 247, 0.35)',
                color: 'var(--color-ai-purple-light)',
              }}
            >
              <span>📤 Output Tokens:</span>
              <strong>{resultado.uso?.output_tokens ?? 0}</strong>
            </div>

            {/* Total Tokens */}
            <div
              className="telemetry-badge"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted)',
              }}
            >
              <span>Total:</span>
              <strong>
                {(resultado.uso?.input_tokens ?? 0) + (resultado.uso?.output_tokens ?? 0)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
