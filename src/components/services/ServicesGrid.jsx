import { Sparkles, Droplets, ShieldCheck, Bike, CarFront, Clock, Eye } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import businessLogo from "../../assets/logo.jpg";
import Modal from "../ui/Modal";
import Carousel from "../ui/Carousel";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

function ServicesGrid() {
  const [selectedService, setSelectedService] = useState(null);

  const openGallery = (service) => {
    setSelectedService(service);
  };

  const closeGallery = () => {
    setSelectedService(null);
  };

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
            transition={{ duration: 0.8 }}
          >
            <span className="section-kicker">Nuestros Servicios</span>
            <h1 className="section-title">Estética Vehicular de Vanguardia</h1>
            <p className="section-text">
              Cada servicio se coordina de manera personalizada para asegurar una
              atención más precisa y un resultado de concurso. <br/>
              <strong>Hacé clic en cualquier tarjeta para ver resultados reales.</strong>
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {servicesList.map((service) => (
            <motion.article 
              className={`vanguard-service-card ${service.featured ? 'featured' : ''}`} 
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              onClick={() => openGallery(service)}
              style={{ cursor: "pointer" }}
            >
              <div className="vanguard-card-icon">
                {service.icon}
              </div>
              <div className="card-click-label">
                <Eye size={12} /> VER TRABAJOS
              </div>
              <h3 className="vanguard-card-title">{service.title}</h3>
              <p className="vanguard-card-desc">{service.description}</p>
              <div className="vanguard-card-footer">
                <Clock size={16} className="text-secondary" />
                <span className="vanguard-card-duration">{service.duration}</span>
              </div>
              {service.featured && <div className="vanguard-featured-glow" />}
            </motion.article>
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
}

export default ServicesGrid;