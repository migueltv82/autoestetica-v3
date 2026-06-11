import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock3, Star } from "lucide-react";
import Modal from "../ui/Modal";
import Carousel from "../ui/Carousel";
import { useServices } from "../../hooks/useServices";
import { getIcon } from "../../utils/iconMapper";
import { getServiceCoverUrl, getServicePreviewGallery } from "../../utils/serviceMedia";
import "../../styles/serviceCards.css";
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

const DEFAULT_DISPLAY = {
  name: true,
  description: true,
  gallery: true,
  duration: true,
  price: true,
};

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(value);

function ServicesPreview() {
  const { featuredServices, services } = useServices();
  const [selectedService, setSelectedService] = useState(null);
  const displayServices = featuredServices.length > 0 ? featuredServices.slice(0, 4) : services.slice(0, 4);

  const openGallery = (service) => {
    const display = { ...DEFAULT_DISPLAY, ...(service.display || {}) };
    if (display.gallery !== false) {
      setSelectedService(service);
    }
  };

  const closeGallery = () => setSelectedService(null);

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
          role="list"
          aria-label="Servicios destacados"
        >
          {displayServices.map((service) => {
            const display = { ...DEFAULT_DISPLAY, ...(service.display || {}) };
            const galleryEnabled = display.gallery !== false;
            const coverUrl = getServiceCoverUrl(service);

            return (
              <motion.button
                key={service.id}
                type="button"
                className={`svc-poster ${galleryEnabled ? "is-clickable" : "is-static"}`}
                onClick={() => openGallery(service)}
                variants={cardVariants}
                whileHover={galleryEnabled ? { y: -6, scale: 1.02 } : undefined}
                whileTap={galleryEnabled ? { scale: 0.99 } : undefined}
                role="listitem"
                aria-label={service.name}
              >
                <div className="svc-poster-fallback" aria-hidden="true">
                  <div className="svc-poster-fallback-icon">{getIcon(service.iconName, { size: 26 })}</div>
                </div>

                {coverUrl ? (
                  <img src={coverUrl} alt="" className="svc-poster-img" loading="lazy" decoding="async" />
                ) : null}

                <div className="svc-poster-shade" aria-hidden="true" />

                <div className="svc-poster-body">
                  <div className="svc-poster-top">
                    {display.duration !== false ? (
                      <span className="svc-poster-chip svc-poster-chip-solid">
                        {getIcon(service.iconName, { size: 16 })}
                        <span>{service.duration}</span>
                      </span>
                    ) : null}

                    {service.featured ? (
                      <span className="svc-poster-chip svc-poster-chip-featured">
                        <Star size={14} />
                        Destacado
                      </span>
                    ) : null}
                  </div>

                  <div className="svc-poster-bottom">
                    {display.name !== false ? <h3 className="svc-poster-title">{service.name}</h3> : null}
                    {display.description !== false ? <p className="svc-poster-text">{service.description}</p> : null}

                    <div className="svc-poster-meta">
                      {display.duration !== false ? (
                        <span className="svc-poster-meta-item">
                          <Clock3 size={14} />
                          {service.duration}
                        </span>
                      ) : null}

                      {display.price !== false ? (
                        <span className="svc-poster-price">{formatMoney(service.price)}</span>
                      ) : (
                        <span className="svc-poster-price muted">Consultar</span>
                      )}

                      {galleryEnabled ? (
                        <span className="svc-poster-cta" aria-hidden="true">
                          Ver trabajos <ArrowUpRight size={14} />
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <div className="services-preview-actions">
          <Link to="/servicios" className="btn-secondary">
            Ver todos los servicios
          </Link>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedService)}
        onClose={closeGallery}
        title={selectedService?.display?.name !== false ? selectedService?.name : "Galeria de trabajos"}
        maxWidth="900px"
      >
        {selectedService ? (
          <div className="gallery-modal-content">
            <Carousel images={getServicePreviewGallery(selectedService)} />
            {selectedService.gallery?.length ? null : (
              <div className="gallery-placeholder-note">
                Imagen de prueba. Carga fotos reales desde el panel para que se vean aca.
              </div>
            )}
            <div className="gallery-info-text">
              <h4>Resultados reales, criterio consistente</h4>
              <p>
                Mostramos trabajos realizados en nuestro taller para que puedas ver el nivel de terminacion,
                prolijidad y cuidado aplicado en cada servicio.
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

export default ServicesPreview;
