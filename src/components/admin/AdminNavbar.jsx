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
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminNavbar.css";

const items = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    to: "/admin/turnos",
    label: "Turnos",
    icon: <CalendarDays size={18} />,
  },
  {
    to: "/admin/caja",
    label: "Caja",
    icon: <Wallet size={18} />,
  },
  {
    to: "/admin/clientes",
    label: "Clientes",
    icon: <Users size={18} />,
  },
  {
    to: "/admin/servicios",
    label: "Servicios",
    icon: <Wrench size={18} />,
  },
  {
    to: "/admin/configuracion",
    label: "Configuración",
    icon: <Settings size={18} />,
  },
];

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        <div className="admin-navbar-brand">
          <span className="admin-navbar-dot"></span>
          <div>
            <strong>Autoestética</strong>
            <span>Admin</span>
          </div>
        </div>

        <div className="admin-navbar-links desktop-only">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className="admin-navbar-link">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="admin-navbar-actions desktop-only">
          <Link to="/" className="admin-navbar-site-link" title="Volver al sitio">
            <Globe size={18} />
          </Link>
          <NavLink to="/admin/login" className="admin-navbar-logout">
            <LogIn size={18} />
            <span>Cerrar</span>
          </NavLink>
        </div>

        <button className="admin-navbar-toggle mobile-only" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="admin-navbar-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className="admin-navbar-link" onClick={() => setIsOpen(false)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
            <hr style={{ opacity: 0.1, margin: "0.5rem 0" }} />
            <Link to="/" className="admin-navbar-link" onClick={() => setIsOpen(false)}>
              <Globe size={18} />
              <span>Volver al sitio</span>
            </Link>
            <NavLink to="/admin/login" className="admin-navbar-link" onClick={() => setIsOpen(false)}>
              <LogIn size={18} />
              <span>Cerrar sesión</span>
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default AdminNavbar;
