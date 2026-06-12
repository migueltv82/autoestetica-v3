import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import { useServices } from "../../hooks/useServices";
import { getServiceCoverUrl } from "../../utils/serviceMedia";
import heroImg from "../../assets/hero-premium.png";
import "./Home.css";

const FADE_UP = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
};

const TRUST_ITEMS = [
  {
    title: "Diagnóstico personalizado",
    description: "Evaluamos el estado real antes de intervenir.",
  },
  {
    title: "Productos profesionales",
    description: "Procesos adecuados para cada superficie.",
  },
  {
    title: "Terminación premium",
    description: "Resultados limpios, equilibrados y duraderos.",
  },
];

function Home() {
  const { services } = useServices();
  const featuredServices = Array.isArray(services) ? services.slice(0, 3) : [];

  return (
    <PageTransition>
      <PublicLayout className="home-public-layout">
        <div className="home-premium">
          <section className="home-hero" aria-labelledby="home-hero-title">
            <div className="home-hero-media" aria-hidden="true">
              <img src={heroImg} alt="" />
              <div className="home-hero-overlay" />
            </div>

            <div className="container home-hero-shell">
              <div className="home-hero-content">
                <motion.span
                  className="home-kicker"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42 }}
                >
                  Detailing premium en Tucumán
                </motion.span>

                <motion.h1
                  id="home-hero-title"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.56, delay: 0.08 }}
                >
                  Estética automotriz de alto nivel
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.56, delay: 0.16 }}
                >
                  Cuidamos cada detalle de tu vehículo con tratamientos profesionales, terminaciones limpias y protección duradera.
                </motion.p>

                <motion.div
                  className="home-hero-actions"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.56, delay: 0.24 }}
                >
                  <Link to="/consulta" className="home-btn home-btn-primary">
                    Solicitar diagnóstico <ArrowRight size={17} />
                  </Link>
                  <Link to="/servicios" className="home-btn home-btn-secondary">
                    Ver servicios
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="home-featured" aria-labelledby="home-featured-title">
            <div className="container">
              <motion.div {...FADE_UP} className="home-section-heading">
                <span className="home-kicker">Servicios destacados</span>
                <h2 id="home-featured-title">Tratamientos principales</h2>
              </motion.div>

              <div className="home-featured-grid">
                {featuredServices.map((service, index) => (
                  <motion.article
                    key={service.id}
                    {...FADE_UP}
                    transition={{ ...FADE_UP.transition, delay: index * 0.06 }}
                    className="home-service-card"
                  >
                    <div className="home-service-image">
                      <img src={getServiceCoverUrl(service)} alt={service.name} loading="lazy" decoding="async" />
                    </div>
                    <div className="home-service-content">
                      <span>{service.category || "Detailing técnico"}</span>
                      <h3>{service.name}</h3>
                      <Link to="/servicios" className="home-card-link">
                        Ver servicio <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section className="home-trust container" aria-label="Confianza">
            {TRUST_ITEMS.map((item, index) => (
              <motion.article
                key={item.title}
                {...FADE_UP}
                transition={{ ...FADE_UP.transition, delay: index * 0.06 }}
                className="home-trust-item"
              >
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            ))}
          </section>
        </div>
      </PublicLayout>
    </PageTransition>
  );
}

export default Home;
