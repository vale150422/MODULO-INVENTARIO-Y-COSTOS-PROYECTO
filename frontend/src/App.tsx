import { useAuth } from './hooks/useAuth';
import Login from './pages/LoginPage/Login';
import Dashboard from './pages/Dashboard';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import FincaPage from './pages/FincaPage/FincaPage';
import ProductoPage from './pages/ProductoPage/ProductosPage';
import ProveedorPage from './pages/ProveedorPage/ProveedorPage';
import TrabajadorPage from './pages/TrabajadorPage/TrabajadorPage';
import Reportes from './pages/Reportes';
import MiPanelPage from './pages/MiPanelPage';
import ReporteKardex from './pages/ReporteKardex';
import Kardex from './pages/Kardex';
import CategoriaPage from './pages/CategoriaPage/CategoriaPage';
import PerfilAdmin from './pages/PerfilAdmin';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen bg-[#0d1f14] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#0d1f14] flex items-center justify-center">
      <p className="text-green-500 text-sm">Cargando...</p>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={
          <ProtectedLayout>
            {user?.role === 'admin' ? <Dashboard /> : <MiPanelPage />}
          </ProtectedLayout>
        } />
        <Route path="/kardex" element={<ProtectedLayout><Kardex /></ProtectedLayout>} />
        <Route path="/fincas" element={<ProtectedLayout><FincaPage /></ProtectedLayout>} />
        <Route path="/productos" element={<ProtectedLayout><ProductoPage /></ProtectedLayout>} />
        <Route path="/proveedores" element={<ProtectedLayout><ProveedorPage /></ProtectedLayout>} />
        <Route path="/trabajadores" element={<ProtectedLayout><TrabajadorPage /></ProtectedLayout>} />
        <Route path="/reportes" element={<ProtectedLayout><Reportes /></ProtectedLayout>} />
        <Route path="/mi-panel" element={<ProtectedLayout><MiPanelPage /></ProtectedLayout>} />
        <Route path="/reporte-kardex" element={<ProtectedLayout><ReporteKardex /></ProtectedLayout>} />
        <Route path="/categorias" element={<ProtectedLayout><CategoriaPage /></ProtectedLayout>} />
        <Route path="/perfil" element={<ProtectedLayout><PerfilAdmin /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}