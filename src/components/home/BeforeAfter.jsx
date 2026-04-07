import { motion } from "framer-motion";
import interiorImg from "../../assets/result-interior.jpg";
import engineImg from "../../assets/result-engine.jpg";
import "./BeforeAfter.css";

const results = [
  {
    img: interiorImg,
    title: "Limpieza de Interior",
    desc: "Tapizados, alfombras y superficies recuperados completamente. El antes y después habla solo.",
    tag: "Interior detailing",
  },
  {
    img: engineImg,
    title: "Lavado de Motor",
    desc: "Limpieza técnica que devuelve al motor su aspecto original. Estética + protección.",
    tag: "Engine detailing",
  },
];

function BeforeAfter() {
  return (
    <section className="ba-section">
      <div className="container">
        <motion.div
          className="ba-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
        >
          <span className="section-kicker">Resultados reales</span>
          <h2 className="section-title">
            El trabajo habla<br />
            <span className="ba-title-accent">por sí solo.</span>
          </h2>
          <p className="section-text">
            No es magia. Es técnica, dedicación y los productos correctos.
            Cada vehículo que sale de nuestras manos es un testimonio de lo que hacemos.
          </p>
        </motion.div>

        <div className="ba-grid">
          {results.map((item, i) => (
            <motion.div
              key={item.title}
              className="ba-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
            >
              {/* Image with labels */}
              <div className="ba-image-wrap">
                <img src={item.img} alt={item.title} className="ba-image" />
                {/* Before / After labels */}
                <div className="ba-label-left">ANTES</div>
                <div className="ba-label-right">DESPUÉS</div>
                {/* Center divider line */}
                <div className="ba-divider-line" />
                {/* Tag */}
                <div className="ba-tag">{item.tag}</div>
              </div>

              {/* Info */}
              <div className="ba-info">
                <h3 className="ba-title">{item.title}</h3>
                <p className="ba-desc">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BeforeAfter;
