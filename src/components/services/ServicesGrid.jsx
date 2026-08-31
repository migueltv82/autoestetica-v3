import { useMemo } from "react";
import { motion } from "framer-motion";
import { useServices } from "../../hooks/useServices";
import { useSettings } from "../../hooks/useSettings";
import ServiceSalesCard from "./ServiceSalesCard";
import "./ServicesGrid.css";

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-50px" }, transition: { duration: .55, ease: [0.16, 1, .3, 1] } };

<<<<<<< HEAD
function ServicesGrid() {
  const [selectedService, setSelectedService] = useState(null);

  const openGallery = (service) => {
    setSelectedService(service);
  };

  const closeGallery = () => {
    setSelectedService(null);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <span className="section-kicker">Catálogo</span>
          <h1 className="section-title">Servicios disponibles</h1>
          <p className="section-text">
            Cada servicio se coordina de manera personalizada para asegurar una
            atención más precisa y un mejor resultado final.
          </p>
        </div>

        <motion.div className="services-grid">
          {servicesList.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-card-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="service-card-duration">{service.duration}</span>
            </article>
          ))}
        </motion.div>
      </div>

      <Modal
        isOpen={!!selectedService}
        onClose={closeGallery}
        title={selectedService?.title}
        maxWidth="900px"
      >
        {selectedService && (
          <div className="gallery-modal-content">
            <Carousel images={selectedService.gallery} />
            <div className="gallery-info-text">
              <h4>Compromiso con la Calidad</h4>
              <p>Estos resultados son ejemplos reales de nuestros procesos de Detailing. Cada vehículo recibe un tratamiento único según su estado y necesidades.</p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
=======
export default function ServicesGrid() {
  const { services } = useServices();
  const { settings } = useSettings();
  const orderedServices = useMemo(() => [...(services || [])].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))), [services]);
  return <div className="services-catalog-modern"><header className="catalog-header"><div className="container"><motion.span className="catalog-kicker" {...FADE_UP}>Servicios</motion.span><motion.h1 {...FADE_UP}>Tratamientos profesionales</motion.h1><motion.p {...FADE_UP}>Soluciones pensadas para proteger, realzar y mantener cada detalle de tu vehículo.</motion.p></div></header><section className="container catalog-grid">{orderedServices.map((service, index) => <motion.div key={service.id} {...FADE_UP} transition={{ delay: index * .05 }}><ServiceSalesCard service={service} whatsappNumber={settings.whatsapp} /></motion.div>)}</section></div>;
>>>>>>> bfa79ac58071127e00bb2a4e0e7401427bd71dba
}
