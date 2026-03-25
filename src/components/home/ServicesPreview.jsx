import { Link } from "react-router-dom";
import { Sparkles, Droplets, ShieldCheck } from "lucide-react";
import "./ServicesPreview.css";

const featuredServices = [
  {
    icon: <Sparkles size={26} />,
    title: "Lavado premium",
    text: "Una limpieza exterior cuidada, con terminación prolija y presencia visual.",
  },
  {
    icon: <Droplets size={26} />,
    title: "Limpieza de interior",
    text: "Trabajo detallado para renovar la imagen interior y mejorar la experiencia del vehículo.",
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Pulido y abrillantado",
    text: "Tratamientos estéticos para recuperar brillo, profundidad y mejor terminación.",
  },
];

function ServicesPreview() {
  return (
    <section className="section services-preview">
      <div className="container">
        <div className="section-heading">
          <span className="section-kicker">Servicios</span>
          <h2 className="section-title">Soluciones pensadas para cada detalle</h2>
          <p className="section-text">
            Trabajamos cada vehículo con criterio estético, atención personalizada
            y un enfoque práctico para que el resultado se note de verdad.
          </p>
        </div>

        <div className="services-preview-grid">
          {featuredServices.map((service) => (
            <article className="service-preview-card" key={service.title}>
              <div className="service-preview-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>

        <div className="services-preview-actions">
          <Link to="/servicios" className="btn-primary">
            Ver todos los servicios
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ServicesPreview;