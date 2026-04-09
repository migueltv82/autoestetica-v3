import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div className="footer-brand">
          <h3>Autoestética Tucumán</h3>
          <p>
            Atención personalizada para el cuidado estético de tu vehículo.
            Consultas y turnos coordinados por WhatsApp.
          </p>
        </div>

        <div className="footer-info">
          <div>
            <span className="footer-label">Horario</span>
            <p>Lunes a viernes de 9:30 a 16:30</p>
          </div>

          <div>
            <span className="footer-label">Contacto</span>
            <p>WhatsApp: +54 9 381 5448147</p>
          </div>
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