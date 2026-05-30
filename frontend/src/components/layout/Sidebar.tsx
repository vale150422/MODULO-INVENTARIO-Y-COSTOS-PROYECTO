import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const adminItems = [

  { to: '/',               label: 'Dashboard',    icon: '📊' },
  { to: '/fincas',         label: 'Fincas',       icon: '🌿' },
  { to: '/trabajadores',   label: 'Trabajadores', icon: '👥' },
  { to: '/proveedores',    label: 'Proveedores',  icon: '🏪' },
  { to: '/categorias',     label: 'Categorías',   icon: '🏷️' },
  { to: '/productos',      label: 'Insumos',    icon: '🛒' },
  { to: '/kardex',         label: 'Kardex',       icon: '📦' },
  { to: '/reportes',       label: 'Reportes',     icon: '📈' },
  { to: '/reporte-kardex', label: 'Rep. Kardex',  icon: '📋' },
  { to: '/perfil',         label: 'Mi Perfil',    icon: '👤' },
];


const empleadoItems = [
  { to: '/mi-panel',       label: 'Mi Panel',    icon: '🏠' },
  { to: '/fincas',         label: 'Mis Fincas',  icon: '🌿' },
  { to: '/kardex',         label: 'Kardex',      icon: '📦' },
  { to: '/reporte-kardex', label: 'Reporte Kardex',     icon: '📊' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { dark, toggle } = useTheme();
  const isAdmin = user?.role === 'admin';
  const items = isAdmin ? adminItems : empleadoItems;

  return (
    <aside className={`w-52 flex flex-col h-screen flex-shrink-0 border-r transition-colors duration-200
      ${dark ? 'bg-[#1e3512] border-[#2d4a1e]' : 'bg-[#2d4a1e] border-[#4a7c3f]'}`}>

      {/* Logo */}
      <div className="p-4 border-b border-[#4a7c3f]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#f5f0e0] border-2 border-[#d4a843]
                          overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Logo"
              className="w-full h-full object-cover scale-[1.35]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#f5f0e0]">Inventario</p>
            <p className="text-xs text-[#8fae5a]">
              Rol: {isAdmin ? 'Administrador' : 'Empleado'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-[#8fae5a] uppercase tracking-widest px-2 pt-2 pb-2">
          {isAdmin ? 'Principal' : 'Mi Panel'}
        </p>
        {items.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
               ${isActive
                 ? 'bg-[#4a7c3f] text-[#f5f0e0] font-semibold'
                 : 'text-[#c8d9a0] hover:bg-[#3d6b2e] hover:text-[#f5f0e0]'}`
            }>
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-2">
        <button onClick={toggle}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                     bg-[#3d6b2e] text-sm hover:bg-[#4a7c3f] transition-colors">
          <span className="text-[#c8d9a0] text-xs font-semibold">
            {dark ? '🌙 Modo oscuro' : '☀️ Modo claro'}
          </span>
          <div className={`w-9 h-5 rounded-full transition-colors duration-300 relative
                          ${dark ? 'bg-[#d4a843]' : 'bg-[#8fae5a]'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow
                            transition-transform duration-300
                            ${dark ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#4a7c3f]">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#3d6b2e]">
          <div className="w-8 h-8 rounded-full bg-[#d4a843] flex items-center justify-center
                          text-xs font-bold text-[#2d4a1e] flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#f5f0e0] truncate">{user?.email ?? 'Usuario'}</p>
            <p className="text-xs text-[#8fae5a]">{isAdmin ? 'Administrador' : 'Empleado'}</p>
          </div>
          <button onClick={logout} title="Cerrar sesión"
            className="text-[#8fae5a] hover:text-red-400 transition-colors text-xs">✕</button>
        </div>
      </div>
    </aside>
  );
}