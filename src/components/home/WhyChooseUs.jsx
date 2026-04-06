import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function WhyChooseUs() {
  return (
    <section className="section why-choose-us relative">
      <div className="why-glow"></div>
      <div className="container why-choose-grid relative-z">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="section-kicker">Diferencial</span>
          <h2 className="section-title">
            Una experiencia <span className="text-gradient">simple, clara y bien cuidada</span>
          </h2>
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
          viewport={{ once: true, margin: "-100px" }}
        >
          {items.map((item) => (
            <motion.div className="why-item glass-panel-sm" key={item} variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <div className="why-icon-wrapper">
                <CheckCircle2 size={24} strokeWidth={1.5} />
              </div>
              <span>{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChooseUs;