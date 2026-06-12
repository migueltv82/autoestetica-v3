import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Images } from "lucide-react";
import { useGallery } from "../../hooks/useGallery";
import Modal from "../ui/Modal";
import Carousel from "../ui/Carousel";
import "../../styles/serviceCards.css";
import "./ShowcaseGallery.css";

function getGallerySlides(item) {
  if (!item) return [];

  if (item.beforeUrl) {
    return [
      { url: item.beforeUrl, label: "Antes" },
      { url: item.afterUrl, label: "Después" },
    ];
  }

  return [{ url: item.afterUrl, label: "Resultado" }];
}

function ShowcaseGallery() {
  const { publishedImages } = useGallery();
  const [selected, setSelected] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const orderedImages = useMemo(() => {
    if (!Array.isArray(publishedImages)) return [];
    return [...publishedImages].sort((a, b) => (b?.date || "").localeCompare(a?.date || ""));
  }, [publishedImages]);

  const visibleImages = useMemo(
    () => (showAll ? orderedImages : orderedImages.slice(0, 4)),
    [orderedImages, showAll]
  );

  if (orderedImages.length === 0) return null;

  return (
    <section className="showcase-section">
      <div className="container">
        <motion.div
          className="showcase-header section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.55 }}
        >
          <span className="section-kicker">Resultados reales</span>
          <h2 className="section-title">Nuestro trabajo, sin filtros</h2>
          <p className="section-text">
            Un vistazo a resultados reales: antes y después, terminación prolija y criterio consistente.
          </p>
        </motion.div>

        <div className="showcase-grid" role="list" aria-label="Resultados del taller">
          {visibleImages.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              className="svc-poster showcase-poster"
              onClick={() => setSelected(item)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              role="listitem"
              aria-label={item.title}
            >
              <img src={item.afterUrl} alt="" className="svc-poster-img" loading="lazy" decoding="async" />
              <div className="svc-poster-shade" aria-hidden="true" />

              <div className="svc-poster-body">
                <div className="svc-poster-top">
                  <span className="svc-poster-chip svc-poster-chip-solid">{item.service}</span>
                  <span className="svc-poster-chip svc-poster-chip-featured">
                    <Images size={14} />
                    {item.beforeUrl ? "Antes / Después" : "Resultado"}
                  </span>
                </div>

                <div className="svc-poster-bottom">
                  <h3 className="svc-poster-title">{item.title}</h3>
                  <div className="svc-poster-meta">
                    <span className="svc-poster-meta-item">{item.date}</span>
                    <span className="svc-poster-cta" aria-hidden="true">
                      Ver detalle <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {orderedImages.length > 4 ? (
          <div className="showcase-actions">
            <button type="button" className="btn-pill-toggle" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Ver menos" : `Ver más resultados (${orderedImages.length})`}
            </button>
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title || "Resultado"}
        maxWidth="900px"
      >
        {selected ? (
          <div className="gallery-modal-content">
            <Carousel images={getGallerySlides(selected)} />
            <div className="gallery-info-text">
              <h4>Detalles que se notan</h4>
              <p>
                Cada resultado refleja un proceso prolijo: limpieza, corrección, protección y terminación
                cuidada, con criterio técnico según el estado inicial del vehículo.
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

export default ShowcaseGallery;
