import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';

import ProductosPage from "./pages/ProductoPage/ProductosPage";
import FincaPage from "./pages/FincaPage/FincaPage";
import ProveedoresPage from './pages/ProveedorPage/ProveedorPage';
import TrabajadoresPage from './pages/TrabajadorPage/TrabajadorPage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="productos" element={<ProductosPage />} />
        <Route path="finca" element={<FincaPage />} />
        <Route path="/proveedores" element={<ProveedoresPage />} />
        <Route path="/trabajadores" element={<TrabajadoresPage />} />
      </Route>
    </Routes>
  );
}

export default App;