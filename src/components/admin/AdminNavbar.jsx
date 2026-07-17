import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
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
  MoreHorizontal,
  X,
} from "lucide-react";
import "./AdminNavbar.css";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

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
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const primaryItems = items.slice(0, 4);
  const secondaryItems = items.slice(4);

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
        {primaryItems.map((item) => <NavLink key={`mobile-${item.to}`} to={item.to} className={({ isActive }) => `admin-mobile-link${isActive ? " active" : ""}`} onClick={() => setShowMore(false)}><span>{item.icon}</span><small>{item.label}</small></NavLink>)}
        <button type="button" className={`admin-mobile-link mobile-more-trigger ${secondaryItems.some((item) => location.pathname.startsWith(item.to)) ? "active" : ""}`} onClick={() => setShowMore((current) => !current)} aria-expanded={showMore}><span>{showMore ? <X size={20} /> : <MoreHorizontal size={20} />}</span><small>Más</small></button>
      </nav>

      {showMore ? <div className="admin-mobile-more" role="dialog" aria-label="Más opciones"><header><div><strong>Más opciones</strong><span>{user?.email}</span></div><button type="button" onClick={() => setShowMore(false)} aria-label="Cerrar"><X size={20} /></button></header><div>{secondaryItems.map((item) => <NavLink key={`more-${item.to}`} to={item.to} className={getLinkClassName} onClick={() => setShowMore(false)}><span className="link-icon">{item.icon}</span><span className="link-label">{item.label}</span></NavLink>)}</div><Link to="/" className="admin-sidebar-link" onClick={() => setShowMore(false)}><span className="link-icon"><Globe size={20} /></span><span className="link-label">Ver sitio público</span></Link><button type="button" className="admin-sidebar-link logout sidebar-logout" onClick={handleSignOut}><span className="link-icon"><LogIn size={20} /></span><span className="link-label">Cerrar sesión</span></button></div> : null}

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
