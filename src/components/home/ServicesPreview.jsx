import { Link } from "react-router-dom";
import { Sparkles, Droplets, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import "./ServicesPreview.css";

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

// Variants for staggered section content
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function ServicesPreview() {
  return (
    <section className="section services-preview">
      <div className="services-glow services-glow-left"></div>
      <div className="services-glow services-glow-right"></div>

      <motion.div
        className="container relative-z"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="section-heading" variants={headerVariants}>
          <span className="section-kicker">Servicios</span>
          <h2 className="section-title">
            Soluciones pensadas para <span className="text-gradient">cada detalle</span>
          </h2>
          <p className="section-text">
            Trabajamos cada vehículo con criterio estético, atención personalizada
            y un enfoque práctico para que el resultado se note de verdad.
          </p>
        </motion.div>

        <div className="services-preview-grid">
          {featuredServices.map((service) => (
            <motion.article
              className="service-preview-card glass-panel"
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="card-top-accent"></div>
              <div className="service-preview-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </motion.article>
          ))}
        </div>

        <motion.div className="services-preview-actions" variants={headerVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/servicios" className="btn-primary">
              Ver todos los servicios
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ServicesPreview;