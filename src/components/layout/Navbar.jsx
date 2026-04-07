import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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

  const navLinksVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  return (
    <header className="site-header">
      <div className="container navbar-shell">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark"></span>
          <span className="brand-text">Autoestética Tucumán</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>
            Inicio
          </NavLink>

          <NavLink to="/servicios" onClick={closeMenu}>
            Servicios
          </NavLink>

          <NavLink to="/consulta" onClick={closeMenu}>
            Consulta
          </NavLink>

          <NavLink to="/contacto" onClick={closeMenu}>
            Contacto
          </NavLink>

          <Link to="/consulta" className="nav-cta" onClick={closeMenu}>
            Consultar por WhatsApp
          </Link>
        </nav>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Abrir menú">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
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