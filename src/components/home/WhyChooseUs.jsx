import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import "./WhyChooseUs.css";

const items = [
  "Atención personalizada por WhatsApp",
  "Trabajo prolijo y enfocado en el detalle",
  "Proceso simple para consultar y coordinar",
  "Seguimiento interno ordenado de turnos y servicios",
];

function WhyChooseUs() {
  return (
    <section className="section why-choose-us">
      <div className="container why-choose-grid">
        <div>
          <span className="section-kicker">Diferencial</span>
          <h2 className="section-title">
            Una experiencia{" "}
            <span className="text-gradient">simple, clara y bien cuidada</span>
          </h2>
          <p className="section-text">
            La idea no es solo que el vehículo quede bien. También buscamos que
            todo el proceso sea más cómodo, prolijo y confiable desde el primer contacto.
          </p>
        </div>

        <div className="why-list">
          {items.map((item) => (
            <div className="why-item" key={item}>
              <CheckCircle2 size={20} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;