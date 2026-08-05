import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FlaskConical, Gem, MessageCircle, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import { useServices } from "../../hooks/useServices";
import heroImg from "../../assets/hero-premium.webp";
import defaultLogo from "../../assets/logo.webp";
import { useSettings } from "../../hooks/useSettings";
import { useGallery } from "../../hooks/useGallery";
import BeforeAfterSlider from "../../components/ui/BeforeAfterSlider";
import fallbackBefore from "../../assets/hero-polishing.webp";
import fallbackAfter from "../../assets/result-interior.webp";
import ServiceSalesCard from "../../components/services/ServiceSalesCard";
import ClubMembershipSection from "../../components/public/ClubMembershipSection";
import "./Home.css";

const FADE_UP = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
};

const TRUST_ITEMS = [
  {
    icon: ScanSearch,
    title: "Diagnóstico personalizado",
    description: "Evaluamos el estado real antes de intervenir.",
  },
  {
    icon: FlaskConical,
    title: "Productos profesionales",
    description: "Procesos adecuados para cada superficie.",
  },
  {
    icon: Gem,
    title: "Terminación premium",
    description: "Resultados limpios, equilibrados y duraderos.",
  },
];

function Home() {
  const { services } = useServices();
  const { settings, isLoading: areSettingsLoading } = useSettings();
  const { publishedImages } = useGallery();
  const featuredServices = Array.isArray(services) ? [...services.filter((service) => service.featured), ...services.filter((service) => !service.featured)].slice(0, 3) : [];
  const whatsappNumber = (settings.whatsapp || "5493815448147").replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, quiero consultar por un servicio de detailing para mi vehículo.")}`;
  const configuredComparison = settings.transformationBeforeUrl && settings.transformationAfterUrl ? {
    beforeUrl: settings.transformationBeforeUrl,
    afterUrl: settings.transformationAfterUrl,
    title: settings.transformationTitle || "Deslizá y descubrí la diferencia",
    service: settings.transformationServiceLabel || "Resultado real de detailing",
  } : null;
  const galleryComparison = publishedImages.find((item) => item.beforeUrl && item.afterUrl);
  const comparison = configuredComparison || galleryComparison || { beforeUrl: fallbackBefore, afterUrl: fallbackAfter, title: "Transformación profesional", service: "Resultado de detailing" };
  const transformationTitle = settings.transformationTitle || "Deslizá y descubrí la diferencia";
  const transformationSubtitle = settings.transformationSubtitle || "No maquillamos el vehículo: trabajamos cada superficie con un proceso pensado para recuperar su apariencia y proteger el resultado.";

  return (
    <PageTransition>
      <PublicLayout className="home-public-layout">
        <div className={`home-premium ${!areSettingsLoading && settings.clubSectionEnabled ? "home-with-club" : "home-without-club"}`}>
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
                  Tu vehículo puede volver a sentirse nuevo
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.56, delay: 0.16 }}
                >
                  Detailing profesional, corrección estética y protección para recuperar el brillo, la limpieza y el valor de tu vehículo.
                </motion.p>

                <motion.div
                  className="home-hero-actions"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.56, delay: 0.24 }}
                >
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className="home-btn home-btn-primary"><MessageCircle size={18} /> Consultar por WhatsApp</a>
                </motion.div>
                <motion.div className="home-hero-proof" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .32 }}><span><ShieldCheck size={16} /> Diagnóstico personalizado</span><span><Sparkles size={16} /> Terminación profesional</span></motion.div>
              </div>
              <motion.aside className="home-brand-card" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .65, delay: .2 }}><div className="home-brand-glow" /><img src={settings.logoUrl || defaultLogo} alt={`Logo de ${settings.businessName || "Autoestética Tucumán"}`} /><span>Detailing studio</span><h2>{settings.businessName || "Autoestética Tucumán"}</h2><p><CheckCircle2 size={15} /> Evaluación previa para recomendar el tratamiento correcto según el estado real del vehículo.</p><div className="home-brand-note"><strong>Respuesta directa por WhatsApp</strong><small>Contanos qué vehículo tenés y qué resultado buscás.</small></div></motion.aside>
            </div>
          </section>

          {!areSettingsLoading && settings.clubSectionEnabled ? <ClubMembershipSection /> : null}

          <section className="home-transformation" aria-labelledby="home-transformation-title">
            <div className="container home-transformation-shell">
              <motion.div {...FADE_UP} className="home-transformation-copy">
                <span className="home-kicker">El resultado habla</span>
                <h2 id="home-transformation-title">{transformationTitle}</h2>
                <p>{transformationSubtitle}</p>
                <div className="home-transformation-proof">
                  <span><CheckCircle2 size={16} /> Trabajo documentado</span>
                  <span><CheckCircle2 size={16} /> Resultado real</span>
                  <span><CheckCircle2 size={16} /> Comparación honesta</span>
                </div>
                <Link to="/galeria">Ver todos los trabajos <ArrowRight size={15} /></Link>
              </motion.div>
              <motion.div {...FADE_UP} className="home-transformation-slider"><BeforeAfterSlider beforeUrl={comparison.beforeUrl} afterUrl={comparison.afterUrl} title={comparison.title} service={comparison.service} /></motion.div>
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
                  <motion.div
                    key={service.id}
                    {...FADE_UP}
                    transition={{ ...FADE_UP.transition, delay: index * 0.06 }}
                  >
                    <ServiceSalesCard service={service} whatsappNumber={settings.whatsapp} compact />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="home-trust container" aria-label="Confianza">
            {TRUST_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
              <motion.article
                key={item.title}
                {...FADE_UP}
                transition={{ ...FADE_UP.transition, delay: index * 0.06 }}
                className="home-trust-item"
              >
                <div className="home-trust-item-head">
                  <span className="home-trust-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7} /></span>
                  <span className="home-trust-index">0{index + 1}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
              );
            })}
          </section>
        </div>
      </PublicLayout>
    </PageTransition>
  );
}

export default Home;
