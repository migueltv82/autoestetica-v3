import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero section">
      <div className="container hero-grid">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="hero-badge">Estética vehicular premium</span>

          <h1 className="hero-title">
            Cuidamos cada detalle para que tu vehículo se vea impecable.
          </h1>

          <p className="hero-text">
            Servicios de estética vehicular con atención personalizada, imagen
            profesional y una experiencia simple para consultar y coordinar por
            WhatsApp.
          </p>

          <div className="hero-actions">
            <Link to="/consulta" className="btn-primary">
              Hacer una consulta
            </Link>

            <Link to="/servicios" className="btn-secondary">
              Ver servicios
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="hero-card hero-card-main">
            <span className="hero-card-kicker">
              Detalle, prolijidad y presencia
            </span>
            <h3>Tu vehículo, con otra imagen</h3>
            <p>
              Un espacio pensado para quienes valoran el cuidado visual y la
              atención bien hecha.
            </p>
          </div>

          <div className="hero-glow"></div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;