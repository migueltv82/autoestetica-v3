import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Modal from "../ui/Modal";
import Carousel from "../ui/Carousel";
import { useServices } from "../../hooks/useServices";
import { getServiceCoverUrl, getServicePreviewGallery } from "../../utils/serviceMedia";
import { isTwoWheelService } from "../../utils/servicePricing";
import "./ServicesGrid.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(value);

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
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
          <motion.span className="catalog-kicker" {...FADE_UP}>Servicios</motion.span>
          <motion.h1 {...FADE_UP} transition={{ delay: 0.08 }}>
            Tratamientos profesionales
          </motion.h1>
          <motion.p {...FADE_UP} transition={{ delay: 0.16 }}>
            Soluciones de estética automotriz pensadas para proteger, realzar y mantener cada detalle de tu vehículo.
          </motion.p>
        </div>
      </header>

      <section className="container catalog-grid">
        {orderedServices.map((service, idx) => (
          <motion.article
            key={service.id}
            {...FADE_UP}
            transition={{ delay: idx * 0.06 }}
            className="service-card-modern"
          >
            <div className="card-media">
              <img
                src={getServiceCoverUrl(service)}
                alt={`Tratamiento ${service.name}`}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="card-body">
              <div className="card-meta">
                <span className="category">{service.category || "Detailing técnico"}</span>
                {service.duration && <span className="duration">{service.duration}</span>}
              </div>

              <h3>{service.name}</h3>
              <p>{service.description}</p>

              <div className="card-footer">
                {service.priceOnRequest ? (
                  <div className="price-summary price-consult"><span>Precio</span><strong>Consultar</strong></div>
                ) : service.carPrice || service.truckPrice ? (
                  isTwoWheelService(service) ? (
                    <div className="price-summary"><span>Precio</span><strong>{formatMoney(service.carPrice)}</strong></div>
                  ) : (
                    <div className="price-summary">
                      <span>Auto {formatMoney(service.carPrice)}</span>
                      <strong>Camioneta {formatMoney(service.truckPrice)}</strong>
                    </div>
                  )
                ) : (
                  <span aria-hidden="true" />
                )}
                <button
                  type="button"
                  className="btn-info-link"
                  onClick={() => setSelectedService(service)}
                  aria-label={`Ver detalle de ${service.name}`}
                >
                  Ver detalle <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      <Modal
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        title="Resultados del tratamiento"
        maxWidth="1000px"
      >
        {selectedService && (
          <div className="gallery-modal-premium">
            <Carousel images={getServicePreviewGallery(selectedService)} />
            <div className="gallery-modal-info">
              <h3>{selectedService.name}</h3>
              {selectedService.priceOnRequest ? <div className="service-modal-prices"><strong>Precio a consultar</strong><span>El valor se define despues de evaluar el estado del vehiculo.</span></div> : isTwoWheelService(selectedService) ? <div className="service-modal-prices"><span>Precio: <strong>{formatMoney(selectedService.carPrice)}</strong></span></div> : <div className="service-modal-prices"><span>Auto: <strong>{formatMoney(selectedService.carPrice)}</strong></span><span>Camioneta: <strong>{formatMoney(selectedService.truckPrice)}</strong></span></div>}
              <p>
                Trabajos realizados bajo procesos técnicos y terminaciones cuidadas. El resultado final puede variar según el estado inicial del vehículo.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ServicesGrid;
