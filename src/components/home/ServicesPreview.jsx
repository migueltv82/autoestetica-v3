import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useServices } from "../../hooks/useServices";
import { getIcon } from "../../utils/iconMapper";
import "./ServicesPreview.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function ServicesPreview() {
  const { featuredServices, services } = useServices();
  // Show up to 3: prefer featured, fall back to first 3 if no featured
  const display = featuredServices.length > 0
    ? featuredServices.slice(0, 3)
    : services.slice(0, 3);

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
          <span className="section-kicker">Lo que hacemos</span>
          <h2 className="section-title">Servicios diseñados<br />para la excelencia</h2>
          <p className="section-text">
            Cada servicio es un estándar en sí mismo. Trabajamos con técnicas
            profesionales y productos de primer nivel para que el resultado supere tus expectativas.
          </p>
        </motion.div>

        <motion.div
          className="services-preview-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {display.map((service) => {
            const d = service.display || {};
            return (
              <motion.article className="service-preview-card" key={service.id} variants={cardVariants}>
                <div className="service-preview-icon">
                  {getIcon(service.iconName, { size: 26 })}
                </div>
                {d.name !== false && <h3>{service.name}</h3>}
                {d.description !== false && <p>{service.description}</p>}
              </motion.article>
            );
          })}
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