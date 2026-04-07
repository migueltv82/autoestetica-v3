import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import "./CtaBanner.css";

function CtaBanner() {
  return (
    <section className="cta-section">
      {/* Background glow */}
      <div className="cta-glow-1" />
      <div className="cta-glow-2" />

      <div className="container cta-inner">
        <motion.div
          className="cta-text-block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="cta-kicker"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            ¿Listo para el cambio?
          </motion.span>
          <h2 className="cta-title">
            Reservá tu turno y transformá<br />
            <span className="cta-title-accent">tu vehículo hoy.</span>
          </h2>
          <p className="cta-body">
            Coordinamos directamente por WhatsApp. Sin esperas. Sin formularios.
            Solo enviá un mensaje y te respondemos a la brevedad.
          </p>
        </motion.div>

        <motion.div
          className="cta-actions"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Link to="/consulta" className="btn-cta-whatsapp">
            <MessageCircle size={22} />
            Escribinos por WhatsApp
          </Link>
          <Link to="/servicios" className="btn-cta-ghost">
            Ver todos los servicios
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default CtaBanner;