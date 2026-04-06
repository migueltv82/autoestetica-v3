import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Hero.css";

// Variants for staggered content entrance
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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

// Continuous floating animation for visual card
const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const glowVariants = {
  initial: { opacity: 0.5, scale: 0.8 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    scale: [0.8, 1.1, 0.8],
    transition: {
      duration: 8,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

function Hero() {
  return (
    <section className="hero section">
      <div className="container hero-grid">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={itemVariants} className="hero-badge">
            <span className="badge-dot"></span> Estética vehicular premium
          </motion.span>

          <motion.h1 variants={itemVariants} className="hero-title">
            Cuidamos cada detalle para que tu vehículo se vea{" "}
            <span className="text-gradient">impecable.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="hero-text">
            Servicios de estética vehicular con atención personalizada, imagen
            profesional y una experiencia simple para consultar y coordinar por
            WhatsApp.
          </motion.p>

          <motion.div variants={itemVariants} className="hero-actions">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/consulta" className="btn-primary">
                Hacer una consulta
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/servicios" className="btn-secondary">
                Ver servicios
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <motion.div
            className="hero-card hero-card-main glass-effect"
            variants={floatingVariants}
            initial="initial"
            animate="animate"
          >
            <div className="card-ornament"></div>
            <span className="hero-card-kicker">Detalle, prolijidad y presencia</span>
            <h3>Tu vehículo, con otra imagen</h3>
            <p>
              Un espacio pensado para quienes valoran el cuidado visual y la
              atención bien hecha.
            </p>
            <div className="card-footer-line"></div>
          </motion.div>

          {/* Background glows for premium look */}
          <motion.div
            className="hero-glow hero-glow-1"
            variants={glowVariants}
            initial="initial"
            animate="animate"
          ></motion.div>
          <motion.div
            className="hero-glow hero-glow-2"
            variants={glowVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '-4s' }}
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;