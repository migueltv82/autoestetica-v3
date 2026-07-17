import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck2, Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import { useSettings } from "../../hooks/useSettings";
import "./Contact.css";

const FADE_UP = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-50px" }, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } };

function Contact() {
  const { settings } = useSettings();
  const whatsappNumber = String(settings.whatsapp || "5493815448147").replace(/\D/g, "");
  const whatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, quiero consultar por un servicio de detailing para mi vehículo.")}`;
  const phone = settings.phone || settings.whatsapp;

  return <PageTransition><PublicLayout><div className="contact-page">
    <section className="contact-hero"><div className="container contact-hero-grid">
      <div><motion.span className="contact-kicker" {...FADE_UP}>Hablemos de tu vehículo</motion.span><motion.h1 {...FADE_UP} transition={{ delay: .08 }}>Una consulta clara. Una recomendación honesta.</motion.h1><motion.p {...FADE_UP} transition={{ delay: .16 }}>Contanos qué necesitás y evaluamos qué tratamiento tiene sentido según el estado, el uso y el resultado que buscás.</motion.p><motion.div className="contact-actions" {...FADE_UP} transition={{ delay: .22 }}><a href={whatsapp} target="_blank" rel="noreferrer" className="contact-wa"><MessageCircle size={19} /> Escribir por WhatsApp</a><Link to="/consulta" className="contact-form-link">Completar consulta <ArrowRight size={17} /></Link></motion.div><motion.div className="contact-trust" {...FADE_UP} transition={{ delay: .28 }}><span><ShieldCheck size={16} /> Evaluación personalizada</span><span><CalendarCheck2 size={16} /> Turnos coordinados</span></motion.div></div>
      <motion.aside className="contact-direct-card" {...FADE_UP} transition={{ delay: .18 }}><div className="contact-direct-icon"><MessageCircle size={27} /></div><span>Canal recomendado</span><h2>WhatsApp directo</h2><p>La forma más rápida de enviarnos fotos, conocer disponibilidad y pedir un presupuesto inicial.</p><a href={whatsapp} target="_blank" rel="noreferrer">Iniciar conversación <ArrowRight size={17} /></a><small>Respondemos dentro de nuestro horario de atención.</small></motion.aside>
    </div></section>
    <section className="container contact-information" aria-labelledby="contact-information-title"><div className="contact-section-heading"><span className="contact-kicker">Información útil</span><h2 id="contact-information-title">Antes de visitarnos</h2></div><div className="contact-info-grid">
      {settings.openingHours ? <article><Clock3 size={21} /><div><span>Horarios</span><strong>{settings.openingHours}</strong><p>Coordinamos cada ingreso con turno previo.</p></div></article> : null}
      {settings.address ? <article><MapPin size={21} /><div><span>Ubicación</span><strong>{settings.address}</strong><p>Taller de detailing con atención programada.</p></div></article> : null}
      {phone ? <article><Phone size={21} /><div><span>Teléfono</span><strong>{phone}</strong><a href={`tel:${String(phone).replace(/[^\d+]/g, "")}`}>Llamar ahora</a></div></article> : null}
      {settings.email ? <article><Mail size={21} /><div><span>Email</span><strong>{settings.email}</strong><a href={`mailto:${settings.email}`}>Enviar email</a></div></article> : null}
    </div></section>
    <section className="contact-bottom-cta"><div className="container"><div><span>¿Querés darnos más detalles?</span><h2>Elegí el vehículo y los servicios que te interesan.</h2></div><Link to="/consulta">Preparar mi consulta <ArrowRight size={18} /></Link></div></section>
  </div></PublicLayout></PageTransition>;
}
export default Contact;
