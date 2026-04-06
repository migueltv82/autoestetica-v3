import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./CtaBanner.css";

function CtaBanner() {
  return (
    <section className="section py-6">
      <div className="container">
        <motion.div 
          className="cta-banner glass-panel-premium"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="cta-glow"></div>
          
          <div className="cta-content relative-z">
            <motion.span 
              className="section-kicker"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Contacto directo
            </motion.span>
            <motion.h2 
              className="cta-banner-title"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Contanos qué necesitás y te respondemos por <span className="text-gradient">WhatsApp</span>
            </motion.h2>
            <motion.p 
              className="cta-banner-text"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Los turnos se coordinan de forma personalizada para brindar una atención
              más ordenada y ajustada a cada caso.
            </motion.p>
          </div>

          <motion.div 
            className="cta-banner-actions relative-z"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/consulta" className="btn-primary cta-btn">
                Hacer una consulta
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default CtaBanner;