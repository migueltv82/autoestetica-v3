import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import { InstagramIcon, FacebookIcon, TikTokIcon, WhatsAppIcon } from "../ui/SocialIcons";
import "./Footer.css";

function Footer() {
  const { settings, getWaLink } = useSettings();

  const socialLinks = [
    { key: "instagram", href: settings.instagram, Icon: InstagramIcon, label: "Instagram" },
    { key: "facebook", href: settings.facebook, Icon: FacebookIcon, label: "Facebook" },
    { key: "tiktok", href: settings.tiktok, Icon: TikTokIcon, label: "TikTok" },
  ].filter((s) => s.href);

  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-brand-mark" />
            <h3>{settings.businessName}</h3>
            <p className="footer-tagline">Estética automotriz premium.</p>

            {socialLinks.length > 0 && (
              <div className="footer-social-links">
                {socialLinks.map(({ key, href, Icon, label }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="footer-social-btn"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav className="footer-nav" aria-label="Links del sitio">
            <span className="footer-nav-title">Explorar</span>
            <Link to="/">Inicio</Link>
            <Link to="/servicios">Servicios</Link>
            <Link to="/galeria">Galería</Link>
            <Link to="/contacto">Contacto</Link>
          </nav>

          <div className="footer-info">
            <span className="footer-nav-title">Contacto</span>
            <a href={getWaLink()} target="_blank" rel="noopener noreferrer" className="footer-wa-btn">
              <WhatsAppIcon size={16} />
              <span>{settings.whatsapp}</span>
            </a>
            <p className="footer-detail">
              <Clock size={13} /> {settings.openingHours}
            </p>
            <p className="footer-detail">
              <MapPin size={13} /> {settings.address}
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {settings.businessName} Tucumán. Todos los derechos reservados.</p>
          <div className="footer-legal">
            <span>Privacidad</span>
            <span>Términos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
