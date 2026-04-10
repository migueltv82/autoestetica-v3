import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { useServices } from "../../hooks/useServices";
import { getIcon } from "../../utils/iconMapper";
import "./ServicesPreview.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(value);

function ServicesPreview() {
  const { featuredServices, services } = useServices();
  const displayServices = featuredServices.length > 0
    ? featuredServices.slice(0, 3)
    : services.slice(0, 3);

  if (displayServices.length === 0) {
    return null;
  }

  return (
    <section id="services-preview" className="section services-preview">
      <div className="container">
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55 }}
        >
          <span className="section-kicker">Servicios</span>
          <h2 className="section-title">Tratamientos pensados para cuidar la imagen de tu vehículo</h2>
          <p className="section-text">
            Cada servicio combina técnica, criterio estético y una ejecución prolija.
            Elegimos procesos claros y resultados visibles, sin exageraciones.
          </p>
        </motion.div>

        <motion.div
          className="services-preview-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {displayServices.map((service) => (
            <motion.article className="service-preview-card" key={service.id} variants={cardVariants}>
              <div className="service-preview-icon">
                {getIcon(service.iconName, { size: 24 })}
              </div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-preview-footer">
                <span className="service-preview-duration">
                  <Clock3 size={14} />
                  {service.duration}
                </span>
                <strong>{formatMoney(service.price)}</strong>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="services-preview-actions">
          <Link to="/servicios" className="btn-secondary">
            Ver todos los servicios
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ServicesPreview;
