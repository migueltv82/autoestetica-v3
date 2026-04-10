import { useState } from "react";
import { motion } from "framer-motion";
import { Clock3, ArrowUpRight, ImageOff, Sparkles } from "lucide-react";
import Modal from "../ui/Modal";
import Carousel from "../ui/Carousel";
import { useServices } from "../../hooks/useServices";
import { getIcon } from "../../utils/iconMapper";
import "./ServicesGrid.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
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

function ServicesGrid() {
  const { services } = useServices();
  const [selectedService, setSelectedService] = useState(null);

  const openGallery = (service) => {
    if (service.display?.gallery !== false) {
      setSelectedService(service);
    }
  };

  const closeGallery = () => setSelectedService(null);

  return (
    <section className="services-section">
      <div className="relative-content container">
        <div className="section-header-wrapper">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-kicker">
              <Sparkles size={14} />
              Servicios
            </span>
            <h1 className="section-title">Una propuesta sobria, moderna y enfocada en resultados</h1>
            <p className="section-text">
              Cada tratamiento está pensado para mejorar la presencia del vehículo con
              un trabajo prolijo, materiales adecuados y una ejecución cuidada de punta a punta.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services.map((service) => {
            const display = service.display || {};
            const galleryEnabled = display.gallery !== false;

            return (
              <motion.article
                key={service.id}
                className="premium-service-card"
                variants={cardVariants}
                onClick={() => openGallery(service)}
                style={{ cursor: galleryEnabled ? "pointer" : "default" }}
              >
                <div className="card-header">
                  <div className="card-icon-wrapper">
                    {getIcon(service.iconName, { size: 28 })}
                  </div>
                  {galleryEnabled && (
                    <div className="card-action" aria-hidden="true">
                      <span className="gallery-tooltip">Ver trabajos</span>
                      <ArrowUpRight size={18} />
                    </div>
                  )}
                </div>

                <div className="card-content">
                  {display.name !== false && <h3>{service.name}</h3>}
                  {display.description !== false && <p>{service.description}</p>}
                </div>

                {(display.duration !== false || display.price !== false) && (
                  <div className="card-footer">
                    <div className="card-meta">
                      {display.duration !== false && (
                        <div className="meta-item">
                          <Clock3 size={14} className="meta-icon" />
                          <span>{service.duration}</span>
                        </div>
                      )}
                    </div>
                    {display.price !== false && (
                      <div className="card-price">
                        {formatMoney(service.price)}
                      </div>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      <Modal
        isOpen={!!selectedService}
        onClose={closeGallery}
        title={selectedService?.display?.name !== false ? selectedService?.name : "Galería de trabajos"}
        maxWidth="900px"
      >
        {selectedService && (
          <div className="gallery-modal-content">
            {selectedService.gallery?.length > 0 ? (
              <Carousel images={selectedService.gallery} />
            ) : (
              <div className="gallery-empty-state">
                <ImageOff size={56} strokeWidth={1} />
                <p>Todavía no hay fotos disponibles para este servicio.</p>
                <span>La galería se irá actualizando con trabajos reales del taller.</span>
              </div>
            )}
            <div className="gallery-info-text">
              <h4>Resultados reales, criterio consistente</h4>
              <p>
                Mostramos trabajos realizados en nuestro taller para que puedas ver el nivel
                de terminación, prolijidad y cuidado aplicado en cada servicio.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default ServicesGrid;
