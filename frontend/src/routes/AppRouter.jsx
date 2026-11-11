// frontend/src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

/**
 * Enrutador central de la aplicación cliente.
 * Configura las rutas declarativas utilizando React Router v6+.
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal hacia el Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Fallback para cualquier ruta no mapeada */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

