import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Menu, X } from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import defaultLogo from "../../assets/logo.webp";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 14);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => () => document.body.classList.remove("menu-open"), []);

  function toggleMenu() {
    setMenuOpen((current) => {
      const nextValue = !current;
      document.body.classList.toggle("menu-open", nextValue);
      return nextValue;
    });
  }

  function closeMenu() {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
  }

  function getNavLinkClassName({ isActive }) {
    return isActive ? "active" : undefined;
  }

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container navbar-shell">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img className="brand-logo" src={settings.logoUrl || defaultLogo} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.src = defaultLogo; }} />
          <span className="brand-text">{settings.businessName || "Autoestética Tucumán"}</span>
        </Link>

        <nav className="nav-links" aria-label="Navegación principal">
          <NavLink to="/" className={getNavLinkClassName} onClick={closeMenu}>
            Inicio
          </NavLink>
          <NavLink to="/servicios" className={getNavLinkClassName} onClick={closeMenu}>
            Servicios
          </NavLink>
          <NavLink to="/galeria" className={getNavLinkClassName} onClick={closeMenu}>
            Galería
          </NavLink>
          <Link to="/consulta" className="btn-minimal" onClick={closeMenu}>
            Consultar
          </Link>
        </nav>

        <Link to="/admin" className="admin-link" aria-label="Panel de Administración">
          <Lock size={16} />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            className="mobile-overlay"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <nav className="mobile-nav-links" aria-label="Navegación móvil">
              <NavLink to="/" className={getNavLinkClassName} onClick={closeMenu}>
                Inicio
              </NavLink>
              <NavLink to="/servicios" className={getNavLinkClassName} onClick={closeMenu}>
                Servicios
              </NavLink>
              <NavLink to="/galeria" className={getNavLinkClassName} onClick={closeMenu}>
                Galería
              </NavLink>
              <Link to="/consulta" className="nav-cta" onClick={closeMenu}>
                Consultar
              </Link>
              <Link to="/admin" className="admin-link-mobile" onClick={closeMenu}>
                <Lock size={16} /> Panel de Administración
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
