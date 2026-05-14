import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Leaf, LucideIcon, ChevronDown, ChevronRight, Building2, Truck, HardHat, Warehouse } from 'lucide-react';
import { useState } from 'react';
import './sidebar.css';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string | null;
  submenu?: SubMenuItem[];
}

interface SubMenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'La Finca',
    path: '/finca',
    icon: Leaf,
    submenu: [
      { name: 'Fincas', path: '/finca', icon: Building2 },
      { name: 'Proveedores', path: '/proveedores', icon: Truck },
      { name: 'Trabajadores', path: '/trabajadores', icon: HardHat },
    ],
  },
  {
    name: 'Bodega',
    path: '/bodega',
    icon: Warehouse,
    submenu: [
      { name: 'Productos', path: '/productos', icon: Package },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [submenuAbierto, setSubmenuAbierto] = useState<string | null>(null);

  const toggleSubmenu = (path: string) => {
    setSubmenuAbierto(submenuAbierto === path ? null : path);
  };

  const NavItem = ({ item }: { item: MenuItem }) => {
    const active = location.pathname === item.path;
    const Icon = item.icon;
    const tieneSubmenu = item.submenu && item.submenu.length > 0;
    const abierto = submenuAbierto === item.path;
    const submenuActivo = item.submenu?.some(s => location.pathname === s.path);

    if (tieneSubmenu) {
      return (
        <div>
          <button
            className={`sb-nav-item sb-nav-item--btn ${submenuActivo ? 'sb-nav-item--active' : ''}`}
            onClick={() => toggleSubmenu(item.path)}
          >
            {submenuActivo && <span className="sb-nav-indicator" />}
            <span className={`sb-nav-icon ${submenuActivo ? 'sb-nav-icon--active' : ''}`}>
              <Icon size={17} strokeWidth={1.75} />
            </span>
            <span className={`sb-nav-label ${submenuActivo ? 'sb-nav-label--active' : ''}`}>
              {item.name}
            </span>
            <span className="sb-nav-chevron">
              {abierto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </button>

          {abierto && (
            <div className="sb-submenu">
              {item.submenu!.map((sub) => {
                const subActivo = location.pathname === sub.path;
                const SubIcon = sub.icon;
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`sb-submenu-item ${subActivo ? 'sb-submenu-item--active' : ''}`}
                  >
                    <span className="sb-submenu-icon">
                      <SubIcon size={17} strokeWidth={1.75} />
                    </span>
                    <span className="sb-submenu-label">{sub.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.path}
        className={`sb-nav-item ${active ? 'sb-nav-item--active' : ''}`}
      >
        {active && <span className="sb-nav-indicator" />}
        <span className={`sb-nav-icon ${active ? 'sb-nav-icon--active' : ''}`}>
          <Icon size={17} strokeWidth={1.75} />
        </span>
        <span className={`sb-nav-label ${active ? 'sb-nav-label--active' : ''}`}>
          {item.name}
        </span>
        {item.badge && (
          <span className="sb-nav-badge">{item.badge}</span>
        )}
      </Link>
    );
  };

  return (
    <aside className="sb-root">
      <div className="sb-header">
        <div className="sb-logo-icon">
          <Leaf size={18} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="sb-title">Inventario</h1>
          <p className="sb-subtitle">Sistema de Gestion</p>
        </div>
      </div>

      <div className="sb-section">
        <p className="sb-section-label">Principal</p>
        <nav className="sb-nav">
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;