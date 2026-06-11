import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Zap } from "lucide-react";
import Modal from "../ui/Modal";
import Carousel from "../ui/Carousel";
import { useServices } from "../../hooks/useServices";
import { getServiceCoverUrl, getServicePreviewGallery } from "../../utils/serviceMedia";
import "./ServicesGrid.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(value);

const FADE_UP = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

function ServicesGrid() {
  const { services } = useServices();
  const [selectedService, setSelectedService] = useState(null);

  const orderedServices = useMemo(() => {
    if (!Array.isArray(services)) return [];
    return [...services].sort((a, b) => Number(Boolean(b?.featured)) - Number(Boolean(a?.featured)));
  }, [services]);

  return (
    <div className="services-catalog-modern">
      <header className="catalog-header">
        <div className="container">
          <motion.span className="catalog-kicker" {...FADE_UP}>Portfolio de Excelencia</motion.span>
          <motion.h1 {...FADE_UP} transition={{ delay: 0.1 }}>Servicios Signature</motion.h1>
          <motion.p {...FADE_UP} transition={{ delay: 0.2 }}>
            Cada tratamiento es una obra de ingeniería estética dedicada a preservar y realzar el valor de su vehículo.
          </motion.p>
        </div>
      </header>

      <section className="container catalog-grid">
        {orderedServices.map((service, idx) => (
          <motion.div 
            key={service.id} 
            {...FADE_UP} 
            transition={{ delay: idx * 0.1 }}
            className={`service-card-modern ${service.featured ? 'featured' : ''}`}
          >
            <div className="card-media">
              <img src={getServiceCoverUrl(service)} alt={service.name} />
              {service.featured && (
                <div className="featured-badge">
                  <Zap size={12} /> Destacado
                </div>
              )}
              <div className="card-overlay">
                <button className="btn-view-gallery" onClick={() => setSelectedService(service)}>
                  Ver Resultados
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <div className="card-meta">
                <span className="category">{service.category || "Detailing"}</span>
                <span className="duration"><Clock size={12} /> {service.duration}</span>
              </div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              
              <div className="card-footer">
                <div className="price-label">Desde</div>
                <div className="price-value">{formatMoney(service.price)}</div>
                <button 
                  className="btn-info-link" 
                   onClick={() => setSelectedService(service)}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <Modal
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name || "Detalles del Servicio"}
        maxWidth="1000px"
      >
        {selectedService && (
          <div className="gallery-modal-premium">
            <Carousel images={getServicePreviewGallery(selectedService)} />
            <div className="gallery-modal-info">
              <h3>El Estándar Autoestética</h3>
              <p>Muestras de trabajos reales realizados bajo protocolos de estricta calidad. El resultado final puede variar según el estado base del vehículo.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ServicesGrid;
