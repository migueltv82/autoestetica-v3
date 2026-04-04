import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import carImage from "../../assets/logo.jpg";
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
  return (
    <section className="hero section">
      <div className="container hero-grid">
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

            <Link to="/servicios" className="btn-secondary">
              Ver servicios
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <img src={carImage} alt="Luxury Car Detailing" className="hero-car-img" />
          <div className="hero-glow"></div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;