import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowUpRight, ImageOff, Sparkles } from "lucide-react";
import Modal from "../ui/Modal";
import Carousel from "../ui/Carousel";
import { useServices } from "../../hooks/useServices";
import { getIcon } from "../../utils/iconMapper";
import "./ServicesGrid.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.165, 0.84, 0.44, 1] } },
};

const formatMoney = (val) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(val);

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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-kicker">
              <Sparkles size={14} style={{ display: "inline", marginBottom: "-2px", marginRight: "6px" }} />
              Nuestros Servicios
            </span>
            <h1 className="section-title">Estética Vehicular de Vanguardia</h1>
            <p className="section-text">
              Descubrí nuestro catálogo de tratamientos premium. Cada servicio está diseñado 
              para llevar tu vehículo al siguiente nivel de perfección.{" "}
              <strong>Haz clic en cualquier tarjeta para ver resultados reales.</strong>
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
            const d = service.display || {};
            const galleryEnabled = d.gallery !== false;

            return (
              <motion.article
                key={service.id}
                className="premium-service-card"
                variants={cardVariants}
                onClick={() => openGallery(service)}
                style={{ cursor: galleryEnabled ? "pointer" : "default" }}
              >
                {/* Icon */}
                <div className="card-icon-wrapper">
                  {getIcon(service.iconName, { size: 32 })}
                </div>

                {/* Click action icon */}
                {galleryEnabled && (
                  <div className="card-action">
                    <span className="gallery-tooltip">Ver trabajos</span>
                    <ArrowUpRight size={22} />
                  </div>
                )}

                <div className="card-content">
                  {d.name !== false && <h3>{service.name}</h3>}
                  {d.description !== false && <p>{service.description}</p>}
                </div>

                {/* Footer: Duration + Price */}
                {(d.duration !== false || d.price !== false) && (
                  <div className="card-footer">
                    <div className="card-meta">
                      {d.duration !== false && (
                        <div className="meta-item">
                          <Clock size={16} className="meta-icon" />
                          <span>{service.duration}</span>
                        </div>
                      )}
                    </div>
                    {d.price !== false && (
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

      {/* Gallery Modal */}
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
                <p>Todavía no hay fotos de este servicio.</p>
                <span>Las imágenes del antes y después se mostrarán aquí pronto.</span>
              </div>
            )}
            <div className="gallery-info-text">
              <h4>Compromiso con la Calidad Premium</h4>
              <p>
                Estas fotografías muestran resultados reales logrados en nuestro taller.
                Empleamos técnicas líderes en detailing, protecciones cerámicas de clase 
                mundial y un cuidado meticuloso al detalle para asegurar un brillo inigualable.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default ServicesGrid;