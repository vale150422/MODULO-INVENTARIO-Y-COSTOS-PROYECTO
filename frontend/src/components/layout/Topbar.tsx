import { useLocation } from 'react-router-dom';

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
  const title = titulos[pathname] ?? 'Inventario';

  return (
    <div className="h-14 bg-[#111c17] border-b border-[#264d35]
                    flex items-center justify-between px-6 flex-shrink-0">
      <p className="text-sm font-semibold text-white">{title}</p>
    </div>
  );
}