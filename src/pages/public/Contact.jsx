import { motion } from "framer-motion";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import { useSettings } from "../../hooks/useSettings";
import "./Contact.css";

const FADE_UP = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

function Contact() {
  const { settings, getWaLink } = useSettings();

  return (
    <PageTransition>
      <PublicLayout>
        <div className="contact-premium">
          <section className="container contact-hero">
            <motion.h1 {...FADE_UP}>Contacto</motion.h1>
            <motion.p {...FADE_UP} transition={{ delay: 0.1 }}>
              Estamos disponibles para asesorarte sobre el tratamiento adecuado para tu vehículo.
              Respuesta directa y técnica.
            </motion.p>
          </section>

          <section className="container contact-grid-premium">
            <motion.div {...FADE_UP} className="contact-main-card">
              <MessageCircle size={34} strokeWidth={1.25} />
              <h2>WhatsApp directo</h2>
              <p>Consultas, presupuestos y turnos coordinados con atención personalizada.</p>
              <a
                href={getWaLink()}
                target="_blank"
                rel="noreferrer"
                className="btn-primary-premium"
              >
                Escribir ahora <ArrowRight size={18} />
              </a>
            </motion.div>

            <motion.div {...FADE_UP} transition={{ delay: 0.1 }} className="contact-details-grid">
              <div className="detail-item">
                <span className="label"><Clock size={14} /> Atención</span>
                <p>{settings.openingHours}</p>
                <p className="sub">Días hábiles</p>
              </div>
              <div className="detail-item">
                <span className="label"><MapPin size={14} /> Ubicación</span>
                <p>{settings.address}</p>
                <p className="sub">Taller especializado</p>
              </div>
              <div className="detail-item">
                <span className="label"><Mail size={14} /> Email</span>
                <p>{settings.email}</p>
              </div>
            </motion.div>
          </section>
        </div>
      </PublicLayout>
    </PageTransition>
  );
}

export default Contact;
