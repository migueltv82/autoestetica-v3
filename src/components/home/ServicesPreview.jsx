import { Link } from "react-router-dom";
import { Sparkles, Droplets, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const featuredServices = [
  {
    icon: <Sparkles size={28} strokeWidth={1.5} />,
    title: "Lavado premium",
    text: "Una limpieza exterior cuidada, con terminación prolija y presencia visual.",
  },
  {
    icon: <Droplets size={28} strokeWidth={1.5} />,
    title: "Limpieza de interior",
    text: "Trabajo detallado para renovar la imagen interior y mejorar la experiencia del vehículo.",
  },
  {
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
    title: "Pulido y abrillantado",
    text: "Tratamientos estéticos para recuperar brillo, profundidad y mejor terminación.",
  },
];

function ServicesPreview() {
  return (
    <section className="section services-preview">
      <div className="container">
        <motion.div className="section-heading">
          <span className="section-kicker">Servicios</span>
          <h2 className="section-title">
            Soluciones pensadas para <span className="text-gradient">cada detalle</span>
          </h2>
          <p className="section-text">
            Trabajamos cada vehículo con criterio estético, atención personalizada
            y un enfoque práctico para que el resultado se note de verdad.
          </p>
        </motion.div>

        <motion.div
          className="services-preview-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {featuredServices.map((service) => (
            <motion.article className="service-preview-card" key={service.title}>
              <div className="service-preview-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </motion.article>
          ))}
        </motion.div>

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