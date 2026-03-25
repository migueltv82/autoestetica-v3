import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

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
    </header>
  );
}

export default Navbar;