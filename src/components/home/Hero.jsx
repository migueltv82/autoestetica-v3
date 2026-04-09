import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Sparkles, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
const polishingImg = "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=1200&auto=format&fit=crop";
const interiorImg = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";
const engineImg = "https://images.unsplash.com/photo-1486006920555-64acf2078ed9?q=80&w=1200&auto=format&fit=crop";
import "./Hero.css";

const BG_IMAGES = [
  { src: polishingImg, label: "Tratamiento Acrílico" },
  { src: interiorImg, label: "Limpieza de Interior" },
  { src: engineImg, label: "Lavado de Motor" },
];

const STATS = [
  { value: "+10", label: "Años de experiencia" },
  { value: "100%", label: "Atención personalizada" },
];

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
          className="hero-content-wrap"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } } }}
        >
          {/* Badge */}
          <motion.div
            className="hero-badge-pill"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            <Sparkles size={14} />
            Estética Vehicular Premium
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="hero-headline"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } } }}
          >
            Tu auto merece<br />
            <span className="hero-headline-accent">lo mejor.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="hero-subtext"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            Más de una década cuidando cada milímetro de tu vehículo con
            técnicas profesionales, productos premium y atención a medida.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="hero-cta-row"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            <Link to="/consulta" className="btn-hero-primary">
              <MessageCircle size={20} />
              Consultá por WhatsApp
            </Link>
            <Link to="/servicios" className="btn-hero-secondary">
              Ver servicios
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            className="hero-stats-strip"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, delay: 0.3 } } }}
          >
            {STATS.map((stat, i) => (
              <div key={stat.label} className="hero-stat">
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
                {i < STATS.length - 1 && <div className="hero-stat-divider" />}
              </div>
            ))}
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
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ArrowDown size={22} />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;