<<<<<<< HEAD
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
=======
import { Sparkles, Droplets, ShieldCheck, Bike, CarFront } from "lucide-react";
import "./ServicesGrid.css";

const servicesList = [
  {
    icon: <CarFront size={28} />,
    title: "Lavado premium",
    description: "Limpieza exterior con terminación prolija para una mejor presencia general.",
    duration: "de 4 a 6 horas",
    featured: true,
    gallery: [
      { url: "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=1470&auto=format&fit=crop", label: "Finalizado" },
      { url: "https://images.unsplash.com/photo-1542462662-e17ee96c262d?q=80&w=1470&auto=format&fit=crop", label: "Proceso" },
      { url: "https://images.unsplash.com/photo-1574067332341-35f11e967a5b?q=80&w=1470&auto=format&fit=crop", label: "Detalle" },
    ]
  },
  {
    icon: <Droplets size={28} />,
    title: "Limpieza de interior",
    description: "Limpieza profunda de habitáculo, superficies y detalles internos.",
    duration: "2 días",
    gallery: [
      { url: "https://images.unsplash.com/photo-1599256621730-535359e1ecbc?q=80&w=1470&auto=format&fit=crop", label: "Tapizados" },
      { url: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=1470&auto=format&fit=crop", label: "Consola" },
    ]
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Pulido y abrillantado",
    description: "Tratamiento estético para mejorar brillo, uniformidad y terminación.",
    duration: "Según evaluación",
    featured: true,
    gallery: [
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1470&auto=format&fit=crop", label: "Brillo Espejo" },
      { url: "https://images.unsplash.com/photo-1621360841013-c7683c312e90?q=80&w=1470&auto=format&fit=crop", label: "Antes/Después" },
    ]
  },
  {
    icon: <Sparkles size={28} />,
    title: "Lavado de motor",
    description: "Limpieza estética de motor con cuidado y criterio.",
    duration: "2 horas",
    gallery: []
  },
  {
    icon: <Bike size={28} />,
    title: "Lavado y detallado de motos",
    description: "Trabajo detallado para motos, con limpieza estética y terminación cuidada.",
    duration: "3 horas",
    gallery: []
  },
  {
    icon: <Bike size={28} />,
    title: "Lavado y detallado de bicicletas",
    description: "Limpieza y cuidado visual para bicicletas de uso urbano o deportivo.",
    duration: "1:30 horas",
    gallery: []
  },
];
>>>>>>> cde7450f2feb3921c869f0d5d95070583627312a

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
<<<<<<< HEAD
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
=======
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

        <div className="services-grid">
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
>>>>>>> cde7450f2feb3921c869f0d5d95070583627312a
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