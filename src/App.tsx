import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MovimientosPage } from './pages/MovimientosPage';
import { NuevoMovimientoPage } from './pages/NuevoMovimientoPage';
import { AnalizarDocumentoPage } from './pages/AnalizarDocumentoPage';
import { AnalizarTextoPage } from './pages/AnalizarTextoPage';
import { LoginPage } from './pages/LoginPage';
import { ReportesPage } from './pages/ReportesPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/movimientos" element={<ProtectedRoute><MovimientosPage /></ProtectedRoute>} />
          <Route path="/nuevo-movimiento" element={<ProtectedRoute><NuevoMovimientoPage /></ProtectedRoute>} />
          <Route path="/analizar" element={<ProtectedRoute><AnalizarDocumentoPage /></ProtectedRoute>} />
          <Route path="/analizar-texto" element={<ProtectedRoute><AnalizarTextoPage /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><ReportesPage /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
