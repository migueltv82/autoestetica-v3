import { motion } from "framer-motion";
import { Phone, Zap, ShieldCheck, Clock } from "lucide-react";
import "./WhyChooseUs.css";

const items = [
  "Atención personalizada por WhatsApp",
  "Trabajo prolijo y enfocado en el detalle",
  "Proceso simple para consultar y coordinar",
  "Seguimiento interno ordenado de turnos y servicios",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

function WhyChooseUs() {
  return (
    <section className="section why-choose-us">
      <div className="container why-choose-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-kicker">Diferencial</span>
          <h2 className="section-title">Una experiencia simple, clara y bien cuidada</h2>
          <p className="section-text">
            La idea no es solo que el vehículo quede bien. También buscamos que
            todo el proceso sea más cómodo, prolijo y confiable desde el primer contacto.
          </p>
        </motion.div>

        <motion.div
          className="why-list"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {items.map((item) => (
            <motion.div className="why-item" key={item} variants={itemVariants}>
              <CheckCircle2 size={20} />
              <span>{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChooseUs;