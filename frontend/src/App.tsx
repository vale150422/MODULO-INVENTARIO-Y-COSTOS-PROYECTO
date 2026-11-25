import { useAuth } from './hooks/useAuth';
import Login from './pages/LoginPage/Login';
import Dashboard from './pages/Dashboard';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import { FincaActivaProvider } from './context/FincaActivaProvider';
import { useFincaActiva } from './context/useFincaActiva';
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
import AlertasPage from './pages/AlertasPage';

// Contenido de la página. El key hace que, al cambiar de finca, la página actual
// se vuelva a montar y recargue todos sus datos con la finca nueva.
function Contenido() {
  const { fincaActiva } = useFincaActiva();
  return (
    <div key={fincaActiva?.id_finca ?? 'sin-finca'} className="flex-1 overflow-auto">
      <Outlet />
    </div>
  );
}

// Un solo layout para todas las rutas protegidas: el menú y la finca activa
// se montan una vez y NO se recargan al navegar entre páginas.
function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <FincaActivaProvider>
      <div className="flex h-screen bg-[#0d1f14] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <Contenido />
        </div>
      </div>
    </FincaActivaProvider>
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

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={user?.role === 'admin' ? <Dashboard /> : <MiPanelPage />} />
          <Route path="/kardex" element={<Kardex />} />
          <Route path="/fincas" element={<FincaPage />} />
          <Route path="/productos" element={<ProductoPage />} />
          <Route path="/proveedores" element={<ProveedorPage />} />
          <Route path="/trabajadores" element={<TrabajadorPage />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/mi-panel" element={<MiPanelPage />} />
          <Route path="/reporte-kardex" element={<ReporteKardex />} />
          <Route path="/categorias" element={<CategoriaPage />} />
          <Route path="/perfil" element={<PerfilAdmin />} />
          <Route path="/alertas" element={<AlertasPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}