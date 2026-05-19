import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kardex from './pages/Kardex';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import FincaPage from './pages/FincaPage/FincaPage';
import ProductoPage from './pages/ProductoPage/ProductosPage';
import ProveedorPage from './pages/ProveedorPage/ProveedorPage';
import TrabajadorPage from './pages/TrabajadorPage/TrabajadorPage';
import Reportes from './pages/Reportes';

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
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/kardex" element={<ProtectedLayout><Kardex /></ProtectedLayout>} />
        <Route path="/fincas" element={<ProtectedLayout><FincaPage /></ProtectedLayout>} />
        <Route path="/productos" element={<ProtectedLayout><ProductoPage /></ProtectedLayout>} />
        <Route path="/proveedores" element={<ProtectedLayout><ProveedorPage /></ProtectedLayout>} />
        <Route path="/trabajadores" element={<ProtectedLayout><TrabajadorPage /></ProtectedLayout>} />
        <Route path="/reportes" element={<ProtectedLayout><Reportes /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}