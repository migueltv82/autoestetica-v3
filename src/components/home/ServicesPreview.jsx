import { Link } from "react-router-dom";
import { Sparkles, Droplets, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function ServicesPreview() {
  return (
    <section className="section services-preview">
      <div className="container">
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-kicker">Servicios</span>
          <h2 className="section-title">Soluciones pensadas para cada detalle</h2>
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
            <motion.article className="service-preview-card" key={service.title} variants={cardVariants}>
              <div className="service-preview-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="services-preview-actions"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link to="/servicios" className="btn-primary">
            Ver todos los servicios
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesPreview;