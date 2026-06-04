import { useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ModalAyuda from '../ModalAyuda';

const titulos: Record<string, string> = {
  '/':               'Dashboard',
  '/fincas':         'Fincas',
  '/trabajadores':   'Trabajadores',
  '/kardex':         'Kardex',
  '/productos':      'Insumos',
  '/proveedores':    'Proveedores',
  '/reportes':       'Reportes',
  '/categorias':     'Categorías',
  '/perfil':         'Mi Perfil',
  '/mi-panel':       'Mi Panel',
  '/reporte-kardex': 'Reporte Kardex',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const title = titulos[pathname] ?? 'Inventario';
  const rol = user?.role === 'admin' ? 'admin' : 'empleado';

  return (
    <>
      <div className="h-14 bg-[#111c17] border-b border-[#264d35]
                      flex items-center justify-between px-6 flex-shrink-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <button
          onClick={() => setAyudaAbierta(true)}
          title="Ayuda"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     text-[#8fae5a] hover:text-[#f5f0e0] hover:bg-[#264d35]
                     transition-colors text-xs font-medium">
          <HelpCircle size={15} strokeWidth={1.75} />
          <span>Ayuda</span>
        </button>
      </div>

      <ModalAyuda
        rol={rol}
        abierto={ayudaAbierta}
        onCerrar={() => setAyudaAbierta(false)}
      />
    </>
  );
}