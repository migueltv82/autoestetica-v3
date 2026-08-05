import { Link } from "react-router-dom";
import { Clock, Mail, MapPin } from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import { normalizeArgentinaPhone } from "../../utils/whatsapp";
import { InstagramIcon, FacebookIcon, TikTokIcon, WhatsAppIcon } from "../ui/SocialIcons";
import defaultLogo from "../../assets/logo.webp";
import "./Footer.css";

function Footer() {
  const { settings, getWaLink } = useSettings();
  const phoneWhatsAppLink = settings.phone
    ? `https://wa.me/${normalizeArgentinaPhone(settings.phone)}?text=${encodeURIComponent(`Hola, quiero hacer una consulta a ${settings.businessName || "Autoestética Tucumán"}.`)}`
    : "";

  const normalizeUrl = (value, baseUrl) => {
    const clean = String(value || "").trim();
    if (!clean) return "";
    if (/^https?:\/\//i.test(clean)) return clean;
    return `${baseUrl}${clean.replace(/^@/, "").replace(/^\//, "")}`;
  };
  const socialLinks = [
    { key: "instagram", href: normalizeUrl(settings.instagram, "https://instagram.com/"), Icon: InstagramIcon, label: "Instagram" },
    { key: "facebook", href: normalizeUrl(settings.facebook, "https://facebook.com/"), Icon: FacebookIcon, label: "Facebook" },
    { key: "tiktok", href: normalizeUrl(settings.tiktok, "https://tiktok.com/@"), Icon: TikTokIcon, label: "TikTok" },
  ].filter((s) => s.href);

  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-identity">
              <img src={settings.logoUrl || defaultLogo} alt={`Logo de ${settings.businessName || "Autoestética Tucumán"}`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = defaultLogo; }} />
              <h3>{settings.businessName || "Autoestética Tucumán"}</h3>
            </div>
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
                    className={`footer-social-btn footer-social-btn-${key}`}
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
            {settings.whatsapp ? <a href={getWaLink()} target="_blank" rel="noopener noreferrer" className="footer-wa-btn">
              <WhatsAppIcon size={16} />
              <span>{settings.whatsapp}</span>
            </a> : null}
            {settings.phone ? <a className="footer-detail footer-phone-whatsapp" href={phoneWhatsAppLink} target="_blank" rel="noopener noreferrer" aria-label={`Escribir por WhatsApp al ${settings.phone}`}><WhatsAppIcon size={13} /> {settings.phone}</a> : null}
            {settings.email ? <a className="footer-detail" href={`mailto:${settings.email}`}><Mail size={13} /> {settings.email}</a> : null}
            {settings.openingHours ? <p className="footer-detail">
              <Clock size={13} /> {settings.openingHours}
            </p> : null}
            {settings.address ? <p className="footer-detail">
              <MapPin size={13} /> {settings.address}
            </p> : null}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {settings.businessName || "Autoestética Tucumán"}. Todos los derechos reservados.</p>
          <div className="footer-legal">
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/terminos">Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
