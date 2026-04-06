import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow"></div>
      <div className="container footer-shell relative-z">
        <motion.div 
          className="footer-brand"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="footer-logo">
            <span className="brand-mark-footer"></span>
            <h3>Autoestética Tucumán</h3>
          </div>
          <p>
            Atención personalizada para el cuidado estético de tu vehículo.
            Consultas y turnos coordinados de forma exclusiva por WhatsApp.
          </p>
        </motion.div>

        <div className="footer-info">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="footer-label">Horario de atención</span>
            <p>Lunes a viernes de 9:30 a 16:30 hs</p>
            <p className="text-muted">Con turno previo</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="footer-label">Contacto</span>
            <p>
              <a href="#" className="footer-link">WhatsApp: +54 9 381 5448147</a>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="footer-label">Navegación</span>
            <ul className="footer-nav">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li><Link to="/consulta">Consulta</Link></li>
            </ul>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Autoestética Tucumán. Todos los derechos reservados.</p>
        </div>
      </motion.div>
    </footer>
  );
}

export default Footer;