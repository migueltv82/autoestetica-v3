import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Cerrar menú si cambia de ruta
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
  }, [location.pathname]);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
    if (!menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  }

  function closeMenu() {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
  }

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container navbar-shell">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark"></span>
          <span className="brand-text">Autoestética Tucumán</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links desktop-only">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/servicios">Servicios</NavLink>
          <NavLink to="/consulta">Consulta</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
          <Link to="/consulta" className="nav-cta">
            Consultar por WhatsApp
          </Link>
          <Link to="/admin" className="admin-link" title="Acceso al Panel">
            <Lock size={16} />
          </Link>
        </nav>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Abrir menú">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <nav className="mobile-nav-links">
              <NavLink to="/" onClick={closeMenu}>Inicio</NavLink>
              <NavLink to="/servicios" onClick={closeMenu}>Servicios</NavLink>
              <NavLink to="/consulta" onClick={closeMenu}>Consulta</NavLink>
              <NavLink to="/contacto" onClick={closeMenu}>Contacto</NavLink>
              <Link to="/consulta" className="nav-cta mt-4" onClick={closeMenu}>
                Consultar por WhatsApp
              </Link>
              <Link to="/admin" className="admin-link-mobile" onClick={closeMenu}>
                <Lock size={16} /> Panel de Administrador
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;