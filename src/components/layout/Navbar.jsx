import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to conditionally blur and darken navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  function closeMenu() {
    setMenuOpen(false);
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
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container navbar-shell">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="brand-mark"></span>
            <span className="brand-text">Autoestética Tucumán</span>
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <motion.nav 
          className="nav-links desktop-nav"
          variants={navLinksVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <NavLink to="/" onClick={closeMenu}>Inicio</NavLink>
          </motion.div>

          <motion.div variants={itemVariants}>
            <NavLink to="/servicios" onClick={closeMenu}>Servicios</NavLink>
          </motion.div>

          <motion.div variants={itemVariants}>
            <NavLink to="/consulta" onClick={closeMenu}>Consulta</NavLink>
          </motion.div>

          <motion.div variants={itemVariants}>
            <NavLink to="/contacto" onClick={closeMenu}>Contacto</NavLink>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/consulta" className="nav-cta" onClick={closeMenu}>
                Consultar por WhatsApp
              </Link>
            </motion.div>
          </motion.div>
        </motion.nav>

        {/* Mobile Toggle */}
        <motion.button 
          className="menu-toggle" 
          onClick={toggleMenu} 
          aria-label="Abrir menú"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="wait">
            {menuOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={26} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Menu size={26} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav 
              className="nav-links mobile-nav glass-panel"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <NavLink to="/" onClick={closeMenu}>Inicio</NavLink>
              <NavLink to="/servicios" onClick={closeMenu}>Servicios</NavLink>
              <NavLink to="/consulta" onClick={closeMenu}>Consulta</NavLink>
              <NavLink to="/contacto" onClick={closeMenu}>Contacto</NavLink>
              <Link to="/consulta" className="nav-cta" onClick={closeMenu}>
                Consultar por WhatsApp
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Navbar;