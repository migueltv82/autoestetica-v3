import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import polishingImg from "../../assets/hero-polishing.jpeg";
import interiorImg from "../../assets/result-interior.jpg";
import engineImg from "../../assets/result-engine.jpeg";
import "./Hero.css";

const BG_IMAGES = [
  {
    src: polishingImg,
    label: "Pulido y protección de terminación fina",
  },
  {
    src: interiorImg,
    label: "Interior restaurado con criterio y detalle",
  },
  {
    src: engineImg,
    label: "Limpieza técnica cuidada en cada zona",
  },
];

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

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BG_IMAGES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-cinematic">
      <div className="hero-bg">
        <AnimatePresence mode="sync">
          <motion.img
            key={current}
            src={BG_IMAGES[current].src}
            alt={BG_IMAGES[current].label}
            className="hero-bg-img"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1.08 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="hero-overlay-1" />
        <div className="hero-overlay-2" />
      </div>

      <div className="container hero-grid">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="hero-badge" variants={itemVariants}>
            <Sparkles size={14} />
            Detailing de alto nivel
          </motion.span>

          <motion.h1 className="hero-title" variants={itemVariants}>
            <span className="hero-title-accent">Presencia impecable</span>
            detalle preciso y una experiencia sin fricción.
          </motion.h1>

          <motion.p className="hero-text" variants={itemVariants}>
            Trabajamos la estética de tu vehículo con un enfoque sobrio, técnico y
            cuidado. Consultás fácil, coordinás por WhatsApp y recibís atención
            directa desde el primer contacto.
          </motion.p>

          <motion.div className="hero-actions" variants={itemVariants}>
            <Link to="/consulta" className="btn-primary btn-hero-primary">
              Hacer una consulta
            </Link>
            <Link to="/servicios" className="btn-secondary btn-hero-primary">
              Ver servicios
            </Link>
          </motion.div>

          <motion.div className="hero-meta" variants={itemVariants}>
            <span>{BG_IMAGES[current].label}</span>
            <span>Turnos y consultas por WhatsApp</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
