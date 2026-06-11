import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Users,
  Wrench,
  Settings,
  LogIn,
  Globe,
  Image as ImageIcon,
} from "lucide-react";
import "./AdminNavbar.css";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/admin/turnos", label: "Agenda", icon: <CalendarDays size={20} /> },
  { to: "/admin/caja", label: "Caja", icon: <Wallet size={20} /> },
  { to: "/admin/clientes", label: "Clientes", icon: <Users size={20} /> },
  { to: "/admin/servicios", label: "Servicios", icon: <Wrench size={20} /> },
  { to: "/admin/galeria", label: "Galeria", icon: <ImageIcon size={20} /> },
  { to: "/admin/configuracion", label: "Ajustes", icon: <Settings size={20} /> },
];

function AdminNavbar() {
  function getLinkClassName({ isActive }) {
    return `admin-sidebar-link${isActive ? " active" : ""}`;
  }

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-dot" />
        <div className="brand-copy">
          <strong>Autoestética</strong>
          <span>Panel de Control</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={getLinkClassName}>
            <span className="link-icon">{item.icon}</span>
            <span className="link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="admin-sidebar-link">
          <span className="link-icon"><Globe size={20} /></span>
          <span className="link-label">Ver sitio público</span>
        </Link>
        <Link to="/admin/login" className="admin-sidebar-link logout">
          <span className="link-icon"><LogIn size={20} /></span>
          <span className="link-label">Cerrar sesión</span>
        </Link>
      </div>
    </aside>
  );
}

export default AdminNavbar;
