import { Sparkles, Droplets, ShieldCheck, Bike, CarFront } from "lucide-react";
import { motion } from "framer-motion";
import "./ServicesGrid.css";

const servicesList = [
  {
    icon: <CarFront size={26} />,
    title: "Lavado premium",
    description: "Limpieza exterior con terminación prolija para una mejor presencia general.",
    duration: "de 4 a 6 horas",
  },
  {
    icon: <Droplets size={26} />,
    title: "Limpieza de interior",
    description: "Limpieza profunda de habitáculo, superficies y detalles internos.",
    duration: "2 dias",
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Pulido y abrillantado",
    description: "Tratamiento estético para mejorar brillo, uniformidad y terminación.",
    duration: "Según evaluación",
  },
  {
    icon: <Sparkles size={26} />,
    title: "Lavado de motor",
    description: "Limpieza estética de motor con cuidado y criterio.",
    duration: "2 horas",
  },
  {
    icon: <Bike size={26} />,
    title: "Lavado y detallado de motos",
    description: "Trabajo detallado para motos, con limpieza estética y terminación cuidada.",
    duration: "3 horas",
  },
  {
    icon: <Bike size={26} />,
    title: "Lavado y detallado de bicicletas",
    description: "Limpieza y cuidado visual para bicicletas de uso urbano o deportivo.",
    duration: "1:30 horas",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function ServicesGrid() {
  return (
    <section className="section services-page relative">
      <div className="services-grid-glow top-glow"></div>
      <div className="services-grid-glow bottom-glow"></div>
      <div className="container relative-z">
        <motion.div 
          className="section-heading centered-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-kicker">Catálogo</span>
          <h1 className="section-title">Servicios disponibles</h1>
          <p className="section-text">
            Cada servicio se coordina de manera personalizada para asegurar una
            atención más precisa y un mejor resultado final.
          </p>
        </motion.div>

        <motion.div 
          className="services-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {servicesList.map((service) => (
            <motion.article 
              className="service-card glass-panel-card" 
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="service-card-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="service-card-duration">{service.duration}</span>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesGrid;