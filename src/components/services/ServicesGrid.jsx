import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Eye, ImageOff } from "lucide-react";
import businessLogo from "../../assets/logo.jpg";
import Modal from "../ui/Modal";
import Carousel from "../ui/Carousel";
import { useServices } from "../../hooks/useServices";
import { getIcon } from "../../utils/iconMapper";
import "./ServicesGrid.css";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
};

const formatMoney = (val) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(val);

function ServicesGrid() {
  const { services } = useServices();
  const [selectedService, setSelectedService] = useState(null);

  const openGallery = (service) => {
    // Open whenever gallery display is enabled (show placeholder if empty)
    if (service.display?.gallery !== false) {
      setSelectedService(service);
    }
  };

  const closeGallery = () => setSelectedService(null);

  return (
    <section className="services-section">
      <div className="services-watermark">
        <img src={businessLogo} alt="Autoestética Logo Watermark" />
      </div>

      <div className="container relative-content">
        <div className="section-heading">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-kicker">Nuestros Servicios</span>
            <h1 className="section-title">Estética Vehicular de Vanguardia</h1>
            <p className="section-text">
              Cada servicio se coordina de manera personalizada para asegurar una
              atención más precisa y un resultado de concurso.{" "}
              <strong>Hacé clic en cualquier tarjeta para ver resultados reales.</strong>
            </p>
          </motion.div>
        </div>

        <motion.div
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {services.map((service) => {
            const d = service.display || {};
            // Card is clickable if gallery display is on
            const galleryEnabled = d.gallery !== false;

            return (
              <motion.article
                key={service.id}
              className="vanguard-service-card"
                variants={cardVariants}
                whileHover={{ y: -10, transition: { duration: 0.28 } }}
                onClick={() => openGallery(service)}
                style={{ cursor: galleryEnabled ? "pointer" : "default" }}
              >
                {/* Icon */}
                <div className="vanguard-card-icon">
                  {getIcon(service.iconName, { size: 28 })}
                </div>

                {/* Gallery hint — shown when gallery is enabled */}
                {galleryEnabled && (
                  <div className="card-click-label">
                    <Eye size={12} /> VER TRABAJOS
                  </div>
                )}

                {/* Name */}
                {d.name !== false && (
                  <h3 className="vanguard-card-title">{service.name}</h3>
                )}

                {/* Description */}
                {d.description !== false && (
                  <p className="vanguard-card-desc">{service.description}</p>
                )}

                {/* Footer: Duration + Price */}
                {(d.duration !== false || d.price !== false) && (
                  <div className="vanguard-card-footer">
                    {d.duration !== false && (
                      <div className="vanguard-duration">
                        <Clock size={15} className="text-secondary" />
                        <span className="vanguard-card-duration">{service.duration}</span>
                      </div>
                    )}
                    {d.price !== false && (
                      <div className="vanguard-price">
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
                <ImageOff size={48} />
                <p>Todavía no hay fotos en este servicio.</p>
                <span>Podés agregar imágenes desde el panel de administración.</span>
              </div>
            )}
            <div className="gallery-info-text">
              <h4>Compromiso con la Calidad</h4>
              <p>Estos resultados son ejemplos reales de nuestros procesos de Detailing. Cada vehículo recibe un tratamiento único según su estado y necesidades.</p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default ServicesGrid;