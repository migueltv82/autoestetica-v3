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
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminNavbar.css";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/admin/turnos", label: "Turnos", icon: <CalendarDays size={18} /> },
  { to: "/admin/caja", label: "Caja", icon: <Wallet size={18} /> },
  { to: "/admin/clientes", label: "Clientes", icon: <Users size={18} /> },
  { to: "/admin/servicios", label: "Servicios", icon: <Wrench size={18} /> },
  { to: "/admin/galeria", label: "Galeria", icon: <ImageIcon size={18} /> },
  { to: "/admin/configuracion", label: "Configuracion", icon: <Settings size={18} /> },
];

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function getAdminLinkClassName({ isActive }) {
    return `admin-navbar-link${isActive ? " active" : ""}`;
  }

  return (
    <nav className={`admin-navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="admin-navbar-container">
        <Link to="/admin/dashboard" className="admin-navbar-brand">
          <span className="admin-navbar-dot"></span>
          <div>
            <strong>Autoestetica</strong>
            <span>Control center</span>
          </div>
        </Link>

        <div className="admin-navbar-links desktop-only">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={getAdminLinkClassName}>
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

        <button
          type="button"
          className="admin-navbar-toggle mobile-only"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Cerrar menu del panel" : "Abrir menu del panel"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="admin-navbar-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getAdminLinkClassName}
                onClick={() => setIsOpen(false)}
              >
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
              <span>Cerrar sesion</span>
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default AdminNavbar;
