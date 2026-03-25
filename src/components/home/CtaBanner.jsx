import { Link } from "react-router-dom";
import "./CtaBanner.css";

function CtaBanner() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-banner">
          <div>
            <span className="section-kicker">Contacto directo</span>
            <h2 className="cta-banner-title">
              Contanos qué necesitás y te respondemos por WhatsApp
            </h2>
            <p className="cta-banner-text">
              Los turnos se coordinan de forma personalizada para brindar una atención
              más ordenada y ajustada a cada caso.
            </p>
          </div>

          <div className="cta-banner-actions">
            <Link to="/consulta" className="btn-primary">
              Hacer una consulta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;