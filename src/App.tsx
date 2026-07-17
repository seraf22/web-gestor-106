import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MovimientosPage } from './pages/MovimientosPage';
import { NuevoMovimientoPage } from './pages/NuevoMovimientoPage';
import { AnalizarDocumentoPage } from './pages/AnalizarDocumentoPage';
import { ReportesPage } from './pages/ReportesPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/movimientos" element={<MovimientosPage />} />
          <Route path="/nuevo-movimiento" element={<NuevoMovimientoPage />} />
          <Route path="/analizar" element={<AnalizarDocumentoPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
