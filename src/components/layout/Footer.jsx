import { MapPin, Phone, Clock, Mail } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow"></div>
      <div className="container footer-shell">
        <div className="footer-brand">
          <div className="brand">
            <div className="brand-mark"></div>
            <span className="brand-text">Autoestética Tucumán</span>
          </div>
          <p className="footer-description">
            Elevando el estándar en cuidado estético automotriz. Atención premium 
            y resultados garantizados para los más exigentes.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="social-link" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4 className="footer-heading">Enlaces Rápidos</h4>
          <ul>
            <li><a href="#hero">Inicio</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4 className="footer-heading">Contacto & Horarios</h4>
          <ul className="contact-list">
            <li>
              <Phone size={18} className="contact-icon" />
              <span>+54 9 381 5448147</span>
            </li>
            <li>
              <Mail size={18} className="contact-icon" />
              <span>contacto@autoesteticatucuman.com</span>
            </li>
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>San Miguel de Tucumán</span>
            </li>
            <li>
              <Clock size={18} className="contact-icon" />
              <span>Lun a Vie: 9:30 - 16:30 hs</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; {new Date().getFullYear()} Autoestética Tucumán. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;