import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Sparkles, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
const polishingImg = "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=1200&auto=format&fit=crop";
const interiorImg = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";
const engineImg = "https://images.unsplash.com/photo-1486006920555-64acf2078ed9?q=80&w=1200&auto=format&fit=crop";
import "./Hero.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(p => (p + 1) % BG_IMAGES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-cinematic">
      {/* Rotating background images */}
      <div className="hero-bg">
        <AnimatePresence mode="sync">
          <motion.img
            key={current}
            src={BG_IMAGES[current].src}
            alt={BG_IMAGES[current].label}
            className="hero-bg-img"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="hero-overlay-1" />
        <div className="hero-overlay-2" />
      </div>

      {/* Slide dots */}
      <div className="hero-dots">
        {BG_IMAGES.map((img, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={img.label}
          />
        ))}
      </div>

      {/* Current scene label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="hero-scene-label"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.5 }}
        >
          {BG_IMAGES[current].label}
        </motion.div>
      </AnimatePresence>

      {/* Ambient glow orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      {/* Main content */}
      <div className="container hero-body">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="hero-badge" variants={itemVariants}>
            Estética vehicular premium
          </motion.span>

          <motion.h1 className="hero-title" variants={itemVariants}>
            Cuidamos cada detalle para que tu vehículo se vea impecable.
          </motion.h1>

          <motion.p className="hero-text" variants={itemVariants}>
            Servicios de estética vehicular con atención personalizada, imagen
            profesional y una experiencia simple para consultar y coordinar por
            WhatsApp.
          </motion.p>

          <motion.div className="hero-actions" variants={itemVariants}>
            <Link to="/consulta" className="btn-primary">
              Hacer una consulta
            </Link>
            <Link to="/servicios" className="btn-hero-secondary">
              Ver servicios
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="hero-scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <img src={carImage} alt="Luxury Car Detailing" className="hero-car-img" />
          <div className="hero-glow"></div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;