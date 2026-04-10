import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import "./Contact.css";

const WHATSAPP_NUMBER = "5493815448147";

function Contact() {
  return (
    <PageTransition>
      <PublicLayout>
        <section className="section contact-page">
          <div className="container contact-shell">
            <div className="contact-intro">
              <span className="section-kicker">Contacto</span>
              <h1 className="section-title">Una atención clara, directa y bien cuidada.</h1>
              <p className="section-text">
                Si querés consultar, coordinar o entender qué servicio conviene más,
                podés escribirnos directamente. Mantenemos una comunicación simple,
                cercana y ordenada.
              </p>

              <div className="contact-actions">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  className="btn-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Escribir por WhatsApp
                  <ArrowUpRight size={16} />
                </a>
                <Link to="/consulta" className="btn-secondary">
                  Enviar una consulta
                </Link>
              </div>
            </div>

            <div className="contact-grid">
              <article className="contact-card">
                <MessageCircle size={20} />
                <strong>WhatsApp</strong>
                <p>+54 9 381 5448147</p>
                <span>Canal principal para consultas, seguimiento y coordinación.</span>
              </article>

              <article className="contact-card">
                <Clock3 size={20} />
                <strong>Horario de atención</strong>
                <p>Lunes a viernes de 9:30 a 16:30</p>
                <span>Respondemos dentro del horario comercial con atención personalizada.</span>
              </article>

              <article className="contact-card">
                <ShieldCheck size={20} />
                <strong>Forma de trabajo</strong>
                <p>Coordinación a medida</p>
                <span>Cada vehículo se evalúa según necesidad, alcance y objetivo del servicio.</span>
              </article>
            </div>
          </div>
        </section>
      </PublicLayout>
    </PageTransition>
  );
}

export default Contact;
