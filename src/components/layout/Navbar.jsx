import { NavLink, Link } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 14);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <span className="brand-mark"></span>
          <span className="brand-text">Autoestetica Tucuman</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={getNavLinkClassName} onClick={closeMenu}>
            Inicio
          </NavLink>
          <NavLink to="/servicios" className={getNavLinkClassName} onClick={closeMenu}>
            Servicios
          </NavLink>
          <NavLink to="/consulta" className={getNavLinkClassName} onClick={closeMenu}>
            Consulta
          </NavLink>
          <NavLink to="/contacto" className={getNavLinkClassName} onClick={closeMenu}>
            Contacto
          </NavLink>
          <Link to="/consulta" className="nav-cta" onClick={closeMenu}>
            Consultar por WhatsApp
          </Link>
        </nav>

        <Link to="/admin" className="admin-link" aria-label="Panel de administrador">
          <Lock size={16} />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
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
            <nav className="mobile-nav-links">
              <NavLink to="/" className={getNavLinkClassName} onClick={closeMenu}>
                Inicio
              </NavLink>
              <NavLink to="/servicios" className={getNavLinkClassName} onClick={closeMenu}>
                Servicios
              </NavLink>
              <NavLink to="/consulta" className={getNavLinkClassName} onClick={closeMenu}>
                Consulta
              </NavLink>
              <NavLink to="/contacto" className={getNavLinkClassName} onClick={closeMenu}>
                Contacto
              </NavLink>
              <Link to="/consulta" className="nav-cta" onClick={closeMenu}>
                Consultar por WhatsApp
              </Link>
              <Link to="/admin" className="admin-link-mobile" onClick={closeMenu}>
                <Lock size={16} /> Panel de Administracion
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
