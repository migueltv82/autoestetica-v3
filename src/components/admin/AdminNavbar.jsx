import { NavLink, Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "../../hooks/useAuth";

const items = [
  { to: "/admin/dashboard", label: "Inicio", icon: <LayoutDashboard size={20} /> },
  { to: "/admin/turnos", label: "Agenda", icon: <CalendarDays size={20} /> },
  { to: "/admin/caja", label: "Caja", icon: <Wallet size={20} /> },
  { to: "/admin/clientes", label: "Clientes", icon: <Users size={20} /> },
  { to: "/admin/servicios", label: "Servicios", icon: <Wrench size={20} /> },
  { to: "/admin/galeria", label: "Galeria", icon: <ImageIcon size={20} /> },
  { to: "/admin/configuracion", label: "Ajustes", icon: <Settings size={20} /> },
];

function AdminNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function getLinkClassName({ isActive }) {
    return `admin-sidebar-link${isActive ? " active" : ""}`;
  }

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
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
        {user?.email ? <span className="sidebar-user" title={user.email}>{user.email}</span> : null}
        <Link to="/" className="admin-sidebar-link">
          <span className="link-icon"><Globe size={20} /></span>
          <span className="link-label">Ver sitio público</span>
        </Link>
        <button type="button" className="admin-sidebar-link logout sidebar-logout" onClick={handleSignOut}>
          <span className="link-icon"><LogIn size={20} /></span>
          <span className="link-label">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminNavbar;
