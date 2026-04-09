import { motion } from "framer-motion";
import { Phone, Zap, ShieldCheck, Clock } from "lucide-react";
import "./WhyChooseUs.css";

const features = [
  {
    icon: <Zap size={28} />,
    title: "Resultados que se ven",
    text: "Técnicas de detailing profesional que transforman cada vehículo. No prometemos, demostramos.",
  },
  {
    icon: <Clock size={28} />,
    title: "+10 años en el mercado",
    text: "Una década de experiencia perfeccionando cada proceso. Conocemos cada tipo de pintura y material.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Productos premium",
    text: "Usamos insumos y ceras de primera línea para garantizar un acabado duradero y de alto impacto.",
  },
  {
    icon: <Phone size={28} />,
    title: "Coordinación por WhatsApp",
    text: "Sin formularios complicados. Consultá, coordiná y seguí tu turno directamente desde tu celular.",
  },
];

function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="container">
        <motion.div
          className="why-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
        >
          <span className="section-kicker">Diferencial</span>
          <h2 className="section-title">Por qué nuestros clientes <br />confían en nosotros</h2>
        </motion.div>

        <motion.div
          className="why-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              className="why-card"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
              }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <div className="why-card-icon">{f.icon}</div>
              <h3 className="why-card-title">{f.title}</h3>
              <p className="why-card-text">{f.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChooseUs;