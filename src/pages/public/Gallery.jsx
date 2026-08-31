import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Images, Maximize2, MessageCircle, SlidersHorizontal } from "lucide-react";
import { useGallery } from "../../hooks/useGallery";
import { useSettings } from "../../hooks/useSettings";
import BeforeAfterSlider from "../../components/ui/BeforeAfterSlider";
import Modal from "../../components/ui/Modal";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import "./Gallery.css";

const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

function formatDate(date) {
  if (!date) return "Trabajo realizado";
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

function ResultVisual({ item, expanded = false }) {
  if (item.beforeUrl && item.afterUrl) {
    return <BeforeAfterSlider beforeUrl={item.beforeUrl} afterUrl={item.afterUrl} title={item.title} service={item.service} />;
  }

  const imageUrl = item.afterUrl || item.beforeUrl;
  return (
    <div className={`gallery-result-image${expanded ? " is-expanded" : ""}`}>
      <img src={imageUrl} alt={`Resultado de ${item.title}`} loading={expanded ? "eager" : "lazy"} decoding="async" />
      <span>Resultado final</span>
    </div>
  );
}

function Gallery() {
  const { publishedImages, isLoading, error } = useGallery();
  const { settings } = useSettings();
  const [activeService, setActiveService] = useState("Todos");
  const [selected, setSelected] = useState(null);

  const validImages = useMemo(
    () => publishedImages.filter((item) => item.afterUrl || item.beforeUrl),
    [publishedImages]
  );
  const services = useMemo(
    () => ["Todos", ...new Set(validImages.map((item) => item.service).filter(Boolean))],
    [validImages]
  );
  const visibleImages = useMemo(
    () => activeService === "Todos" ? validImages : validImages.filter((item) => item.service === activeService),
    [activeService, validImages]
  );
  const whatsapp = `https://wa.me/${String(settings.whatsapp || "5493815448147").replace(/\D/g, "")}?text=${encodeURIComponent("Hola, vi los trabajos de la galería y quiero consultar qué tratamiento recomiendan para mi vehículo.")}`;

  return (
    <PageTransition>
      <PublicLayout>
        <div className="public-gallery-page">
          <header className="gallery-hero">
            <div className="container gallery-hero-layout">
              <div>
                <motion.span className="gallery-kicker" {...FADE_UP}>Resultados reales</motion.span>
                <motion.h1 {...FADE_UP} transition={{ delay: 0.08 }}>El detalle se demuestra.</motion.h1>
                <motion.p {...FADE_UP} transition={{ delay: 0.16 }}>
                  Trabajos realizados en nuestro taller. Compará el antes y el después y descubrí el nivel de terminación que buscamos en cada vehículo.
                </motion.p>
              </div>
              <motion.div className="gallery-hero-proof" {...FADE_UP} transition={{ delay: 0.2 }}>
                <Images size={25} />
                <strong>{validImages.length}</strong>
                <span>{validImages.length === 1 ? "caso publicado" : "casos publicados"}</span>
              </motion.div>
            </div>
          </header>

          <section className="container gallery-content" aria-labelledby="gallery-results-title">
            <div className="gallery-toolbar">
              <div>
                <span className="gallery-toolbar-kicker"><SlidersHorizontal size={15} /> Explorá por servicio</span>
                <h2 id="gallery-results-title">Transformaciones del taller</h2>
              </div>
              {services.length > 1 ? (
                <div className="gallery-filters" aria-label="Filtrar trabajos por servicio">
                  {services.map((service) => (
                    <button key={service} type="button" className={activeService === service ? "is-active" : ""} onClick={() => setActiveService(service)} aria-pressed={activeService === service}>
                      {service}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {isLoading ? <div className="gallery-status">Cargando trabajos…</div> : null}
            {!isLoading && error ? <div className="gallery-status gallery-status-error">No pudimos cargar la galería en este momento.</div> : null}
            {!isLoading && !error && visibleImages.length > 0 ? (
              <div className="gallery-results-grid" role="list">
                {visibleImages.map((item, index) => (
                  <motion.article key={item.id} className={`gallery-work-card${index === 0 ? " is-featured" : ""}`} {...FADE_UP} transition={{ delay: Math.min(index * 0.06, 0.24) }} role="listitem">
                    <div className="gallery-work-visual"><ResultVisual item={item} /></div>
                    <div className="gallery-work-info">
                      <div>
                        <span className="gallery-work-service">{item.service || "Detailing profesional"}</span>
                        <h3>{item.title}</h3>
                        <p>{formatDate(item.date)} · {item.beforeUrl && item.afterUrl ? "Comparación antes y después" : "Resultado final"}</p>
                      </div>
                      <button type="button" onClick={() => setSelected(item)} aria-label={`Ampliar ${item.title}`}>
                        <Maximize2 size={17} /> <span>Ampliar</span>
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : null}

            {!isLoading && !error && visibleImages.length === 0 ? (
              <div className="gallery-empty">
                <Images size={30} />
                <h3>{activeService === "Todos" ? "Próximamente, nuevos trabajos" : "Todavía no publicamos casos de este servicio"}</h3>
                <p>Estamos preparando más resultados reales para compartir.</p>
              </div>
            ) : null}
          </section>

          <section className="gallery-cta">
            <div className="container">
              <div><span>Tu vehículo puede ser el próximo</span><h2>Contanos qué resultado estás buscando.</h2></div>
              <a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Consultar por WhatsApp <ArrowUpRight size={16} /></a>
            </div>
          </section>

          <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || "Resultado"} maxWidth="1000px">
            {selected ? (
              <div className="gallery-viewer">
                <ResultVisual item={selected} expanded />
                <div className="gallery-viewer-copy">
                  <span>{selected.service || "Detailing profesional"}</span>
                  <p>{formatDate(selected.date)}. Un resultado real realizado en nuestro taller, con un proceso adaptado al estado inicial del vehículo.</p>
                </div>
              </div>
            ) : null}
          </Modal>
        </div>
      </PublicLayout>
    </PageTransition>
  );
}

export default Gallery;
